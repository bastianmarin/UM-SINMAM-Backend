const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Get current timestamp in readable format
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').substr(0, 19);
}

/**
 * Log info message
 * @param {string} message - Message to log
 */
function logInfo(message) {
  console.log(`${colors.green}[INFO]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${message}`);
}

/**
 * Log error message
 * @param {string} message - Error message to log
 */
function logError(message) {
  console.error(`${colors.red}[ERROR]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${message}`);
}

/**
 * Log warning message
 * @param {string} message - Warning message to log
 */
function logWarning(message) {
  console.warn(`${colors.yellow}[WARN]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${message}`);
}

/**
 * Log debug message (only in development)
 * @param {string} message - Debug message to log
 */
function logDebug(message) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${colors.cyan}[DEBUG]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${message}`);
  }
}

/**
 * Log success message
 * @param {string} message - Success message to log
 */
function logSuccess(message) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${message}`);
}

/**
 * Log request information
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} statusCode - Response status code
 * @param {number} responseTime - Response time in ms
 */
function logRequest(method, url, statusCode, responseTime) {
  const statusColor = statusCode >= 400 ? colors.red : 
                     statusCode >= 300 ? colors.yellow : colors.green;
  
  console.log(`${colors.blue}[REQUEST]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${method} ${url} ${statusColor}${statusCode}${colors.reset} ${responseTime}ms`);
}

module.exports = {
  logInfo,
  logError,
  logWarning,
  logDebug,
  logSuccess,
  logRequest
};
