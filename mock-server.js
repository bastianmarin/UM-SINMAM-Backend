/**
 * SINMAM API Server
 * This server receives real heart rate data via POST and processes it
 * Default API Endpoint: https://um-sinmam-api.iroak.cl/
 */

const express = require('express');
const cors = require('cors');
const app = express();

// Configuration
const DEFAULT_API_ENDPOINT = 'https://um-sinmam-api.iroak.cl/';

app.use(cors());
app.use(express.json());

// In-memory storage for heart rate readings
let heartRateReadings = [];
let currentId = 1;

// Utility functions
function isRiskyReading(pulse) {
  return pulse > 100 || pulse < 60;
}

function calculateAverage(minutes) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  const relevantReadings = heartRateReadings.filter(reading => 
    new Date(reading.timestamp) >= cutoffTime
  );
  
  if (relevantReadings.length === 0) {
    return null;
  }
  
  const sum = relevantReadings.reduce((acc, reading) => acc + reading.pulse, 0);
  return Math.round(sum / relevantReadings.length);
}

function calculateAverageSpo2(minutes) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  const relevantReadings = heartRateReadings.filter(reading => 
    new Date(reading.timestamp) >= cutoffTime && typeof reading.spo2 === 'number'
  );
  if (relevantReadings.length === 0) {
    return null;
  }
  const sum = relevantReadings.reduce((acc, reading) => acc + reading.spo2, 0);
  return Math.round(sum / relevantReadings.length);
}

function getCurrentHeartRate() {
  if (heartRateReadings.length === 0) {
    return null;
  }
  return heartRateReadings[heartRateReadings.length - 1].pulse;
}

function addHeartRateReading(pulse, spo2) {
  const timestamp = new Date();
  const reading = {
    id: currentId++,
    hour: timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    pulse: pulse,
    spo2: spo2,
    isRisky: isRiskyReading(pulse),
    timestamp: timestamp.toISOString()
  };
  
  heartRateReadings.push(reading);
  
  // Keep only the last 50 readings
  if (heartRateReadings.length > 50) {
    heartRateReadings = heartRateReadings.slice(-50);
  }
  
  console.log(`📥 New reading: ${pulse} BPM, SpO2: ${spo2} (${reading.isRisky ? 'RISKY' : 'NORMAL'})`);
  return reading;
}

// POST /api/heart-rate/reading
app.post('/api/heart-rate/reading', (req, res) => {
  try {
    const { pulse, spo2 } = req.body;
    // Validar pulse
    if (!pulse || typeof pulse !== 'number' || pulse < 30 || pulse > 250) {
      return res.status(400).json({
        error: 'Invalid heart rate data',
        message: 'Pulse must be a number between 30 and 250'
      });
    }
    // Validar spo2
    if (typeof spo2 !== 'number' || spo2 < 50 || spo2 > 100) {
      return res.status(400).json({
        error: 'Invalid SpO2 data',
        message: 'SpO2 must be a number between 50 and 100'
      });
    }
    // Agregar la lectura
    const reading = addHeartRateReading(pulse, spo2);
    res.status(201).json({
      success: true,
      message: 'Heart rate reading processed successfully',
      reading: reading
    });
  } catch (error) {
    console.error('Error processing heart rate reading:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process heart rate reading'
    });
  }
});

// GET /api/heart-rate/stats
app.get('/api/heart-rate/stats', (req, res) => {
  const stats = {
    last5Minutes: calculateAverage(5),
    last15Minutes: calculateAverage(15),
    last30Minutes: calculateAverage(30),
    current: getCurrentHeartRate(),
    lastUpdated: heartRateReadings.length > 0 ? 
      new Date(heartRateReadings[heartRateReadings.length - 1].timestamp).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }) : null,
    totalReadings: heartRateReadings.length,
    hasData: heartRateReadings.length > 0,
    spo2: heartRateReadings.length > 0 ? heartRateReadings[heartRateReadings.length - 1].spo2 : null,
    avgSpo2_5min: calculateAverageSpo2(5),
    avgSpo2_15min: calculateAverageSpo2(15),
    avgSpo2_30min: calculateAverageSpo2(30)
  };
  console.log(`📊 Stats requested: Current ${stats.current} BPM, SpO2: ${stats.spo2} (${stats.totalReadings} readings)`);
  res.json(stats);
});

// GET /api/heart-rate/readings
app.get('/api/heart-rate/readings', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const maxReadings = Math.min(limit, 20);
  if (heartRateReadings.length > 0) {
    const readings = heartRateReadings
      .slice(-maxReadings)
      .reverse();
    console.log(`📋 Readings requested: ${readings.length} entries`);
    res.json(readings);
  } else {
    console.log(`📋 No readings available`);
    res.json([]);
  }
});

// GET /api/heart-rate/current
app.get('/api/heart-rate/current', (req, res) => {
  const current = getCurrentHeartRate();
  const response = {
    current: current,
    spo2: heartRateReadings.length > 0 ? heartRateReadings[heartRateReadings.length - 1].spo2 : null,
    lastUpdated: heartRateReadings.length > 0 ? 
      new Date(heartRateReadings[heartRateReadings.length - 1].timestamp).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }) : null,
    timestamp: new Date().toISOString(),
    hasData: heartRateReadings.length > 0
  };
  console.log(`💓 Current heart rate: ${current} BPM, SpO2: ${response.spo2}`);
  res.json(response);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SINMAM API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    defaultEndpoint: DEFAULT_API_ENDPOINT,
    totalReadings: heartRateReadings.length
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `API: The endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'POST /api/heart-rate/reading',
      'GET /api/heart-rate/stats',
      'GET /api/heart-rate/readings',
      'GET /api/heart-rate/current',
      'GET /health'
    ]
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('\n🚀 SINMAM API Server');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🔗 Default API Endpoint: ${DEFAULT_API_ENDPOINT}`);
  console.log('📋 Available endpoints:');
  console.log('  - POST /api/heart-rate/reading');
  console.log('  - GET /api/heart-rate/stats');
  console.log('  - GET /api/heart-rate/readings');
  console.log('  - GET /api/heart-rate/current');
  console.log('  - GET /health');
  console.log('\n� Ready to receive heart rate data via POST');
  console.log('📌 Configure your frontend to use: https://um-sinmam-api.iroak.cl/\n');
});

module.exports = app;
