const path = require('path');
const fs = require('fs');
const { Order, ProductVariant, Payment } = require('../models');
const { paginate } = require('../utils/pagination');
const response = require('../utils/response');
const { generateInvoicePDF } = require('../utils/invoice');

/**
 * GET /api/orders
 */
exports.getOrders = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.orderStatus = status;

    const query = Order.find(filter).select('-statusHistory');
    const result = await paginate(query, { page, limit, sort: { createdAt: -1 } });

    return response.success(res, { data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return response.notFound(res, 'Order');

    return response.success(res, { data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/:id/cancel
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) return response.notFound(res, 'Order');

    if (!order.canBeCancelled()) {
      return response.badRequest(res, 'Order cannot be cancelled after dispatch');
    }

    order.orderStatus = 'cancelled';
    order.cancelledBy = 'customer';
    order.cancellationReason = reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'cancelled',
      note: `Cancelled by customer: ${reason || 'No reason provided'}`,
      updatedBy: req.user._id,
    });

    // Restore stock
    for (const item of order.items) {
      await ProductVariant.findByIdAndUpdate(item.variant, {
        $inc: { stock: item.quantity },
      });
    }

    // Initiate refund if payment was made
    if (order.paymentStatus === 'paid') {
      order.refundStatus = 'pending';
      order.refundAmount = order.total;

      const payment = await Payment.findOne({ order: order._id, status: 'captured' });
      if (payment) {
        try {
          const Razorpay = require('razorpay');
          const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });
          const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
            amount: Math.round(order.total * 100),
          });

          payment.refundId = refund.id;
          payment.refundAmount = order.total;
          payment.refundStatus = 'processed';
          await payment.save();

          order.paymentStatus = 'refunded';
          order.refundStatus = 'processed';
        } catch (refundError) {
          console.error('Refund failed:', refundError.message);
          order.refundStatus = 'pending';
        }
      }
    }

    await order.save();

    return response.success(res, { data: order }, 'Order cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id/invoice
 */
exports.downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return response.notFound(res, 'Order');

    if (!['placed', 'confirmed', 'packed', 'dispatched', 'delivered'].includes(order.orderStatus)) {
      return response.badRequest(res, 'Invoice not available for this order');
    }

    // Generate invoice if not already generated
    if (!order.invoicePath || !fs.existsSync(path.join(__dirname, '..', '..', order.invoicePath))) {
      const invoiceData = await generateInvoicePDF(order);
      order.invoiceNumber = invoiceData.invoiceNumber;
      order.invoicePath = invoiceData.filePath;
      await order.save();
    }

    const absolutePath = path.join(__dirname, '..', '..', order.invoicePath);
    res.download(absolutePath, `${order.invoiceNumber}.pdf`);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id/track
 */
exports.trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .select('orderNumber orderStatus statusHistory courierName trackingNumber');

    if (!order) return response.notFound(res, 'Order');

    return response.success(res, { data: order });
  } catch (error) {
    next(error);
  }
};
