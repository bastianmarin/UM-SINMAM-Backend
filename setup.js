#!/usr/bin/env node

/**
 * Setup script for SINMAM API
 * This script helps initialize the project with proper configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up SINMAM API...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    console.log('❌ .env.example file not found');
  }
} else {
  console.log('ℹ️  .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Dependencies not installed. Please run: npm install');
} else {
  console.log('✅ Dependencies are installed');
}

console.log('\n🎯 Setup complete!');
console.log('\nNext steps:');
console.log('1. Review and update .env file if needed');
console.log('2. Run "npm install" to install dependencies');
console.log('3. Run "npm run dev" to start the development server');
console.log('4. Or run "node mock-server.js" to use the mock server');
console.log('\n📖 Check README.md for detailed documentation');
