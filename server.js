const express = require('express');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const pollRoutes = require('./routes/polls');

class PollServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.mongoUrl = process.env.MONGODB_URI;
    this.dbName = process.env.DB_NAME;
    this.client = null;
    this.db = null;
  }

  async initialize() {
    try {
      // Setup middleware
      this.setupMiddleware();

      // Connect to MongoDB
      await this.connectToMongoDB();

      // Setup routes
      this.setupRoutes();

      // Start server
      this.startServer();
    } catch (error) {
      console.error('Failed to initialize server:', error);
      process.exit(1);
    }
  }

  setupMiddleware() {
    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Simple request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  async connectToMongoDB() {
    try {
      this.client = new MongoClient(this.mongoUrl);
      await this.client.connect();
      console.log('Connected to MongoDB');

      this.db = this.client.db(this.dbName);
      
      // Create text index for search functionality
      await this.db.collection('polls').createIndex({ question: 'text' });
      
      // Make db available to routes
      this.app.locals.db = this.db;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString()
      });
    });

    // API routes
    this.app.use('/polls', pollRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
      });
    });

    // Error handler
    this.app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong'
      });
    });
  }

  startServer() {
    this.app.listen(this.port, () => {
      console.log(`Poll microservice running on port ${this.port}`);
      console.log(`Health check: http://localhost:${this.port}/health`);
    });
  }

  async shutdown() {
    console.log('Shutting down server...');
    if (this.client) {
      await this.client.close();
    }
    process.exit(0);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (global.pollServer) {
    await global.pollServer.shutdown();
  }
});

// Initialize and start server
const pollServer = new PollServer();
global.pollServer = pollServer;
pollServer.initialize();