const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const triageRoutes = require('./routes/triageRoutes');
const priorityRoutes = require('./routes/priorityRoutes');
const queueRoutes = require('./routes/queueRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/triage', triageRoutes);
app.use('/api/priority', priorityRoutes);
app.use('/api/queues', queueRoutes);

// Health-check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Patient Flow Backend is running!'
  });
});

// 404 handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
  }
};

startServer();
