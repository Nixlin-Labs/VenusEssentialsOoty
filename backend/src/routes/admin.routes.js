const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { adminAuth } = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { upload } = require('../middleware/upload');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// ==================== DASHBOARD ====================
router.get('/dashboard', adminController.getDashboard);

// ==================== PRODUCTS ====================
router.get('/products', rbac('product:view'), adminController.getProducts);
router.get('/products/:id', rbac('product:view'), adminController.getProductById);
router.post('/products',
  rbac('product:create'),
  upload.array('images', 10),
  adminController.createProduct
);
router.put('/products/:id',
  rbac('product:edit'),
  upload.array('images', 10),
  adminController.updateProduct
);
router.delete('/products/:id', rbac('product:delete'), adminController.deleteProduct);

// ==================== VARIANTS ====================
router.post('/products/:productId/variants', rbac('product:create'), adminController.createVariant);
router.put('/variants/:id', rbac('product:edit'), adminController.updateVariant);
router.delete('/variants/:id', rbac('product:delete'), adminController.deleteVariant);

// ==================== CATEGORIES ====================
router.get('/categories', rbac('category:view'), adminController.getCategories);
router.post('/categories',
  rbac('category:create'),
  upload.single('image'),
  adminController.createCategory
);
router.put('/categories/:id',
  rbac('category:edit'),
  upload.single('image'),
  adminController.updateCategory
);
router.delete('/categories/:id', rbac('category:delete'), adminController.deleteCategory);

// ==================== INVENTORY ====================
router.get('/inventory', rbac('inventory:view'), adminController.getInventory);
router.put('/inventory/:variantId', rbac('inventory:update'), adminController.updateStock);
router.get('/inventory/low-stock', rbac('inventory:view'), adminController.getLowStockAlerts);

// ==================== ORDERS ====================
router.get('/orders', rbac('order:view'), adminController.getOrders);
router.get('/orders/:id', rbac('order:view'), adminController.getOrderById);
router.put('/orders/:id/status', rbac('order:update'), adminController.updateOrderStatus);
router.post('/orders/:id/refund', rbac('order:refund'), adminController.processRefund);

// ==================== CUSTOMERS ====================
router.get('/customers', rbac('customer:view'), adminController.getCustomers);
router.get('/customers/:id', rbac('customer:view'), adminController.getCustomerById);
router.put('/customers/:id/block', rbac('customer:block'), adminController.toggleBlockCustomer);

// ==================== COUPONS ====================
router.get('/coupons', rbac('coupon:view'), adminController.getCoupons);
router.post('/coupons', rbac('coupon:create'), adminController.createCoupon);
router.put('/coupons/:id', rbac('coupon:edit'), adminController.updateCoupon);
router.delete('/coupons/:id', rbac('coupon:delete'), adminController.deleteCoupon);

// ==================== REVIEWS ====================
router.get('/reviews', rbac('review:view'), adminController.getReviews);
router.put('/reviews/:id/moderate', rbac('review:moderate'), adminController.moderateReview);

// ==================== CMS PAGES ====================
router.get('/cms/pages', rbac('cms:view'), adminController.getCmsPages);
router.post('/cms/pages', rbac('cms:create'), adminController.createCmsPage);
router.put('/cms/pages/:id', rbac('cms:edit'), adminController.updateCmsPage);
router.delete('/cms/pages/:id', rbac('cms:delete'), adminController.deleteCmsPage);

// ==================== BANNERS ====================
router.get('/banners', rbac('banner:view'), adminController.getBanners);
router.post('/banners', rbac('banner:create'), upload.single('image'), adminController.createBanner);
router.put('/banners/:id', rbac('banner:edit'), upload.single('image'), adminController.updateBanner);
router.delete('/banners/:id', rbac('banner:delete'), adminController.deleteBanner);

// ==================== REPORTS ====================
router.get('/reports/sales', rbac('report:view'), adminController.getSalesReport);
router.get('/reports/revenue', rbac('report:view'), adminController.getRevenueReport);
router.get('/reports/products', rbac('report:view'), adminController.getProductReport);

// ==================== ROLES ====================
router.get('/roles', rbac('role:view'), adminController.getRoles);
router.post('/roles', rbac('role:create'), adminController.createRole);
router.put('/roles/:id', rbac('role:edit'), adminController.updateRole);

// ==================== USERS (Admin) ====================
router.get('/users', rbac('user:view'), adminController.getAdminUsers);
router.post('/users', rbac('user:create'), adminController.createAdminUser);
router.put('/users/:id', rbac('user:edit'), adminController.updateAdminUser);

// ==================== SETTINGS ====================
router.get('/settings', rbac('settings:view'), adminController.getSettings);
router.put('/settings', rbac('settings:edit'), adminController.updateSettings);

// ==================== AUDIT LOGS ====================
router.get('/audit-logs', adminController.getAuditLogs);

// ==================== NEWSLETTER SUBSCRIBERS ====================
router.get('/newsletter/subscribers', adminController.getNewsletterSubscribers);
router.put('/newsletter/subscribers/:id/toggle', adminController.toggleNewsletterSubscriber);
router.delete('/newsletter/subscribers/:id', adminController.deleteNewsletterSubscriber);

// ==================== ENQUIRIES ====================
router.get('/enquiries', adminController.getEnquiries);
router.put('/enquiries/:id/read', adminController.toggleEnquiryRead);
router.delete('/enquiries/:id', adminController.deleteEnquiry);

// ==================== TESTIMONIALS ====================
router.get('/testimonials', adminController.getTestimonials);
router.post('/testimonials', adminController.createTestimonial);
router.put('/testimonials/:id', adminController.updateTestimonial);
router.delete('/testimonials/:id', adminController.deleteTestimonial);
router.patch('/testimonials/:id/toggle', adminController.toggleTestimonialStatus);

module.exports = router;
