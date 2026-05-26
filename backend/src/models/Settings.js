const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    group: {
      type: String,
      enum: ['general', 'tax', 'shipping', 'invoice', 'seo', 'contact', 'social'],
      default: 'general',
    },
    label: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

settingsSchema.index({ group: 1 });

module.exports = mongoose.model('Settings', settingsSchema);
