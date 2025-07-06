const express = require('express');
const router = express.Router();
const { getHeartRateStats, getHeartRateReadings, addHeartRateReading, getReadingStats } = require('../services/heartRateService');
const { validateTimeRange, validateHeartRateSubmission } = require('../utils/validators');
const { logInfo, logError } = require('../utils/logger');

/**
 * GET /api/heart-rate/stats
 * Returns heart rate statistics including averages for different time periods
 */
router.get('/stats', async (req, res) => {
  try {
    logInfo('Heart rate stats requested');
    const stats = await getHeartRateStats();
    res.json(stats);
  } catch (error) {
    logError(`Error getting heart rate stats: ${error.message}`);
    res.status(500).json({
      error: 'Failed to retrieve heart rate statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/heart-rate/readings
 * Returns recent heart rate readings with optional limit and time range
 */
router.get('/readings', async (req, res) => {
  try {
    const { limit = 20, since } = req.query;
    
    // Validate limit
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be a number between 1 and 100'
      });
    }

    // Validate since parameter if provided
    if (since && !validateTimeRange(since)) {
      return res.status(400).json({
        error: 'Invalid since parameter',
        message: 'Since parameter must be a valid ISO 8601 timestamp'
      });
    }

    logInfo(`Heart rate readings requested (limit: ${parsedLimit}, since: ${since || 'not specified'})`);
    
    const readings = await getHeartRateReadings(parsedLimit, since);
    res.json(readings);
  } catch (error) {
    logError(`Error getting heart rate readings: ${error.message}`);
    res.status(500).json({
      error: 'Failed to retrieve heart rate readings',
      message: error.message
    });
  }
});

/**
 * GET /api/heart-rate/current
 * Returns current heart rate reading
 */
router.get('/current', async (req, res) => {
  try {
    logInfo('Current heart rate requested');
    const stats = await getHeartRateStats();
    
    res.json({
      current: stats.current,
      lastUpdated: stats.lastUpdated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError(`Error getting current heart rate: ${error.message}`);
    res.status(500).json({
      error: 'Failed to retrieve current heart rate',
      message: error.message
    });
  }
});

/**
 * POST /api/heart-rate/reading
 * Receives a new heart rate reading and processes it
 */
router.post('/reading', async (req, res) => {
  try {
    // Validate request body
    const validation = validateHeartRateSubmission(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid heart rate data',
        message: validation.errors.join(', ')
      });
    }

    const { pulse } = req.body;
    
    logInfo(`New heart rate reading received: ${pulse} BPM`);
    
    // Add the reading to our storage
    const reading = addHeartRateReading(pulse);
    
    // Return the processed reading with additional info
    res.status(201).json({
      success: true,
      message: 'Heart rate reading processed successfully',
      reading: reading,
      stats: await getHeartRateStats()
    });
    
  } catch (error) {
    logError(`Error processing heart rate reading: ${error.message}`);
    res.status(500).json({
      error: 'Failed to process heart rate reading',
      message: error.message
    });
  }
});

/**
 * GET /api/heart-rate/statistics
 * Returns detailed statistics about all readings
 */
router.get('/statistics', async (req, res) => {
  try {
    logInfo('Detailed statistics requested');
    
    const basicStats = await getHeartRateStats();
    const readingStats = getReadingStats();
    
    const detailedStats = {
      ...basicStats,
      readingCount: readingStats,
      dataAvailable: basicStats.hasData
    };
    
    res.json(detailedStats);
  } catch (error) {
    logError(`Error getting detailed statistics: ${error.message}`);
    res.status(500).json({
      error: 'Failed to retrieve detailed statistics',
      message: error.message
    });
  }
});

module.exports = router;
