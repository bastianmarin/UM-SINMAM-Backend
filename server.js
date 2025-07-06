const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const heartRateRoutes = require('./routes/heartRate');
const { initializeDataService } = require('./services/dataService');
const { logInfo, logError } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/heart-rate', heartRateRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist`
  });
});

// Error handler
app.use((err, req, res, next) => {
  logError(`Server error: ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Initialize data service
initializeDataService();

// Start server
app.listen(PORT, () => {
  logInfo(`🚀 SINMAM API server is running on port ${PORT}`);
  logInfo(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logInfo(`🌐 API Base URL: http://localhost:${PORT}`);
  logInfo(`📥 Ready to receive heart rate data via POST /api/heart-rate/reading`);
});

module.exports = app;
