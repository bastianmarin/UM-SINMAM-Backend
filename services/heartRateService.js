const { generateHeartRateReading, isRiskyHeartRate } = require('../utils/heartRateUtils');
const { logInfo, logError } = require('../utils/logger');

// In-memory storage for heart rate readings
let heartRateReadings = [];
let currentId = 1;

/**
 * Calculate average heart rate for a given time period
 * @param {number} minutes - Time period in minutes
 * @returns {number} Average heart rate
 */
function calculateAverage(minutes) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  const relevantReadings = heartRateReadings.filter(reading => 
    new Date(reading.timestamp) >= cutoffTime
  );
  
  if (relevantReadings.length === 0) {
    return generateHeartRateReading(); // Return a random reading if no data
  }
  
  const sum = relevantReadings.reduce((acc, reading) => acc + reading.pulse, 0);
  return Math.round(sum / relevantReadings.length);
}

/**
 * Get current heart rate (latest reading)
 * @returns {number} Current heart rate
 */
function getCurrentHeartRate() {
  if (heartRateReadings.length === 0) {
    return generateHeartRateReading();
  }
  return heartRateReadings[heartRateReadings.length - 1].pulse;
}

/**
 * Get heart rate statistics
 * @returns {Object} Heart rate statistics
 */
async function getHeartRateStats() {
  try {
    const stats = {
      last5Minutes: calculateAverage(5),
      last15Minutes: calculateAverage(15),
      last30Minutes: calculateAverage(30),
      current: getCurrentHeartRate(),
      lastUpdated: new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    };
    
    return stats;
  } catch (error) {
    logError(`Error calculating heart rate stats: ${error.message}`);
    throw error;
  }
}

/**
 * Get heart rate readings with optional filtering
 * @param {number} limit - Maximum number of readings to return
 * @param {string} since - ISO timestamp to filter readings from
 * @returns {Array} Array of heart rate readings
 */
async function getHeartRateReadings(limit = 20, since = null) {
  try {
    let filteredReadings = [...heartRateReadings];
    
    // Filter by time if since parameter is provided
    if (since) {
      const sinceDate = new Date(since);
      filteredReadings = filteredReadings.filter(reading => 
        new Date(reading.timestamp) >= sinceDate
      );
    }
    
    // Sort by timestamp (newest first) and limit results
    filteredReadings = filteredReadings
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    return filteredReadings;
  } catch (error) {
    logError(`Error retrieving heart rate readings: ${error.message}`);
    throw error;
  }
}

/**
 * Add a new heart rate reading
 * @param {number} pulse - Heart rate value in BPM
 * @returns {Object} The created reading
 */
function addHeartRateReading(pulse) {
  const timestamp = new Date();
  const reading = {
    id: currentId++,
    hour: timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    pulse: pulse,
    isRisky: isRiskyHeartRate(pulse),
    timestamp: timestamp.toISOString()
  };
  
  heartRateReadings.push(reading);
  
  // Keep only the last MAX_READINGS_HISTORY readings
  const maxReadings = parseInt(process.env.MAX_READINGS_HISTORY) || 50;
  if (heartRateReadings.length > maxReadings) {
    heartRateReadings = heartRateReadings.slice(-maxReadings);
  }
  
  return reading;
}

/**
 * Generate and add a new random heart rate reading
 * @returns {Object} The created reading
 */
function generateNewReading() {
  const pulse = generateHeartRateReading();
  return addHeartRateReading(pulse);
}

/**
 * Clear all heart rate readings (for testing purposes)
 */
function clearReadings() {
  heartRateReadings = [];
  currentId = 1;
  logInfo('Heart rate readings cleared');
}

/**
 * Get total number of readings
 * @returns {number} Total number of readings
 */
function getReadingsCount() {
  return heartRateReadings.length;
}

module.exports = {
  getHeartRateStats,
  getHeartRateReadings,
  addHeartRateReading,
  generateNewReading,
  clearReadings,
  getReadingsCount
};
