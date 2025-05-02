const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },   
  author: String,
  price: { type: Number, required: true },   
  stock: { type: Number, default: 0 },
  description: String,
  isbn: { type: String },
  coverImage: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema);