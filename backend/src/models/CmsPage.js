const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Page title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Page content is required'],
    },
    excerpt: {
      type: String,
      default: '',
    },
    featuredImage: {
      url: String,
      alt: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seoTitle: {
      type: String,
      maxlength: 70,
    },
    seoDescription: {
      type: String,
      maxlength: 160,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    template: {
      type: String,
      enum: ['default', 'about', 'heritage', 'contact', 'policy'],
      default: 'default',
    },
  },
  {
    timestamps: true,
  }
);

cmsPageSchema.index({ slug: 1 });
cmsPageSchema.index({ isActive: 1 });

module.exports = mongoose.model('CmsPage', cmsPageSchema);
