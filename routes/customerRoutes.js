const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Recommendations route callback must be defined!
router.get('/:customerId/recommendations', customerController.getRecommendations);
router.get('/:customerId/orders', customerController.getOrdersByCustomerId);

router.get('/', customerController.getAllCustomers);
router.get('/:customerId', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:customerId', customerController.updateCustomer);
router.delete('/:customerId', customerController.deleteCustomer);

module.exports = router;
