#!/usr/bin/env node

/**
 * Industry standard environment loader for Next.js
 * Loads base .env then environment-specific overrides
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Get environment from command line or default to development
const environment = process.argv[2] || 'development';

console.log(`Loading environment: ${environment}`);

// Load base .env first
const baseEnvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(baseEnvPath)) {
  dotenv.config({ path: baseEnvPath });
  console.log('✓ Loaded base .env');
}

// Load environment-specific overrides
const envPath = path.resolve(process.cwd(), `env/.env.${environment}`);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
  console.log(`✓ Loaded env/.env.${environment}`);
} else {
  console.log(`✗ No env/.env.${environment} found, using base .env only`);
}

// Set APP_ENV for runtime checks
process.env.APP_ENV = environment;

console.log('Environment loaded successfully!');