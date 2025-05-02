const Order = require('../models/Order');
const Book = require('../models/Book');
const sendSMS = require('../services/smsService');

// Utility function to generate tracking numbers
const generateTrackingNumber = () => {
  const timestamp = Date.now().toString();
  const randomDigits = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${timestamp}${randomDigits}`;
};

//  Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { customerId, items, phone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided in the order.' });
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const book = await Book.findById(item.bookId);

      if (!book) {
        return res.status(404).json({ message: `Book not found: ${item.bookId}` });
      }

      if (!book.title || book.price === undefined) {
        return res.status(400).json({ message: `Title and price are required.` });
      }

      orderItems.push({
        bookId: book._id,
        title: book.title,
        quantity: item.quantity,
        price: book.price
      });

      totalPrice += book.price * item.quantity;

      // Update stock
      book.stock -= item.quantity;
      await book.save();
    }

    const newOrder = new Order({
      customerId,
      phone,
      items: orderItems,
      totalPrice,
      trackingNumber: generateTrackingNumber(),
      carrierCode: 'fedex'
    });

    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('❌ Order creation failed:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

//  Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customerId').sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

//  Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('customerId');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

//  Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    //  Send SMS notification
    if (order && order.phone) {
      try {
        await sendSMS(order.phone, `📦 Your order ${order._id} status has been updated to: ${order.status}`);
        console.log(`✅ SMS sent to ${order.phone}`);
      } catch (smsErr) {
        console.error('❌ Failed to send SMS:', smsErr.message);
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

//  Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

//  Get tracking info
exports.getTrackingInfo = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order || !order.trackingNumber) {
      return res.status(404).json({ message: 'Tracking information not found' });
    }

    res.json({
      tracking_number: order.trackingNumber,
      carrier_code: order.carrierCode,
      status_description: order.status,
      tracking_url: `https://www.fedex.com/fedextrack/?tracknumbers=${order.trackingNumber}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tracking info' });
  }
};

module.exports = {
  createOrder: exports.createOrder,
  getAllOrders: exports.getAllOrders,
  getOrderById: exports.getOrderById,
  updateOrderStatus: exports.updateOrderStatus,
  deleteOrder: exports.deleteOrder,
  getTrackingInfo: exports.getTrackingInfo
};