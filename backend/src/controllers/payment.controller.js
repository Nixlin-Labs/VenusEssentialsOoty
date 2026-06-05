const crypto = require('crypto');
const Razorpay = require('razorpay');
const { Order, Payment, Product, ProductVariant, Coupon, Cart, User } = require('../models');
const env = require('../config/env');
const response = require('../utils/response');
const { sendOrderConfirmationEmail } = require('../utils/email');

// Lazy initialize Razorpay only when credentials are available
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay && env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id') {
    razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

/**
 * POST /api/payments/create-order — Create Razorpay order and Venus order.
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, couponCode, guestEmail, guestPhone, guestName } = req.body;

    // Calculate totals
    let subtotal = 0;
    let totalGST = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      const variant = await ProductVariant.findById(item.variantId);

      if (!product || !variant || product.status !== 'active' || !variant.isActive) {
        return response.badRequest(res, `Product or variant unavailable: ${product?.name || 'unknown'}`);
      }

      if (variant.stock < item.quantity) {
        return response.badRequest(res, `Insufficient stock for ${product.name} - ${variant.name}`);
      }

      const effectivePrice = variant.offerPrice && variant.offerPrice < variant.price
        ? variant.offerPrice : variant.price;
      const itemTotal = effectivePrice * item.quantity;
      const gstAmount = (itemTotal * product.gstPercentage) / (100 + product.gstPercentage);

      subtotal += itemTotal;
      totalGST += gstAmount;

      orderItems.push({
        product: product._id,
        variant: variant._id,
        productName: product.name,
        variantName: variant.name,
        sku: variant.sku,
        image: product.images[0]?.url || '',
        quantity: item.quantity,
        price: variant.price,
        offerPrice: variant.offerPrice,
        effectivePrice,
        total: itemTotal,
        gstPercentage: product.gstPercentage,
        hsnCode: product.hsnCode || '',
        weight: variant.weight,
      });
    }

    // Apply coupon
    let discount = 0;
    let couponData = null;
    let freeShipping = false;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const userId = req.user ? req.user._id : null;
        const validation = coupon.isValid(subtotal, userId);
        if (validation.valid) {
          discount = coupon.calculateDiscount(subtotal);
          freeShipping = coupon.freeShipping;
          couponData = { code: coupon.code, type: coupon.type, value: coupon.value };
        }
      }
    }

    // Shipping
    const isFreeShipping = freeShipping || subtotal >= env.FREE_SHIPPING_THRESHOLD;
    const shippingCharge = isFreeShipping ? 0 : env.DEFAULT_SHIPPING_CHARGE;

    const total = Math.round((subtotal - discount + shippingCharge) * 100) / 100;

    // Generate order number
    const orderNumber = await Order.generateOrderNumber();

    // Create order in DB
    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user._id : null,
      guestEmail: !req.user ? guestEmail : null,
      guestPhone: !req.user ? guestPhone : null,
      guestName: !req.user ? guestName : null,
      isGuestOrder: !req.user,
      items: orderItems,
      shippingAddress,
      subtotal,
      gst: {
        cgst: Math.round((totalGST / 2) * 100) / 100,
        sgst: Math.round((totalGST / 2) * 100) / 100,
        total: Math.round(totalGST * 100) / 100,
      },
      shippingCharge,
      discount: Math.round(discount * 100) / 100,
      coupon: couponData,
      total,
      orderStatus: 'pending_payment',
      paymentStatus: 'pending',
      statusHistory: [{ status: 'pending_payment', note: 'Order created, awaiting payment' }],
    });

    // Check if we are in mock simulation mode (no keys or placeholders)
    const isMockMode = !env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID === 'your_razorpay_key_id';

    let razorpayOrderId;
    if (isMockMode) {
      razorpayOrderId = `rzp_order_mock_${Math.random().toString(36).substring(2, 15)}`;
    } else {
      // Create Razorpay order
      const razorpayInstance = getRazorpayInstance();
      if (!razorpayInstance) {
        return response.serverError(res, 'Razorpay credentials not configured');
      }
      const razorpayOrder = await razorpayInstance.orders.create({
        amount: Math.round(total * 100), // Amount in paise
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
        },
      });
      razorpayOrderId = razorpayOrder.id;
    }

    // Create payment record
    await Payment.create({
      order: order._id,
      razorpayOrderId,
      amount: total,
      status: 'created',
    });

    return response.success(res, {
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        razorpayOrderId,
        amount: total,
        currency: 'INR',
        keyId: isMockMode ? 'rzp_test_mockkey' : env.RAZORPAY_KEY_ID,
      },
    }, 'Order created');
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: fulfill an order upon successful payment capture.
 * (Idempotent to handle dual triggers from frontend verify and backend webhook).
 */
