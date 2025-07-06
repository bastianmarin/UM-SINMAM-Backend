/**
 * Test script for POST endpoint
 * This script tests the new heart rate data submission endpoint
 */

const http = require('http');
const querystring = require('querystring');

const BASE_URL = 'http://localhost:3001';

// Function to make POST request
function makePostRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
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
    
    req.write(postData);
    req.end();
  });
}

// Function to make GET request
function makeGetRequest(path) {
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
async function testPostHeartRate() {
  console.log('📤 Testing POST heart rate endpoint...');
  
  const testData = [
    { pulse: 75 },   // Normal
    { pulse: 110 },  // High (risky)
    { pulse: 55 },   // Low (risky)
    { pulse: 85 },   // Normal
    { pulse: 120 }   // High (risky)
  ];
  
  for (const data of testData) {
    try {
      const result = await makePostRequest('/api/heart-rate/reading', data);
      if (result.statusCode === 201) {
        console.log(`✅ Successfully posted ${data.pulse} BPM`);
        console.log(`   Reading ID: ${result.data.reading.id}`);
        console.log(`   Risk status: ${result.data.reading.isRisky ? 'RISKY' : 'NORMAL'}`);
      } else {
        console.log(`❌ Failed to post ${data.pulse} BPM - Status: ${result.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ Error posting ${data.pulse} BPM:`, error.message);
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testStatsAfterPost() {
  console.log('📊 Testing stats after posting data...');
  try {
    const result = await makeGetRequest('/api/heart-rate/stats');
    if (result.statusCode === 200) {
      console.log('✅ Stats retrieved successfully');
      console.log('   Current:', result.data.current, 'BPM');
      console.log('   Last 5 min:', result.data.last5Minutes, 'BPM');
      console.log('   Last 15 min:', result.data.last15Minutes, 'BPM');
      console.log('   Last 30 min:', result.data.last30Minutes, 'BPM');
      console.log('   Total readings:', result.data.totalReadings);
      console.log('   Has data:', result.data.hasData);
    } else {
      console.log('❌ Stats retrieval failed:', result.statusCode);
    }
  } catch (error) {
    console.log('❌ Stats error:', error.message);
  }
}

async function testDetailedStats() {
  console.log('📈 Testing detailed statistics...');
  try {
    const result = await makeGetRequest('/api/heart-rate/statistics');
    if (result.statusCode === 200) {
      console.log('✅ Detailed stats retrieved successfully');
      console.log('   Total readings:', result.data.readingCount.total);
      console.log('   Normal readings:', result.data.readingCount.normal);
      console.log('   Risky readings:', result.data.readingCount.risky);
      console.log('   Risk percentage:', result.data.readingCount.riskyPercentage + '%');
    } else {
      console.log('❌ Detailed stats failed:', result.statusCode);
    }
  } catch (error) {
    console.log('❌ Detailed stats error:', error.message);
  }
}

async function testInvalidData() {
  console.log('🚫 Testing invalid data handling...');
  
  const invalidData = [
    { pulse: 'invalid' },  // Invalid type
    { pulse: 300 },        // Too high
    { pulse: 10 },         // Too low
    { wrongField: 75 },    // Missing pulse field
    {}                     // Empty object
  ];
  
  for (const data of invalidData) {
    try {
      const result = await makePostRequest('/api/heart-rate/reading', data);
      if (result.statusCode === 400) {
        console.log(`✅ Correctly rejected invalid data:`, JSON.stringify(data));
      } else {
        console.log(`❌ Should have rejected:`, JSON.stringify(data));
      }
    } catch (error) {
      console.log(`❌ Error testing invalid data:`, error.message);
    }
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting SINMAM API POST Tests');
  console.log('====================================\n');
  
  // Test POST functionality
  await testPostHeartRate();
  console.log();
  
  // Test stats after posting
  await testStatsAfterPost();
  console.log();
  
  // Test detailed statistics
  await testDetailedStats();
  console.log();
  
  // Test invalid data handling
  await testInvalidData();
  
  console.log('\n====================================');
  console.log('🎯 POST Tests completed!');
  console.log('\nNote: Make sure the server is running on port 3001');
  console.log('Run: npm start or node server.js');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
