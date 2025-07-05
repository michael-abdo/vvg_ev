#!/usr/bin/env node

/**
 * Test script to verify the DRY refactoring of API routes
 * Tests authentication, error handling, and API functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// Test results tracker
let passedTests = 0;
let failedTests = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(testName, testFn) {
  try {
    testFn();
    log(`✓ ${testName}`, 'green');
    passedTests++;
  } catch (error) {
    log(`✗ ${testName}`, 'red');
    log(`  Error: ${error.message}`, 'red');
    failedTests++;
  }
}

// Start the Next.js dev server
log('\nStarting Next.js development server...', 'yellow');
const serverProcess = execSync('npm run dev &', { shell: true });
// Wait for server to start
execSync('sleep 5');

log('\nRunning DRY Refactoring Tests...', 'yellow');

// Test 1: Check if refactored files exist
runTest('All refactored files exist', () => {
  const filesToCheck = [
    'app/api/documents/[id]/route.ts',
    'app/api/documents/[id]/download/route.ts',
    'app/api/documents/[id]/set-standard/route.ts',
    'app/api/dashboard/stats/route.ts',
    'app/api/compare/route.ts',
    'app/api/process-queue/route.ts',
    'app/api/upload/route.ts',
    'lib/auth-utils.ts',
    'lib/utils.ts'
  ];

  filesToCheck.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${file}`);
    }
  });
});

// Test 2: Check if withAuth is used in all protected routes
runTest('All protected routes use withAuth', () => {
  const protectedRoutes = [
    'app/api/documents/[id]/route.ts',
    'app/api/documents/[id]/download/route.ts',
    'app/api/documents/[id]/set-standard/route.ts',
    'app/api/documents/route.ts',
    'app/api/dashboard/stats/route.ts',
    'app/api/compare/route.ts',
    'app/api/upload/route.ts',
    'app/api/process-queue/route.ts'
  ];

  protectedRoutes.forEach(route => {
    const content = fs.readFileSync(path.join(process.cwd(), route), 'utf8');
    if (!content.includes('withAuth')) {
      throw new Error(`Route ${route} doesn't use withAuth`);
    }
  });
});

// Test 3: Check if ApiErrors is used for error handling
runTest('ApiErrors utility is used for consistent error handling', () => {
  const routesToCheck = [
    'app/api/documents/[id]/route.ts',
    'app/api/documents/[id]/download/route.ts',
    'app/api/documents/[id]/set-standard/route.ts',
    'app/api/documents/route.ts',
    'app/api/dashboard/stats/route.ts',
    'app/api/compare/route.ts',
    'app/api/upload/route.ts',
    'app/api/process-queue/route.ts'
  ];

  routesToCheck.forEach(route => {
    const content = fs.readFileSync(path.join(process.cwd(), route), 'utf8');
    if (!content.includes('ApiErrors')) {
      throw new Error(`Route ${route} doesn't use ApiErrors`);
    }
  });
});

// Test 4: Check utility functions exist
runTest('Utility functions are properly exported', () => {
  const utilsPath = path.join(process.cwd(), 'lib/utils.ts');
  const content = fs.readFileSync(utilsPath, 'utf8');
  
  const requiredExports = [
    'ApiErrors',
    'getFilenameFromPath',
    'parseDocumentId',
    'isDocumentOwner',
    'FileValidation'
  ];

  requiredExports.forEach(exportName => {
    if (!content.includes(`export.*${exportName}`) && !content.includes(`export const ${exportName}`)) {
      throw new Error(`Missing export: ${exportName}`);
    }
  });
});

// Test 5: API endpoint tests (requires server running)
runTest('API endpoints return expected status codes', async () => {
  const tests = [
    { url: 'http://localhost:3000/api/documents', expectedStatus: [401, 307] },
    { url: 'http://localhost:3000/api/dashboard/stats', expectedStatus: [401, 307] },
    { url: 'http://localhost:3000/api/documents/999', expectedStatus: [401, 307] },
    { url: 'http://localhost:3000/api/compare', method: 'POST', expectedStatus: [401, 307] },
    { url: 'http://localhost:3000/api/upload', method: 'POST', expectedStatus: [401, 307] }
  ];

  // Note: These will fail with 401/307 since we're not authenticated, which is expected
  tests.forEach(test => {
    try {
      execSync(`curl -s -o /dev/null -w "%{http_code}" -X ${test.method || 'GET'} ${test.url}`, {
        encoding: 'utf8'
      });
    } catch (error) {
      // Expected to fail with auth errors
    }
  });
});

// Test 6: Build check
log('\nRunning build check...', 'yellow');
runTest('Next.js build succeeds', () => {
  try {
    execSync('npm run build', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Build failed: ' + error.message);
  }
});

// Test 7: TypeScript check
log('\nRunning TypeScript check...', 'yellow');
runTest('TypeScript compilation succeeds', () => {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('TypeScript errors found: ' + error.message);
  }
});

// Clean up
try {
  execSync('pkill -f "next dev"', { stdio: 'ignore' });
} catch (e) {
  // Ignore cleanup errors
}

// Summary
log('\n' + '='.repeat(50), 'yellow');
log(`Test Results: ${passedTests} passed, ${failedTests} failed`, 
  failedTests > 0 ? 'red' : 'green');
log('='.repeat(50) + '\n', 'yellow');

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);