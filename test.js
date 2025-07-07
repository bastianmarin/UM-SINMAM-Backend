/**
 * Simple test for SINMAM API POST endpoint
 */

const http = require('http');

function testPost(pulse, spo2) {
  const postData = JSON.stringify({ pulse, spo2 });
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/heart-rate/reading',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response: ${data}`);
    });
  });
  
  req.on('error', (err) => {
    console.log(`Error: ${err.message}`);
  });
  
  req.write(postData);
  req.end();
}

// Test different values
console.log('Testing POST endpoint...');
testPost(75, 98);  // Normal
setTimeout(() => testPost(110, 97), 1000);  // High
setTimeout(() => testPost(55, 96), 2000);   // Low
setTimeout(() => testPost(85, 99), 3000);   // Normal
