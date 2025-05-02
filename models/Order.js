const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  phone: { type: String },
  orderDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  items: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
      title: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true } 
    }
  ],
  totalPrice: { type: Number }, 
  trackingNumber: { type: String },
  carrierCode: { type: String }
});

module.exports = mongoose.model('Order', orderSchema);