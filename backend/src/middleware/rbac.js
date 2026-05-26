/**
 * Role-Based Access Control (RBAC) middleware.
 * Checks if the authenticated user has the required permission(s).
 *
 * Usage:
 *   router.put('/products/:id', adminAuth, rbac('product:edit'), handler)
 *   router.delete('/orders/:id', adminAuth, rbac(['order:update', 'order:refund']), handler)
 */
const rbac = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Super admin has all permissions
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Role-based default permissions
    const rolePermissions = getRolePermissions(req.user.role);

    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const hasPermission = permissions.some((perm) => rolePermissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
};

/**
 * Get default permissions for each role.
 * Per SRS Section 3: Super Admin, Manager, Inventory Staff, Content Manager.
 */
function getRolePermissions(role) {
  const permissionMap = {
    super_admin: ['*'], // All permissions

    manager: [
      'product:view', 'product:create', 'product:edit', 'product:delete',
      'category:view', 'category:create', 'category:edit', 'category:delete',
      'inventory:view', 'inventory:update',
      'order:view', 'order:update', 'order:refund',
      'review:view', 'review:moderate',
      'coupon:view', 'coupon:create', 'coupon:edit', 'coupon:delete',
      'customer:view',
      'report:view',
    ],

    inventory_staff: [
      'product:view',
      'inventory:view', 'inventory:update',
    ],

    content_manager: [
      'cms:view', 'cms:create', 'cms:edit', 'cms:delete',
      'banner:view', 'banner:create', 'banner:edit', 'banner:delete',
    ],
  };

  return permissionMap[role] || [];
}

module.exports = rbac;