const fulfillOrder = async (payment, razorpayPaymentId, razorpaySignature, details = {}) => {
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = 'captured';
  if (details.method) payment.method = details.method;
  if (details.bank) payment.bank = details.bank;
  if (details.wallet) payment.wallet = details.wallet;
  if (details.vpa) payment.vpa = details.vpa;
  await payment.save();

  const order = await Order.findById(payment.order);
  if (!order) return null;

  if (order.paymentStatus !== 'paid') {
    order.paymentStatus = 'paid';
    order.orderStatus = 'placed';
    order.statusHistory.push({ status: 'placed', note: 'Payment verified, order placed' });
    await order.save();

    // Deduct stock
    for (const item of order.items) {
      await ProductVariant.findByIdAndUpdate(item.variant, {
        $inc: { stock: -item.quantity },
      });
      await Product.findByIdAndUpdate(item.product, {
        $inc: { totalSold: item.quantity },
      });
    }

    // Update coupon usage
    if (order.coupon && order.coupon.code) {
      await Coupon.findOneAndUpdate(
        { code: order.coupon.code },
        {
          $inc: { usedCount: 1 },
          $push: { usedBy: { user: order.user, usedAt: new Date() } },
        }
      );
    }

    // Clear user cart
    if (order.user) {
      await Cart.findOneAndUpdate({ user: order.user }, { items: [], coupon: null });
    }

    // Send confirmation email
    const email = order.user
      ? (await User.findById(order.user))?.email
      : order.guestEmail;
    if (email) {
      try {
        await sendOrderConfirmationEmail(email, order);
      } catch (err) {
        console.error('Error sending order confirmation email:', err);
      }
    }
  }
  return order;
};

/**
 * POST /api/payments/verify — Verify Razorpay payment signature from client-side.
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isMockMode = razorpay_order_id && razorpay_order_id.startsWith('rzp_order_mock_');
    let isValid = false;

    if (isMockMode) {
      isValid = razorpay_signature === 'mock_signature_abc123';
    } else {
      // Verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      isValid = expectedSignature === razorpay_signature;
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return response.notFound(res, 'Payment');
    }

    if (isValid) {
      const order = await fulfillOrder(payment, razorpay_payment_id, razorpay_signature);
      
      return response.success(res, {
        data: {
          orderId: order?._id,
          orderNumber: order?.orderNumber,
          status: 'success',
        },
      }, 'Payment verified successfully');
    } else {
      payment.status = 'failed';
      payment.errorDescription = 'Signature verification failed';
      await payment.save();

      return response.badRequest(res, 'Payment verification failed');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/failed — Handle failed payment from client-side.
 */
exports.handleFailedPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, error: paymentError } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (payment) {
      payment.status = 'failed';
      payment.errorCode = paymentError?.code || '';
      payment.errorDescription = paymentError?.description || 'Payment failed';
      await payment.save();

      // Update order status
      const order = await Order.findById(payment.order);
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'failed';
        order.statusHistory.push({ status: 'pending_payment', note: `Payment failed: ${paymentError?.description || 'Unknown error'}` });
        await order.save();
      }
    }

    return response.success(res, {}, 'Payment failure recorded');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/webhook — Secure Razorpay Webhook handler.
 */
exports.handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing webhook signature' });
    }

    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return res.status(500).json({ success: false, message: 'Webhook secret not configured' });
    }

    // Verify signature using the raw body buffer
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.rawBody || JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('Invalid webhook signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;
    console.log(`Razorpay Webhook Event: ${event}`);

    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const payment = await Payment.findOne({ razorpayOrderId });
      if (!payment) {
        console.warn(`Payment not found for Razorpay Order: ${razorpayOrderId}`);
        return response.success(res, {}, 'Webhook handled (no payment record)');
      }

      if (payment.status === 'captured') {
        return response.success(res, {}, 'Webhook handled (already captured)');
      }

      await fulfillOrder(payment, razorpayPaymentId, signature, {
        method: paymentEntity.method,
        bank: paymentEntity.bank,
        wallet: paymentEntity.wallet,
        vpa: paymentEntity.vpa,
      });

      console.log(`Order ${payment.order} successfully captured via webhook`);
    } else if (event === 'payment.failed') {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      const payment = await Payment.findOne({ razorpayOrderId });
      if (payment && payment.status !== 'captured') {
        payment.status = 'failed';
        payment.errorCode = paymentEntity.error_code || '';
        payment.errorDescription = paymentEntity.error_description || 'Payment failed';
        await payment.save();

        const order = await Order.findById(payment.order);
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'failed';
          order.statusHistory.push({
            status: 'pending_payment',
            note: `Payment failed via webhook: ${paymentEntity.error_description || 'Unknown error'}`
          });
          await order.save();
        }
      }
    }

    return response.success(res, {}, 'Webhook processed successfully');
  } catch (error) {
    console.error('Webhook processing error:', error);
    next(error);
  }
};
