const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers'); 

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const customerRoutes = require('./routes/customerRoutes');
const bookRoutes = require('./routes/bookRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/customers', customerRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => ({ req }),
  });

  await server.start();

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );
}

startApolloServer();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
