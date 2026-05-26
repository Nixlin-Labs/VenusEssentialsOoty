const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.get('/', optionalAuth, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/best-sellers', productController.getBestSellers);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/search', productController.searchProducts);
router.get('/:slug', optionalAuth, productController.getProductBySlug);

module.exports = router;
