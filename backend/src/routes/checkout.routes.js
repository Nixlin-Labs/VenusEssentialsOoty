const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { auth, optionalAuth } = require('../middleware/auth');
const checkoutController = require('../controllers/checkout.controller');

const router = express.Router();

router.post('/validate', optionalAuth, checkoutController.validateCheckout);

router.post('/apply-coupon',
  optionalAuth,
  [body('code').trim().notEmpty().withMessage('Coupon code is required')],
  validate,
  checkoutController.applyCoupon
);

router.post('/remove-coupon', optionalAuth, checkoutController.removeCoupon);

router.post('/calculate', optionalAuth, checkoutController.calculateTotals);

module.exports = router;
