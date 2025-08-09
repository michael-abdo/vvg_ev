#!/usr/bin/env node

/**
 * Test Environment Loading Order
 * 
 * This script verifies that environment variables are loaded correctly
 * according to Next.js loading order: .env → .env.production → .env.local
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment files in Next.js order (same as Next.js does)
console.log('Loading environment files in Next.js order...');

// 1. Load .env first (base defaults)
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
  console.log('✅ Loaded .env');
} else {
  console.log('❌ .env not found');
}

// 2. Load environment-specific file (.env.production if NODE_ENV=production)
if (process.env.NODE_ENV === 'production' && fs.existsSync('.env.production')) {
  dotenv.config({ path: '.env.production' });
  console.log('✅ Loaded .env.production (production mode)');
} else if (process.env.NODE_ENV === 'production') {
  console.log('❌ .env.production not found (production mode)');
} else {
  console.log('ℹ️  Skipping .env.production (not production mode)');
}

// 3. Load .env.local last (highest priority - secrets and local overrides)
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
  console.log('✅ Loaded .env.local');
} else {
  console.log('❌ .env.local not found');
}

console.log('');

console.log('Environment Loading Test');
console.log('========================\n');

// Check current NODE_ENV
console.log('Current NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('Current ENVIRONMENT:', process.env.ENVIRONMENT || 'not set');
console.log('\n');

// List which env files exist
console.log('Environment Files Present:');
const envFiles = ['.env', '.env.production', '.env.local', '.env.development', '.env.test'];
envFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${file}: ${exists ? '✅ exists' : '❌ missing'}`);
});
console.log('\n');

// Test key variables
console.log('Key Variables:');
const testVars = [
  { name: 'PROJECT_NAME', sensitive: false },
  { name: 'BASE_PATH', sensitive: false },
  { name: 'NEXTAUTH_URL', sensitive: false },
  { name: 'NEXTAUTH_SECRET', sensitive: true },
  { name: 'AZURE_AD_CLIENT_ID', sensitive: true },
  { name: 'AZURE_AD_CLIENT_SECRET', sensitive: true },
  { name: 'MYSQL_HOST', sensitive: false },
  { name: 'MYSQL_USER', sensitive: true },
  { name: 'MYSQL_PASSWORD', sensitive: true },
  { name: 'OPENAI_API_KEY', sensitive: true },
  { name: 'STORAGE_PROVIDER', sensitive: false },
  { name: 'LOG_LEVEL', sensitive: false },
];

testVars.forEach(({ name, sensitive }) => {
  const value = process.env[name];
  if (value) {
    if (sensitive) {
      console.log(`  ${name}: ***${value.slice(-4)}`);
    } else {
      console.log(`  ${name}: ${value}`);
    }
  } else {
    console.log(`  ${name}: ⚠️  not set`);
  }
});

console.log('\n');

// Test loading order (create test vars in each file to verify order)
console.log('Loading Order Test:');
console.log('If TEST_LOADING_ORDER exists, it shows which file won:');
console.log(`  TEST_LOADING_ORDER: ${process.env.TEST_LOADING_ORDER || 'not set'}`);
console.log('\nTo test loading order, add TEST_LOADING_ORDER=filename to each env file');

console.log('\n');

// Security check
console.log('Security Checks:');
const secretPatterns = [
  { pattern: /your-.*-here/i, message: 'placeholder values' },
  { pattern: /test-secret/i, message: 'test secrets' },
  { pattern: /example/i, message: 'example values' },
];

let securityIssues = 0;
testVars.filter(v => v.sensitive).forEach(({ name }) => {
  const value = process.env[name];
  if (value) {
    secretPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(value)) {
        console.log(`  ⚠️  ${name} contains ${message}`);
        securityIssues++;
      }
    });
  }
});

if (securityIssues === 0) {
  console.log('  ✅ No obvious security issues detected');
}

console.log('\n');

// Next.js specific checks
console.log('Next.js Specific:');
console.log('  Public variables (NEXT_PUBLIC_*):');
Object.keys(process.env)
  .filter(key => key.startsWith('NEXT_PUBLIC_'))
  .forEach(key => {
    console.log(`    ${key}: ${process.env[key]}`);
  });

console.log('\n');

// Recommendations
console.log('Recommendations:');
if (!fs.existsSync('.env')) {
  console.log('  ⚠️  Create .env with non-sensitive defaults');
}
if (!fs.existsSync('.env.local')) {
  console.log('  ⚠️  Create .env.local for secrets (cp .env.example .env.local)');
}
if (process.env.NODE_ENV === 'production' && !fs.existsSync('.env.production')) {
  console.log('  ⚠️  Create .env.production for production overrides');
}

console.log('\n---\n');
console.log('Note: This test shows current runtime values.');
console.log('In Next.js, env vars are injected at build time.');
console.log('After changing env files, rebuild with: npm run build');