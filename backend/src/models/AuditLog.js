const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'create', 'update', 'delete', 'status_change',
        'stock_update', 'refund', 'block', 'unblock',
        'role_change', 'approve', 'reject', 'login',
        'settings_update', 'coupon_create', 'coupon_update',
      ],
    },
    entity: {
      type: String,
      required: true,
      enum: [
        'product', 'category', 'order', 'user', 'coupon',
        'review', 'banner', 'cms_page', 'role', 'settings',
        'inventory', 'payment',
      ],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entityName: {
      type: String,
      default: '',
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    updatedValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
