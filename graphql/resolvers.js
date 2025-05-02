const Book = require('../models/Book');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const resolvers = {
  Query: {
    books: async () => {
        return await Book.find();
      },
    book: (_, { id }) => Book.findById(id),
    customers: () => Customer.find(),
    customer: (_, { id }) => Customer.findById(id),
    orders: () => Order.find(),
    order: (_, { id }) => Order.findById(id),
  },

  Mutation: {
    createBook: (_, { title, author, price, stock, isbn }) =>
      Book.create({ title, author, price, stock, isbn }),

    updateBook: async (_, { id, stock }) => {
      const updated = await Book.findByIdAndUpdate(id, { stock }, { new: true });
      return updated;
    },

    deleteBook: async (_, { id }) => {
      await Book.findByIdAndDelete(id);
      return 'Book deleted successfully';
    },

    createCustomer: (_, { name, email }) =>
      Customer.create({ name, email }),

    createOrder: async (_, { customerId, items }) => {
      let totalPrice = 0;
      const orderItems = [];

      for (const item of items) {
        const book = await Book.findById(item.bookId);
        if (!book) throw new Error(`Book not found: ${item.bookId}`);

        if (book.stock < item.quantity)
          throw new Error(`Insufficient stock for ${book.title}`);

        book.stock -= item.quantity;
        await book.save();

        totalPrice += book.price * item.quantity;

        orderItems.push({
          bookId: book._id,
          title: book.title,
          quantity: item.quantity,
          price: book.price
        });
      }

      const order = await Order.create({
        customerId,
        items: orderItems,
        totalPrice
      });

      return order;
    },

    updateOrderStatus: async (_, { orderId, status }) => {
      return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    }
  }
};

module.exports = resolvers;