const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

/**
 * Authentication middleware — verifies JWT and attaches user to request.
 * Usage: router.get('/protected', auth, handler)
 */
const auth = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    // Get user from DB
    const user = await User.findById(decoded.userId).select('-password -otp -refreshTokens');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    next(error);
  }
};

/**
 * Optional auth — attaches user if token present, but doesn't block.
 * Useful for routes that work for both guests and authenticated users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('-password -otp -refreshTokens');
      if (user && !user.isBlocked) {
        req.user = user;
      }
    }

    next();
  } catch {
    // Token invalid or expired — proceed as guest
    next();
  }
};

/**
 * Admin auth — ensures user is an admin role.
 */
const adminAuth = async (req, res, next) => {
  try {
    // First run normal auth
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.user) return; // Response already sent by auth middleware

    const adminRoles = ['super_admin', 'manager', 'inventory_staff', 'content_manager'];
    if (!adminRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { auth, optionalAuth, adminAuth };
