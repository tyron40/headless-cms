import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import GraphQL schema and resolvers
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { getUser } from './utils/auth.js';

// Load environment variables
dotenv.config();

// Create Express app and HTTP server
const app = express();
const httpServer = http.createServer(app);

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Connect to MongoDB with fallback to in-memory database
const connectDB = async () => {
  try {
    // Skip trying to connect to MongoDB and use in-memory database directly
    console.log('Using in-memory database for development');
    
    // Setup in-memory MongoDB for development
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB');
    
    // Create initial admin user
    const { User } = await import('./models/index.js');
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      });
      
      await admin.save();
      console.log('Created default admin user:');
      console.log('Email: admin@example.com');
      console.log('Password: password123');
    }
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
};

// Start the server
const startServer = async () => {
  try {
    await connectDB();
    await server.start();
    
    // Apply middleware
    app.use(
      '/graphql',
      cors(),
      bodyParser.json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          // Get user from token
          const token = req.headers.authorization || '';
          const user = await getUser(token);
          return { user };
        },
      }),
    );
    
    // Start the HTTP server
    const PORT = process.env.PORT || 4000;
    await new Promise(resolve => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();