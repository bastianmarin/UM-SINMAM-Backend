const express = require('express');
const router = express.Router();
const { getHeartRateStats, getHeartRateReadings } = require('../services/heartRateService');
const { validateTimeRange } = require('../utils/validators');
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

module.exports = router;
