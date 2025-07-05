const { generateNewReading } = require('./heartRateService');
const { logInfo, logError } = require('../utils/logger');

let dataGenerationInterval;

/**
 * Initialize automatic data generation
 */
function initializeDataGeneration() {
  const updateInterval = (parseInt(process.env.DATA_UPDATE_INTERVAL) || 15) * 1000;
  
  logInfo(`🔄 Starting automatic data generation every ${updateInterval / 1000} seconds`);
  
  // Generate initial readings
  generateInitialReadings();
  
  // Set up interval for continuous data generation
  dataGenerationInterval = setInterval(() => {
    try {
      const reading = generateNewReading();
      logInfo(`📊 Generated new reading: ${reading.pulse} BPM at ${reading.hour}`);
    } catch (error) {
      logError(`Error generating new reading: ${error.message}`);
    }
  }, updateInterval);
}

/**
 * Generate initial set of readings to populate the system
 */
function generateInitialReadings() {
  const initialCount = 20;
  const now = new Date();
  
  logInfo(`📈 Generating ${initialCount} initial heart rate readings`);
  
  for (let i = initialCount - 1; i >= 0; i--) {
    // Generate readings going back in time
    const timeOffset = i * 15 * 60 * 1000; // 15 minutes apart
    const timestamp = new Date(now.getTime() - timeOffset);
    
    const reading = generateNewReading();
    // Override the timestamp to create historical data
    const lastReading = require('./heartRateService').getHeartRateReadings(1)[0];
    if (lastReading) {
      lastReading.timestamp = timestamp.toISOString();
      lastReading.hour = timestamp.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
  
  logInfo(`✅ Generated ${initialCount} initial readings`);
}

/**
 * Stop automatic data generation
 */
function stopDataGeneration() {
  if (dataGenerationInterval) {
    clearInterval(dataGenerationInterval);
    dataGenerationInterval = null;
    logInfo('🛑 Stopped automatic data generation');
  }
}

/**
 * Restart data generation with new interval
 * @param {number} intervalSeconds - New interval in seconds
 */
function restartDataGeneration(intervalSeconds) {
  stopDataGeneration();
  process.env.DATA_UPDATE_INTERVAL = intervalSeconds.toString();
  initializeDataGeneration();
}

/**
 * Get current data generation status
 * @returns {Object} Status information
 */
function getDataGenerationStatus() {
  return {
    isActive: dataGenerationInterval !== null,
    interval: parseInt(process.env.DATA_UPDATE_INTERVAL) || 15,
    nextUpdate: dataGenerationInterval ? 
      new Date(Date.now() + (parseInt(process.env.DATA_UPDATE_INTERVAL) || 15) * 1000).toISOString() : 
      null
  };
}

module.exports = {
  initializeDataGeneration,
  stopDataGeneration,
  restartDataGeneration,
  getDataGenerationStatus
};
