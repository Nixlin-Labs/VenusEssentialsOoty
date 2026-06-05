const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { authLimiter, otpLimiter } = require('../config/rateLimiter');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// --- Public routes ---

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Password must include uppercase, lowercase, number, and special character'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  authController.verifyOTP
);

router.post(
  '/resend-otp',
  otpLimiter,
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  validate,
  authController.resendOTP
);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Password must include uppercase, lowercase, number, and special character'),
  ],
  validate,
  authController.resetPassword
);

router.post(
  '/admin/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  validate,
  authController.adminForgotPassword
);

router.post(
  '/admin/reset-password',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Password must include uppercase, lowercase, number, and special character'),
  ],
  validate,
  authController.adminResetPassword
);

router.post('/refresh-token', authController.refreshToken);

// --- Protected routes ---

router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getProfile);
router.put(
  '/profile',
  auth,
  upload.single('avatar'),
  [
    body('name').optional().trim().isLength({ max: 100 }),
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').optional({ checkFalsy: true }).matches(/^[6-9]\d{9}$/),
    body('avatar').optional({ checkFalsy: true }).isString().trim(),
  ],
  validate,
  authController.updateProfile
);
router.put(
  '/change-password',
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Password must include uppercase, lowercase, number, and special character'),
  ],
  validate,
  authController.changePassword
);

// --- Admin login ---
router.post(
  '/admin/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.adminLogin
);

module.exports = router;
