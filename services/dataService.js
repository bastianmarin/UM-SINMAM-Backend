const { logInfo, logError } = require('../utils/logger');

/**
 * Data service for SINMAM API
 * This service manages the data processing workflow
 * Note: Data generation has been removed - the API now receives real data via POST
 */

/**
 * Get current data service status
 * @returns {Object} Status information
 */
function getDataServiceStatus() {
  return {
    mode: 'real-data',
    description: 'API receives real heart rate data via POST endpoints',
    autoGeneration: false,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Initialize data service (now just logs the current mode)
 */
function initializeDataService() {
  logInfo('� Data service initialized in real-data mode');
  logInfo('📥 Ready to receive heart rate data via POST /api/heart-rate/reading');
  logInfo('🚫 Automatic data generation disabled');
}

module.exports = {
  initializeDataService,
  getDataServiceStatus
};
