const express = require('express');
const { auth } = require('../middleware/auth');
const wishlistController = require('../controllers/wishlist.controller');

const router = express.Router();

router.get('/', auth, wishlistController.getWishlist);
router.post('/toggle', auth, wishlistController.toggleWishlist);
router.post('/move-to-cart', auth, wishlistController.moveToCart);

module.exports = router;
