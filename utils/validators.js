/**
 * Validate if a string is a valid ISO 8601 timestamp
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateTimeRange(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toISOString() === dateString;
}

/**
 * Validate heart rate value
 * @param {number} heartRate - Heart rate to validate
 * @returns {Object} Validation result
 */
function validateHeartRate(heartRate) {
  const result = {
    isValid: false,
    errors: []
  };
  
  if (typeof heartRate !== 'number') {
    result.errors.push('Heart rate must be a number');
    return result;
  }
  
  if (isNaN(heartRate)) {
    result.errors.push('Heart rate cannot be NaN');
    return result;
  }
  
  if (heartRate < 30) {
    result.errors.push('Heart rate cannot be less than 30 BPM');
    return result;
  }
  
  if (heartRate > 250) {
    result.errors.push('Heart rate cannot be greater than 250 BPM');
    return result;
  }
  
  result.isValid = true;
  return result;
}

/**
 * Validate limit parameter for API requests
 * @param {string|number} limit - Limit value to validate
 * @returns {Object} Validation result
 */
function validateLimit(limit) {
  const result = {
    isValid: false,
    value: null,
    errors: []
  };
  
  const parsedLimit = parseInt(limit);
  
  if (isNaN(parsedLimit)) {
    result.errors.push('Limit must be a valid number');
    return result;
  }
  
  if (parsedLimit < 1) {
    result.errors.push('Limit must be greater than 0');
    return result;
  }
  
  if (parsedLimit > 100) {
    result.errors.push('Limit cannot be greater than 100');
    return result;
  }
  
  result.isValid = true;
  result.value = parsedLimit;
  return result;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateApiKey(apiKey) {
  return typeof apiKey === 'string' && apiKey.length >= 32;
}

/**
 * Sanitize string input
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate request body for heart rate submission
 * @param {Object} body - Request body
 * @returns {Object} Validation result
 */
function validateHeartRateSubmission(body) {
  const result = {
    isValid: false,
    errors: []
  };
  
  if (!body || typeof body !== 'object') {
    result.errors.push('Request body must be an object');
    return result;
  }
  
  if (!('pulse' in body)) {
    result.errors.push('Pulse field is required');
    return result;
  }
  
  const heartRateValidation = validateHeartRate(body.pulse);
  if (!heartRateValidation.isValid) {
    result.errors.push(...heartRateValidation.errors);
    return result;
  }
  
  result.isValid = true;
  return result;
}

module.exports = {
  validateTimeRange,
  validateHeartRate,
  validateLimit,
  validateEmail,
  validateApiKey,
  sanitizeString,
  validateHeartRateSubmission
};
