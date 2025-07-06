/**
 * Mock server for SINMAM API development
 * This file provides a simple mock server that generates random heart rate data
 * for testing purposes during development.
 * 
 */

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data generation functions
function generateRandomHeartRate() {
  // Generate heart rate with some probability of being risky
  const isRisky = Math.random() < 0.3; // 30% chance of risky reading
  
  if (isRisky) {
    // Generate risky reading
    return Math.random() < 0.8 ? 
      Math.floor(Math.random() * 50) + 110 : // High (110-160)
      Math.floor(Math.random() * 20) + 40;   // Low (40-60)
  } else {
    // Generate normal reading (60-100)
    return Math.floor(Math.random() * 40) + 60;
  }
}

function isRiskyReading(pulse) {
  return pulse > 100 || pulse < 60;
}

// GET /api/heart-rate/stats
app.get('/api/heart-rate/stats', (req, res) => {
  const stats = {
    last5Minutes: generateRandomHeartRate(),
    last15Minutes: generateRandomHeartRate(),
    last30Minutes: generateRandomHeartRate(),
    current: generateRandomHeartRate(),
    lastUpdated: new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  };
  
  console.log(`📊 Mock stats generated: Current ${stats.current} BPM`);
  res.json(stats);
});

// GET /api/heart-rate/readings
app.get('/api/heart-rate/readings', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const maxReadings = Math.min(limit, 20); // Limit to 20 max
  
  const readings = Array.from({ length: maxReadings }, (_, i) => {
    const timestamp = new Date(Date.now() - i * 15 * 60 * 1000); // 15 minutes apart
    const pulse = generateRandomHeartRate();
    
    return {
      id: i + 1,
      hour: timestamp.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      pulse: pulse,
      isRisky: isRiskyReading(pulse),
      timestamp: timestamp.toISOString()
    };
  });
  
  console.log(`📋 Mock readings generated: ${readings.length} entries`);
  res.json(readings);
});

// GET /api/heart-rate/current
app.get('/api/heart-rate/current', (req, res) => {
  const current = generateRandomHeartRate();
  const response = {
    current: current,
    lastUpdated: new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }),
    timestamp: new Date().toISOString()
  };
  
  console.log(`💓 Current heart rate: ${current} BPM`);
  res.json(response);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Mock SINMAM API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0-mock',
    defaultEndpoint: DEFAULT_API_ENDPOINT
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Mock API: The endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /api/heart-rate/stats',
      'GET /api/heart-rate/readings',
      'GET /api/heart-rate/current',
      'GET /health'
    ]
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('\n🚀 SINMAM Mock API Server');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🔗 Default API Endpoint: ${DEFAULT_API_ENDPOINT}`);
  console.log('📋 Available endpoints:');
  console.log('  - GET /api/heart-rate/stats');
  console.log('  - GET /api/heart-rate/readings');
  console.log('  - GET /api/heart-rate/current');
  console.log('  - GET /health');
  console.log('\n✨ Mock data is being generated automatically');
  console.log('🔄 This server generates random heart rate data for testing');
  console.log('📌 Configure your frontend to use: https://um-sinmam-api.iroak.cl/\n');
});

module.exports = app;
