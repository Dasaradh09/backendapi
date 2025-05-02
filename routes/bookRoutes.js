const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Get all books
router.get('/', bookController.getAllBooks);

// Get a book by ID
router.get('/:bookId', bookController.getBookById);

// Create a new book
router.post('/', bookController.createBook);

// Update a book
router.put('/:bookId', bookController.updateBook);

// Delete a book
router.delete('/:bookId', bookController.deleteBook);

module.exports = router;
