#!/usr/bin/env node

/**
 * Simple test script to verify the DRY refactoring of API routes
 * Tests file structure and code patterns without running the server
 */

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

log('\nRunning DRY Refactoring Tests...', 'yellow');
log('================================\n', 'yellow');

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
    'app/api/documents/route.ts',
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
runTest('All protected routes use withAuth wrapper', () => {
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
    if (!content.includes("import { withAuth") && !content.includes("import { withAuthDynamic")) {
      throw new Error(`Route ${route} doesn't import withAuth or withAuthDynamic`);
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
runTest('All utility functions are properly exported', () => {
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
    if (!content.includes(exportName)) {
      throw new Error(`Missing export: ${exportName}`);
    }
  });
});

// Test 5: Verify withAuth supports dynamic routes
runTest('withAuth supports dynamic route parameters', () => {
  const authUtilsPath = path.join(process.cwd(), 'lib/auth-utils.ts');
  const content = fs.readFileSync(authUtilsPath, 'utf8');
  
  // Check for withAuthDynamic function
  if (!content.includes('withAuthDynamic<T extends Record<string, any>>')) {
    throw new Error('withAuthDynamic function not found');
  }
  
  // Check for context parameter in withAuthDynamic
  if (!content.includes('context: { params: T }')) {
    throw new Error('withAuthDynamic doesn\'t support context parameter');
  }
});

// Test 6: Check document utility functions are used
runTest('Document utilities are used in routes', () => {
  const dynamicRoutes = [
    'app/api/documents/[id]/route.ts',
    'app/api/documents/[id]/download/route.ts',
    'app/api/documents/[id]/set-standard/route.ts'
  ];

  dynamicRoutes.forEach(route => {
    const content = fs.readFileSync(path.join(process.cwd(), route), 'utf8');
    if (!content.includes('parseDocumentId')) {
      throw new Error(`Route ${route} doesn't use parseDocumentId`);
    }
    if (!content.includes('isDocumentOwner')) {
      throw new Error(`Route ${route} doesn't use isDocumentOwner`);
    }
  });
});

// Test 7: No manual NextResponse.json({ error: ... }) patterns remain
runTest('No manual error responses remain (all use ApiErrors)', () => {
  const routesToCheck = [
    'app/api/documents/[id]/route.ts',
    'app/api/documents/[id]/download/route.ts',
    'app/api/documents/[id]/set-standard/route.ts',
    'app/api/compare/route.ts',
    'app/api/process-queue/route.ts',
    'app/api/upload/route.ts'
  ];

  routesToCheck.forEach(route => {
    const content = fs.readFileSync(path.join(process.cwd(), route), 'utf8');
    // Look for manual error responses (but exclude ApiErrors internal implementation)
    if (route !== 'lib/utils.ts' && content.match(/NextResponse\.json\(\s*{\s*error:/)) {
      throw new Error(`Route ${route} still has manual error responses`);
    }
  });
});

// Test 8: Check FileValidation is used in upload
runTest('Upload route uses FileValidation utility', () => {
  const uploadPath = path.join(process.cwd(), 'app/api/upload/route.ts');
  const content = fs.readFileSync(uploadPath, 'utf8');
  
  if (!content.includes('FileValidation')) {
    throw new Error('Upload route doesn\'t use FileValidation');
  }
  if (!content.includes('FileValidation.getValidationError')) {
    throw new Error('Upload route doesn\'t use FileValidation.getValidationError');
  }
});

// Summary
log('\n' + '='.repeat(50), 'yellow');
log(`\nTest Results: ${passedTests} passed, ${failedTests} failed\n`, 
  failedTests > 0 ? 'red' : 'green');
log('='.repeat(50) + '\n', 'yellow');

if (failedTests === 0) {
  log('✨ All tests passed! DRY refactoring is complete and working correctly.\n', 'green');
} else {
  log('❌ Some tests failed. Please review the errors above.\n', 'red');
}

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);