#!/usr/bin/env node

// Test OAuth configuration with basePath (simulating production/staging)

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

console.log('=== OAuth Configuration Test with basePath ===\n');

// Simulate different environments
const environments = [
  {
    name: 'Staging',
    config: {
      NEXTAUTH_URL: 'https://legal.vtc.systems:8443/vvg-template-staging',
      AZURE_AD_REDIRECT_URI: 'https://legal.vtc.systems:8443/vvg-template-staging/api/auth/callback/azure-ad',
      BASE_PATH: '/vvg-template-staging',
      APP_URL: 'https://legal.vtc.systems:8443/vvg-template-staging'
    }
  },
  {
    name: 'Production',
    config: {
      NEXTAUTH_URL: 'https://legal.vtc.systems/vvg-template',
      AZURE_AD_REDIRECT_URI: 'https://legal.vtc.systems/vvg-template/api/auth/callback/azure-ad',
      BASE_PATH: '/vvg-template',
      APP_URL: 'https://legal.vtc.systems/vvg-template'
    }
  }
];

environments.forEach(env => {
  console.log(`\n${colors.yellow}Testing ${env.name} Configuration:${colors.reset}`);
  console.log('=' .repeat(40));
  
  // Check if NEXTAUTH_URL includes basePath
  const { NEXTAUTH_URL, AZURE_AD_REDIRECT_URI, BASE_PATH, APP_URL } = env.config;
  
  console.log(`\n1. URLs and Paths:`);
  console.log(`  NEXTAUTH_URL: ${NEXTAUTH_URL}`);
  console.log(`  BASE_PATH: ${BASE_PATH}`);
  console.log(`  APP_URL: ${APP_URL}`);
  console.log(`  AZURE_AD_REDIRECT_URI: ${AZURE_AD_REDIRECT_URI}`);
  
  console.log(`\n2. Validation Checks:`);
  
  // Check if NEXTAUTH_URL includes basePath
  if (NEXTAUTH_URL.endsWith(BASE_PATH)) {
    console.log(`  ${colors.green}✓${colors.reset} NEXTAUTH_URL includes basePath`);
  } else {
    console.log(`  ${colors.red}✗${colors.reset} NEXTAUTH_URL should include basePath`);
  }
  
  // Check if redirect URI starts with NEXTAUTH_URL
  if (AZURE_AD_REDIRECT_URI.startsWith(NEXTAUTH_URL)) {
    console.log(`  ${colors.green}✓${colors.reset} Redirect URI aligns with NEXTAUTH_URL`);
  } else {
    console.log(`  ${colors.red}✗${colors.reset} Redirect URI doesn't align with NEXTAUTH_URL`);
  }
  
  // Check callback path
  const expectedCallbackPath = `${NEXTAUTH_URL}/api/auth/callback/azure-ad`;
  if (AZURE_AD_REDIRECT_URI === expectedCallbackPath) {
    console.log(`  ${colors.green}✓${colors.reset} Redirect URI has correct format`);
  } else {
    console.log(`  ${colors.red}✗${colors.reset} Redirect URI format mismatch`);
    console.log(`    Expected: ${expectedCallbackPath}`);
    console.log(`    Got: ${AZURE_AD_REDIRECT_URI}`);
  }
  
  // Check if APP_URL matches NEXTAUTH_URL
  if (APP_URL === NEXTAUTH_URL) {
    console.log(`  ${colors.green}✓${colors.reset} APP_URL matches NEXTAUTH_URL`);
  } else {
    console.log(`  ${colors.yellow}⚠${colors.reset} APP_URL doesn't match NEXTAUTH_URL`);
  }
  
  console.log(`\n3. OAuth Flow Simulation:`);
  
  // Simulate what NextAuth would construct
  const authorizationUrl = new URL('https://login.microsoftonline.com/tenant-id/oauth2/v2.0/authorize');
  authorizationUrl.searchParams.set('client_id', 'client-id');
  authorizationUrl.searchParams.set('redirect_uri', AZURE_AD_REDIRECT_URI);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'openid profile email');
  
  console.log(`  Authorization URL would include:`);
  console.log(`  redirect_uri=${AZURE_AD_REDIRECT_URI}`);
  
  // Check if the redirect would work
  const redirectUrl = new URL(AZURE_AD_REDIRECT_URI);
  console.log(`\n  After OAuth callback:`);
  console.log(`  - Protocol: ${redirectUrl.protocol}`);
  console.log(`  - Host: ${redirectUrl.host}`);
  console.log(`  - Path: ${redirectUrl.pathname}`);
  
  if (redirectUrl.pathname.includes(BASE_PATH)) {
    console.log(`  ${colors.green}✓${colors.reset} Callback path includes basePath`);
  } else {
    console.log(`  ${colors.red}✗${colors.reset} Callback path missing basePath`);
  }
});

console.log(`\n\n=== Key Findings ===`);
console.log(`\n${colors.green}With the new static configuration:${colors.reset}`);
console.log('1. Each environment has its own specific redirect URI');
console.log('2. The redirect URI is explicitly set via AZURE_AD_REDIRECT_URI');
console.log('3. No dynamic URL construction happens at runtime');
console.log('4. Azure AD must have each environment\'s exact redirect URI registered');

console.log(`\n${colors.yellow}Important Notes:${colors.reset}`);
console.log('- The basePath is included in NEXTAUTH_URL for proper routing');
console.log('- The redirect URI must match exactly what\'s registered in Azure AD');
console.log('- Each environment needs its own Azure AD redirect URI registration');

console.log(`\n${colors.green}Benefits of this approach:${colors.reset}`);
console.log('✓ More secure - no dynamic URL construction');
console.log('✓ Predictable - redirect URIs are static');
console.log('✓ Works behind proxies and load balancers');
console.log('✓ Follows OAuth 2.0 best practices');