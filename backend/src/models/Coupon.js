const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['flat', 'percentage'],
      required: [true, 'Discount type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startsAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, expiresAt: 1 });

// Check if coupon is valid
couponSchema.methods.isValid = function (orderTotal, userId) {
  const now = new Date();

  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (now > this.expiresAt) return { valid: false, message: 'Coupon has expired' };
  if (now < this.startsAt) return { valid: false, message: 'Coupon is not yet active' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  if (orderTotal < this.minOrderValue) {
    return { valid: false, message: `Minimum order value of ₹${this.minOrderValue} required` };
  }

  if (userId && this.perUserLimit) {
    const userUsage = this.usedBy.filter(
      (u) => u.user.toString() === userId.toString()
    ).length;
    if (userUsage >= this.perUserLimit) {
      return { valid: false, message: 'You have already used this coupon' };
    }
  }

  return { valid: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function (orderTotal) {
  let discount = 0;

  if (this.type === 'flat') {
    discount = this.value;
  } else if (this.type === 'percentage') {
    discount = (orderTotal * this.value) / 100;
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }
  }

  return Math.min(discount, orderTotal);
};

module.exports = mongoose.model('Coupon', couponSchema);
