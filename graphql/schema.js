const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Book {
    _id: ID!
    title: String!
    author: String!
    price: Float!
    stock: Int!
    isbn: String
  }

  type Customer {
    _id: ID!
    name: String!
    email: String!
  }

  type OrderItem {
    bookId: ID!
    title: String!
    quantity: Int!
    price: Float!
  }

  type Order {
    _id: ID!
    customerId: ID!
    items: [OrderItem!]!
    totalPrice: Float!
    status: String!
    orderDate: String!
  }

  type Query {
    books: [Book]
    book(id: ID!): Book
    customers: [Customer]
    customer(id: ID!): Customer
    orders: [Order]
    order(id: ID!): Order
  }

  type Mutation {
    createBook(title: String!, author: String!, price: Float!, stock: Int!, isbn: String): Book
    updateBook(id: ID!, stock: Int): Book
    deleteBook(id: ID!): String

    createCustomer(name: String!, email: String!): Customer

    createOrder(customerId: ID!, items: [OrderInput!]!): Order
    updateOrderStatus(orderId: ID!, status: String!): Order
  }

  input OrderInput {
    bookId: ID!
    quantity: Int!
  }
`;

module.exports = typeDefs;