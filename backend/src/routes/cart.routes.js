const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.get('/', auth, cartController.getCart);

router.post('/add',
  auth,
  [
    body('productId').isMongoId().withMessage('Valid product ID required'),
    body('variantId').isMongoId().withMessage('Valid variant ID required'),
    body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  ],
  validate,
  cartController.addToCart
);

router.put('/update',
  auth,
  [
    body('productId').isMongoId(),
    body('variantId').isMongoId(),
    body('quantity').isInt({ min: 1, max: 10 }),
  ],
  validate,
  cartController.updateCartItem
);

router.delete('/remove/:variantId', auth, cartController.removeFromCart);

router.post('/sync', auth, cartController.syncGuestCart);

router.delete('/clear', auth, cartController.clearCart);

module.exports = router;
