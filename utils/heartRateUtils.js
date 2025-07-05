/**
 * Generate a realistic heart rate reading
 * @param {Object} options - Configuration options
 * @param {number} options.baseRate - Base heart rate (default: 80)
 * @param {number} options.variance - Variance in BPM (default: 30)
 * @param {number} options.riskyChance - Chance of generating risky reading (default: 0.2)
 * @returns {number} Heart rate in BPM
 */
function generateHeartRateReading(options = {}) {
  const { 
    baseRate = 80, 
    variance = 30, 
    riskyChance = 0.2 
  } = options;
  
  // Generate random heart rate with some probability of being risky
  if (Math.random() < riskyChance) {
    // Generate risky reading (either too high or too low)
    if (Math.random() < 0.8) {
      // High heart rate (tachycardia)
      return Math.floor(Math.random() * 50) + 110; // 110-160 BPM
    } else {
      // Low heart rate (bradycardia)
      return Math.floor(Math.random() * 20) + 40; // 40-60 BPM
    }
  } else {
    // Generate normal reading
    const normalBase = baseRate + (Math.random() - 0.5) * variance;
    return Math.max(60, Math.min(100, Math.floor(normalBase)));
  }
}

/**
 * Determine if a heart rate reading is considered risky
 * @param {number} heartRate - Heart rate in BPM
 * @returns {boolean} True if risky, false otherwise
 */
function isRiskyHeartRate(heartRate) {
  const riskyThreshold = parseInt(process.env.RISKY_HR_THRESHOLD) || 100;
  const normalMin = parseInt(process.env.NORMAL_HR_MIN) || 60;
  
  return heartRate > riskyThreshold || heartRate < normalMin;
}

/**
 * Get heart rate category
 * @param {number} heartRate - Heart rate in BPM
 * @returns {string} Category: 'normal', 'low', 'high'
 */
function getHeartRateCategory(heartRate) {
  const normalMin = parseInt(process.env.NORMAL_HR_MIN) || 60;
  const normalMax = parseInt(process.env.NORMAL_HR_MAX) || 100;
  
  if (heartRate < normalMin) {
    return 'low';
  } else if (heartRate > normalMax) {
    return 'high';
  } else {
    return 'normal';
  }
}

/**
 * Validate heart rate value
 * @param {number} heartRate - Heart rate to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidHeartRate(heartRate) {
  return typeof heartRate === 'number' && 
         heartRate >= 30 && 
         heartRate <= 250 && 
         !isNaN(heartRate);
}

/**
 * Generate heart rate trend data
 * @param {number} count - Number of readings to generate
 * @param {number} intervalMinutes - Interval between readings in minutes
 * @returns {Array} Array of heart rate readings with trend
 */
function generateHeartRateTrend(count = 10, intervalMinutes = 15) {
  const readings = [];
  const now = new Date();
  let baseRate = 75 + Math.random() * 20; // Start with a base rate
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    
    // Add some trend and noise
    baseRate += (Math.random() - 0.5) * 5; // Slight trend
    baseRate = Math.max(60, Math.min(120, baseRate)); // Keep within reasonable bounds
    
    const heartRate = Math.floor(baseRate + (Math.random() - 0.5) * 10);
    
    readings.push({
      timestamp: timestamp.toISOString(),
      heartRate: heartRate,
      category: getHeartRateCategory(heartRate),
      isRisky: isRiskyHeartRate(heartRate)
    });
  }
  
  return readings;
}

module.exports = {
  generateHeartRateReading,
  isRiskyHeartRate,
  getHeartRateCategory,
  isValidHeartRate,
  generateHeartRateTrend
};
