#!/usr/bin/env node

/**
 * Validates that BASE_PATH configuration is consistent across the application
 * Run this during build to ensure everything is properly configured
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const BASE_PATH = process.env.BASE_PATH || '';
const NEXT_PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

console.log('🔍 Validating BASE_PATH configuration...');
console.log(`   BASE_PATH: "${BASE_PATH}"`);
console.log(`   NEXT_PUBLIC_BASE_PATH: "${NEXT_PUBLIC_BASE_PATH}"`);

// Validate consistency
if (BASE_PATH !== NEXT_PUBLIC_BASE_PATH) {
  console.error('❌ ERROR: BASE_PATH and NEXT_PUBLIC_BASE_PATH must match!');
  process.exit(1);
}

// Check if BASE_PATH starts with / if not empty
if (BASE_PATH && !BASE_PATH.startsWith('/')) {
  console.error('❌ ERROR: BASE_PATH must start with / if provided');
  process.exit(1);
}

// Check if BASE_PATH ends with /
if (BASE_PATH.endsWith('/')) {
  console.error('❌ ERROR: BASE_PATH must not end with /');
  process.exit(1);
}

// Validate next.config.mjs uses BASE_PATH
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

if (!nextConfig.includes('basePath: process.env.BASE_PATH')) {
  console.warn('⚠️  WARNING: next.config.mjs should use process.env.BASE_PATH');
}

// Show middleware matcher that will be generated
console.log('\n📋 Middleware matcher patterns:');
if (BASE_PATH) {
  console.log(`   - "${BASE_PATH}/((?!api/auth|sign-in|...).*)""`);
  console.log(`   - "/api/auth/:path*"`);
} else {
  console.log(`   - "/((?!api/auth|sign-in|...).*)""`);
}

console.log('\n✅ BASE_PATH configuration is valid!');
console.log('\n⚠️  IMPORTANT: After changing BASE_PATH, you must:');
console.log('   1. Rebuild the application (npm run build)');
console.log('   2. Update Azure AD redirect URIs');
console.log('   3. Update any hardcoded paths in your code');