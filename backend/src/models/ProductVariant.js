const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    offerPrice: {
      type: Number,
      min: [0, 'Offer price cannot be negative'],
      default: null,
    },
    weight: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ['g', 'kg', 'ml', 'l', 'pcs'],
        default: 'g',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
productVariantSchema.index({ product: 1, isActive: 1 });
productVariantSchema.index({ sku: 1 });

// Virtual: Check if low stock
productVariantSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

// Virtual: Check if out of stock
productVariantSchema.virtual('isOutOfStock').get(function () {
  return this.stock === 0;
});

// Virtual: Get effective price (offer price or regular price)
productVariantSchema.virtual('effectivePrice').get(function () {
  return this.offerPrice && this.offerPrice < this.price ? this.offerPrice : this.price;
});

// Virtual: Discount percentage
productVariantSchema.virtual('discountPercentage').get(function () {
  if (this.offerPrice && this.offerPrice < this.price) {
    return Math.round(((this.price - this.offerPrice) / this.price) * 100);
  }
  return 0;
});

module.exports = mongoose.model('ProductVariant', productVariantSchema);
