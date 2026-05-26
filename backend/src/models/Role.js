const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Available permissions
roleSchema.statics.PERMISSIONS = {
  // Product
  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_EDIT: 'product:edit',
  PRODUCT_DELETE: 'product:delete',

  // Category
  CATEGORY_VIEW: 'category:view',
  CATEGORY_CREATE: 'category:create',
  CATEGORY_EDIT: 'category:edit',
  CATEGORY_DELETE: 'category:delete',

  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_UPDATE: 'inventory:update',

  // Order
  ORDER_VIEW: 'order:view',
  ORDER_UPDATE: 'order:update',
  ORDER_REFUND: 'order:refund',

  // Customer
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_BLOCK: 'customer:block',

  // Coupon
  COUPON_VIEW: 'coupon:view',
  COUPON_CREATE: 'coupon:create',
  COUPON_EDIT: 'coupon:edit',
  COUPON_DELETE: 'coupon:delete',

  // Review
  REVIEW_VIEW: 'review:view',
  REVIEW_MODERATE: 'review:moderate',

  // CMS
  CMS_VIEW: 'cms:view',
  CMS_CREATE: 'cms:create',
  CMS_EDIT: 'cms:edit',
  CMS_DELETE: 'cms:delete',

  // Banner
  BANNER_VIEW: 'banner:view',
  BANNER_CREATE: 'banner:create',
  BANNER_EDIT: 'banner:edit',
  BANNER_DELETE: 'banner:delete',

  // Report
  REPORT_VIEW: 'report:view',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',

  // Roles
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_EDIT: 'role:edit',
  ROLE_DELETE: 'role:delete',

  // Users
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
};

module.exports = mongoose.model('Role', roleSchema);
