const express = require('express');
const { auth } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');

const router = express.Router();

router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrderById);
router.post('/:id/cancel', auth, orderController.cancelOrder);
router.get('/:id/invoice', auth, orderController.downloadInvoice);
router.get('/:id/track', auth, orderController.trackOrder);

module.exports = router;
