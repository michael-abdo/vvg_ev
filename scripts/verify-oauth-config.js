#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

console.log('=== OAuth Configuration Verification ===\n');

// Check required environment variables
const requiredVars = [
  'AZURE_AD_CLIENT_ID',
  'AZURE_AD_CLIENT_SECRET', 
  'AZURE_AD_TENANT_ID',
  'AZURE_AD_REDIRECT_URI',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

let allVarsPresent = true;
const configIssues = [];

console.log('1. Checking environment variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ${colors.green}✓${colors.reset} ${varName}: ${varName.includes('SECRET') ? '***' : value}`);
  } else {
    console.log(`  ${colors.red}✗${colors.reset} ${varName}: NOT SET`);
    allVarsPresent = false;
    configIssues.push(`Missing ${varName}`);
  }
});

console.log('\n2. Validating OAuth configuration:');

// Check redirect URI format
const redirectUri = process.env.AZURE_AD_REDIRECT_URI;
const nextAuthUrl = process.env.NEXTAUTH_URL;

if (redirectUri && nextAuthUrl) {
  // Check if redirect URI starts with NextAuth URL
  if (redirectUri.startsWith(nextAuthUrl)) {
    console.log(`  ${colors.green}✓${colors.reset} Redirect URI is properly aligned with NEXTAUTH_URL`);
  } else {
    console.log(`  ${colors.yellow}⚠${colors.reset} Redirect URI doesn't match NEXTAUTH_URL base`);
    console.log(`    NEXTAUTH_URL: ${nextAuthUrl}`);
    console.log(`    Redirect URI: ${redirectUri}`);
    configIssues.push('Redirect URI and NEXTAUTH_URL mismatch');
  }
  
  // Check if it ends with the correct callback path
  if (redirectUri.endsWith('/api/auth/callback/azure-ad')) {
    console.log(`  ${colors.green}✓${colors.reset} Redirect URI has correct callback path`);
  } else {
    console.log(`  ${colors.red}✗${colors.reset} Redirect URI should end with /api/auth/callback/azure-ad`);
    configIssues.push('Invalid callback path in redirect URI');
  }
}

// Check basePath configuration
console.log('\n3. Checking basePath configuration:');
const basePath = process.env.BASE_PATH || process.env.APP_BASE_PATH;
if (basePath) {
  console.log(`  ${colors.yellow}⚠${colors.reset} basePath is set: ${basePath}`);
  console.log('    This may require special handling for OAuth callbacks');
  
  if (!redirectUri?.includes(basePath)) {
    console.log(`  ${colors.yellow}⚠${colors.reset} Redirect URI doesn't include basePath`);
    configIssues.push('basePath not included in redirect URI');
  }
} else {
  console.log(`  ${colors.green}✓${colors.reset} No basePath configured (standard setup)`);
}

// Test Azure AD configuration
console.log('\n4. Testing Azure AD configuration:');
try {
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  
  if (tenantId && clientId) {
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`;
    console.log(`  ${colors.green}✓${colors.reset} Authorization URL would be: ${authUrl}`);
    console.log(`  ${colors.green}✓${colors.reset} Client ID configured: ${clientId}`);
  }
} catch (error) {
  console.log(`  ${colors.red}✗${colors.reset} Error checking Azure AD config: ${error.message}`);
}

// Summary
console.log('\n=== Summary ===');
if (allVarsPresent && configIssues.length === 0) {
  console.log(`${colors.green}✓ OAuth configuration appears to be correct!${colors.reset}`);
  console.log('\nNext steps:');
  console.log('1. Ensure this redirect URI is registered in Azure AD:');
  console.log(`   ${redirectUri}`);
  console.log('2. Start the development server: npm run dev');
  console.log('3. Navigate to /sign-in and test the OAuth flow');
} else {
  console.log(`${colors.red}✗ OAuth configuration has issues:${colors.reset}`);
  configIssues.forEach(issue => {
    console.log(`  - ${issue}`);
  });
  console.log('\nPlease fix the above issues before testing OAuth flow.');
}

// Additional Azure AD registration reminder
console.log('\n=== Azure AD App Registration Reminder ===');
console.log('Make sure the following redirect URI is registered in your Azure AD app:');
console.log(`${colors.yellow}${redirectUri || 'NOT SET'}${colors.reset}`);
console.log('\nIn Azure Portal:');
console.log('1. Go to Azure Active Directory → App registrations');
console.log('2. Select your application');
console.log('3. Go to Authentication → Platform configurations → Web');
console.log('4. Add the redirect URI exactly as shown above');
console.log('5. Click Save');