const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry for admin actions.
 * @param {object} params - Audit log parameters
 * @param {object} params.user - The user performing the action
 * @param {string} params.action - Action type (create, update, delete, etc.)
 * @param {string} params.entity - Entity type (product, order, etc.)
 * @param {string} params.entityId - Entity ID
 * @param {string} params.entityName - Entity name for display
 * @param {*} params.previousValue - Value before change
 * @param {*} params.updatedValue - Value after change
 * @param {string} params.description - Human-readable description
 * @param {object} params.req - Express request object (for IP and user agent)
 */
const createAuditLog = async ({
  user,
  action,
  entity,
  entityId,
  entityName = '',
  previousValue = null,
  updatedValue = null,
  description = '',
  req = null,
}) => {
  try {
    await AuditLog.create({
      user: user._id || user,
      userName: user.name || 'System',
      action,
      entity,
      entityId,
      entityName,
      previousValue,
      updatedValue,
      description,
      ipAddress: req ? (req.ip || req.connection?.remoteAddress || '') : '',
      userAgent: req ? (req.headers['user-agent'] || '') : '',
    });
  } catch (error) {
    // Don't let audit logging failures break the main flow
    console.error('Audit log creation failed:', error.message);
  }
};

/**
 * Middleware that auto-logs admin actions.
 * Attach to routes after the controller sends the response.
 */
const auditMiddleware = (action, entity) => {
  return (req, res, next) => {
    // Store audit params on request for the controller to populate
    req.audit = {
      action,
      entity,
      log: async (entityId, entityName, previousValue, updatedValue, description) => {
        await createAuditLog({
          user: req.user,
          action,
          entity,
          entityId,
          entityName,
          previousValue,
          updatedValue,
          description,
          req,
        });
      },
    };
    next();
  };
};

module.exports = { createAuditLog, auditMiddleware };
