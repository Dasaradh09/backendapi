const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// CREATE an order
router.post('/', orderController.createOrder);

// GET all orders
router.get('/', orderController.getAllOrders);

// GET an order by ID
router.get('/:orderId', orderController.getOrderById);

// UPDATE order status
router.put('/:orderId/status', orderController.updateOrderStatus);

// DELETE an order
router.delete('/:orderId', orderController.deleteOrder);

// GET tracking info
router.get('/:orderId/tracking', orderController.getTrackingInfo);

module.exports = router;