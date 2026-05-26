const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      url: { type: String, required: true },
      alt: { type: String, default: '' },
    },
    mobileImage: {
      url: String,
      alt: String,
    },
    link: {
      type: String,
      default: '',
    },
    buttonText: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      enum: ['hero', 'promotional', 'category', 'sidebar'],
      default: 'hero',
      index: true,
    },
    type: {
      type: String,
      enum: ['hero', 'promotional', 'homepage_section'],
      default: 'hero',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startsAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ position: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
