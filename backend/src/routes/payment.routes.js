const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { auth, optionalAuth } = require('../middleware/auth');
const { paymentLimiter } = require('../config/rateLimiter');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

router.post('/create-order',
  paymentLimiter,
  optionalAuth,
  [
    body('items').isArray({ min: 1 }).withMessage('Items are required'),
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  ],
  validate,
  paymentController.createOrder
);

router.post('/verify',
  optionalAuth,
  [
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
  ],
  validate,
  paymentController.verifyPayment
);

router.post('/failed', optionalAuth, paymentController.handleFailedPayment);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
