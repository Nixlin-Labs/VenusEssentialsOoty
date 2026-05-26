const crypto = require('crypto');
const Razorpay = require('razorpay');
const { Order, Payment, Product, ProductVariant, Coupon, Cart } = require('../models');
const env = require('../config/env');
const response = require('../utils/response');
const { sendOrderConfirmationEmail } = require('../utils/email');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

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

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Amount in paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    // Create payment record
    await Payment.create({
      order: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      status: 'created',
    });

    return response.success(res, {
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount: total,
        currency: 'INR',
        keyId: env.RAZORPAY_KEY_ID,
      },
    }, 'Order created');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/verify — Verify Razorpay payment signature.
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    // Update payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return response.notFound(res, 'Payment');
    }

    if (isValid) {
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = 'captured';
      await payment.save();

      // Update order
      const order = await Order.findById(payment.order);
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
        ? (await require('../models/User').findById(order.user))?.email
        : order.guestEmail;
      if (email) {
        await sendOrderConfirmationEmail(email, order);
      }

      return response.success(res, {
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
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
 * POST /api/payments/failed — Handle failed payment.
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
      if (order) {
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
