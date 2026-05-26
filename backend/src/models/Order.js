const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true,
  },
  productName: { type: String, required: true },
  variantName: { type: String, required: true },
  sku: { type: String, required: true },
  image: { type: String, default: '' },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: { type: Number, required: true },
  offerPrice: { type: Number, default: null },
  effectivePrice: { type: Number, required: true },
  total: { type: Number, required: true },
  gstPercentage: { type: Number, required: true },
  hsnCode: { type: String, default: '' },
  weight: {
    value: Number,
    unit: String,
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: '' },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    guestEmail: {
      type: String,
      default: null,
    },
    guestPhone: {
      type: String,
      default: null,
    },
    guestName: {
      type: String,
      default: null,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    gst: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    coupon: {
      code: String,
      type: { type: String, enum: ['flat', 'percentage'] },
      value: Number,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'pending_payment',
        'placed',
        'confirmed',
        'packed',
        'dispatched',
        'delivered',
        'cancelled',
        'rejected',
        'refunded',
      ],
      default: 'pending_payment',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    courierName: {
      type: String,
      default: '',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    invoiceNumber: {
      type: String,
      default: null,
    },
    invoicePath: {
      type: String,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'admin', null],
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'processed', 'failed'],
      default: 'none',
    },
    notes: {
      type: String,
      default: '',
    },
    isGuestOrder: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number: VE-2026-000001
orderSchema.statics.generateOrderNumber = async function () {
  const year = new Date().getFullYear();
  const lastOrder = await this.findOne({
    orderNumber: new RegExp(`^VE-${year}-`),
  })
    .sort({ createdAt: -1 })
    .select('orderNumber');

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2], 10);
    sequence = lastSequence + 1;
  }

  return `VE-${year}-${sequence.toString().padStart(6, '0')}`;
};

// Check if order can be cancelled
orderSchema.methods.canBeCancelled = function () {
  const cancellableStatuses = ['placed', 'confirmed', 'packed'];
  return cancellableStatuses.includes(this.orderStatus);
};

module.exports = mongoose.model('Order', orderSchema);
