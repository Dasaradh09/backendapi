const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Book = require('../models/Book');
const axios = require('axios'); 

//  Helper: Search books from Open Library API
const searchBooksOnOpenLibrary = async (query) => {
  try {
    const response = await axios.get('https://openlibrary.org/search.json', {
      params: { q: query }
    });

    // Extract and map results
    const books = response.data.docs.slice(0, 5).map(book => ({
      title: book.title,
      author: book.author_name ? book.author_name[0] : 'Unknown',
      publish_year: book.first_publish_year,
      isbn: book.isbn ? book.isbn[0] : 'N/A',
      cover_url: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null
    }));

    return books;

  } catch (error) {
    console.error('❌ Open Library API error:', error.message);
    return [];
  }
};

// Get All Customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get Customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Create New Customer
exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//  Update Customer by ID
exports.updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      req.body,
      { new: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // If the status is updated to 'shipped' or 'delivered', send a notification
    if (req.body.status === 'shipped' || req.body.status === 'delivered') {
      const customer = await Customer.findById(req.params.customerId);
      if (customer?.phone) {
        console.log(
          `📱 Sending SMS to ${customer.phone}: Hi ${customer.name}, your order status has been updated to: ${req.body.status}.`
        );
       
      }
    }

    res.json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//  Delete Customer by ID
exports.deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.customerId);
    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get Recommendations for Customer (Internal + External)
exports.getRecommendations = async (req, res) => {
  const { customerId } = req.params;

  try {
    // Get orders by customer
    const orders = await Order.find({ customerId });

    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found for this customer' });
    }

    //  Extract book IDs they’ve already purchased
    const orderedBookIds = orders.flatMap(order =>
      order.items.map(item => item.bookId.toString())
    );

    //  Internal Recommendations (books they haven't purchased yet)
    const internalRecommendations = await Book.find({
      _id: { $nin: orderedBookIds }
    }).limit(5);

    //  External Recommendations (dynamic query based on previous books)
    const previousTitles = await Book.find({ _id: { $in: orderedBookIds } });
    const keywords = previousTitles.map(book => book.title.split(' ')[0]).join(' ');
    const externalRecommendations = await searchBooksOnOpenLibrary(keywords);

    // Shuffle both sets for randomness
    const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());

    res.json({
      customerId,
      internalRecommendations: shuffle(internalRecommendations),
      externalRecommendations: shuffle(externalRecommendations)
    });

  } catch (error) {
    console.error('❌ Error fetching recommendations:', error.message);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
};

//  Get all orders for a customer
exports.getOrdersByCustomerId = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.customerId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
