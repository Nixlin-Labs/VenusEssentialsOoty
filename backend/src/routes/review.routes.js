const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const reviewController = require('../controllers/review.controller');

const router = express.Router();

router.post('/',
  auth,
  [
    body('productId').isMongoId(),
    body('orderId').isMongoId(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').trim().isLength({ min: 10, max: 1000 }),
    body('title').optional().trim().isLength({ max: 100 }),
  ],
  validate,
  reviewController.createReview
);

router.get('/product/:productId', reviewController.getProductReviews);

module.exports = router;
