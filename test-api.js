/**
 * Test script to verify SINMAM API functionality
 * This script tests the main endpoints and validates responses
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Test function to make HTTP requests
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('🏥 Testing health endpoint...');
  try {
    const result = await makeRequest('/health');
    if (result.statusCode === 200) {
      console.log('✅ Health endpoint OK');
      console.log('   Status:', result.data.status);
      console.log('   Version:', result.data.version);
    } else {
      console.log('❌ Health endpoint failed:', result.statusCode);
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
  }
}

async function testStatsEndpoint() {
  console.log('📊 Testing stats endpoint...');
  try {
    const result = await makeRequest('/api/heart-rate/stats');
    if (result.statusCode === 200) {
      console.log('✅ Stats endpoint OK');
      console.log('   Current:', result.data.current, 'BPM');
      console.log('   Last 5 min:', result.data.last5Minutes, 'BPM');
      console.log('   Last updated:', result.data.lastUpdated);
    } else {
      console.log('❌ Stats endpoint failed:', result.statusCode);
    }
  } catch (error) {
    console.log('❌ Stats endpoint error:', error.message);
  }
}

async function testReadingsEndpoint() {
  console.log('📋 Testing readings endpoint...');
  try {
    const result = await makeRequest('/api/heart-rate/readings?limit=5');
    if (result.statusCode === 200) {
      console.log('✅ Readings endpoint OK');
      console.log('   Number of readings:', result.data.length);
      if (result.data.length > 0) {
        console.log('   Latest reading:', result.data[0].pulse, 'BPM at', result.data[0].hour);
        console.log('   Risky readings:', result.data.filter(r => r.isRisky).length);
      }
    } else {
      console.log('❌ Readings endpoint failed:', result.statusCode);
    }
  } catch (error) {
    console.log('❌ Readings endpoint error:', error.message);
  }
}

async function testCurrentEndpoint() {
  console.log('💓 Testing current endpoint...');
  try {
    const result = await makeRequest('/api/heart-rate/current');
    if (result.statusCode === 200) {
      console.log('✅ Current endpoint OK');
      console.log('   Current HR:', result.data.current, 'BPM');
      console.log('   Last updated:', result.data.lastUpdated);
    } else {
      console.log('❌ Current endpoint failed:', result.statusCode);
    }
  } catch (error) {
    console.log('❌ Current endpoint error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting SINMAM API Tests');
  console.log('================================\n');
  
  await testHealthEndpoint();
  console.log();
  await testStatsEndpoint();
  console.log();
  await testReadingsEndpoint();
  console.log();
  await testCurrentEndpoint();
  
  console.log('\n================================');
  console.log('🎯 Tests completed!');
  console.log('\nNote: Make sure the server is running on port 3001');
  console.log('Run: npm start or node server.js');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
