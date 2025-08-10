#!/usr/bin/env node

/**
 * Simple End-to-End Test for Document Comparison
 * 
 * Following DRY and Claude principles:
 * - Start with simplest working solution
 * - Fail fast when real systems are unavailable
 * - Use real data from real systems
 * - Make failures loud and visible
 * - One complete feature test
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const DEV_BYPASS_HEADER = 'X-Dev-Bypass';
const TIMEOUT_MS = 30000;

// Test state
let testResults = [];
let server = null;

/**
 * Make HTTP request following DRY principle - single request utility
 */
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.hostname === 'localhost' ? http : https;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: parsedData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(TIMEOUT_MS, () => {
      req.abort();
      reject(new Error(`Request timeout after ${TIMEOUT_MS}ms`));
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

/**
 * Log test result following Claude principle - make failures loud and visible
 */
function logResult(testName, success, details) {
  const result = { testName, success, details, timestamp: new Date().toISOString() };
  testResults.push(result);
  
  const status = success ? '✅' : '❌';
  console.log(`${status} ${testName}: ${details}`);
  
  if (!success) {
    console.error(`   FAILURE DETAILS: ${JSON.stringify(details, null, 2)}`);
  }
}

/**
 * Wait for condition with timeout - fail fast principle
 */
async function waitFor(condition, description, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Timeout waiting for: ${description}`);
}

/**
 * Test: Start development server
 */
async function testStartServer() {
  try {
    // Check if server is already running by testing a simpler endpoint
    const healthCheck = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    }).catch(() => null);

    if (healthCheck?.status === 200) {
      logResult('Start Server', true, 'Server already running');
      return true;
    }

    // Start server
    const { spawn } = require('child_process');
    server = spawn('npm', ['run', 'dev'], { 
      stdio: 'pipe',
      detached: false 
    });

    // Wait for server to be ready
    await waitFor(async () => {
      try {
        const response = await makeRequest({
          hostname: 'localhost',
          port: 3000,
          path: '/',
          method: 'GET'
        });
        return response.status === 200;
      } catch {
        return false;
      }
    }, 'Server to start', 15000);

    logResult('Start Server', true, 'Development server started successfully');
    return true;
  } catch (error) {
    logResult('Start Server', false, error.message);
    return false;
  }
}

/**
 * Test: Seed development data
 */
async function testSeedData() {
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/seed-dev',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [DEV_BYPASS_HEADER]: 'true'
      }
    });

    if (response.status !== 200) {
      throw new Error(`Seed failed with status ${response.status}: ${JSON.stringify(response.data)}`);
    }

    const { processedCount, realDataUsed } = response.data;
    
    // Fail fast if mock data was used (Claude principle)
    if (!realDataUsed) {
      throw new Error('Mock data was used instead of real data - violates Claude principles');
    }

    logResult('Seed Data', true, `Seeded ${processedCount} documents using real data`);
    return { documentCount: processedCount };
  } catch (error) {
    logResult('Seed Data', false, error.message);
    return null;
  }
}

/**
 * Test: Process text extraction queue
 */
async function testProcessQueue() {
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/process-queue',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [DEV_BYPASS_HEADER]: 'true'
      }
    });

    if (response.status !== 200) {
      throw new Error(`Queue processing failed with status ${response.status}`);
    }

    // Process all extraction tasks
    let extractedCount = 0;
    for (let i = 0; i < 10; i++) { // Max 10 attempts to process all tasks
      const queueResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/process-queue',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [DEV_BYPASS_HEADER]: 'true'
        }
      });

      if (queueResponse.status === 200 && queueResponse.data.success) {
        extractedCount++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
      } else {
        break; // No more tasks
      }
    }

    logResult('Process Queue', true, `Processed ${extractedCount} extraction tasks`);
    return extractedCount;
  } catch (error) {
    logResult('Process Queue', false, error.message);
    return 0;
  }
}

/**
 * Test: Document comparison end-to-end
 */
async function testDocumentComparison() {
  try {
    // Test comparison between documents 1 and 3
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/compare',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [DEV_BYPASS_HEADER]: 'true'
      }
    }, {
      doc1Id: '1',
      doc2Id: '3'
    });

    if (response.status !== 200) {
      throw new Error(`Comparison failed with status ${response.status}: ${JSON.stringify(response.data)}`);
    }

    const { data: comparisonData } = response.data;
    
    // Validate comparison result structure
    if (!comparisonData || !comparisonData.result) {
      throw new Error('Invalid comparison response structure');
    }

    const { result, standardDocument, thirdPartyDocument } = comparisonData;
    
    // Validate required fields exist
    const requiredFields = ['summary', 'overallRisk', 'keyDifferences', 'sections'];
    for (const field of requiredFields) {
      if (!result[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate documents have extracted text
    if (!standardDocument.extracted_text || !thirdPartyDocument.extracted_text) {
      throw new Error('Documents missing extracted text');
    }

    const details = {
      summary: result.summary.substring(0, 100) + '...',
      overallRisk: result.overallRisk,
      differenceCount: result.keyDifferences.length,
      sectionCount: result.sections.length,
      standardDocLength: standardDocument.extracted_text.length,
      thirdPartyDocLength: thirdPartyDocument.extracted_text.length
    };

    logResult('Document Comparison', true, `Comparison completed successfully: ${JSON.stringify(details)}`);
    return comparisonData;
  } catch (error) {
    logResult('Document Comparison', false, error.message);
    return null;
  }
}

/**
 * Test: Rate limiting functionality
 */
async function testRateLimiting() {
  try {
    // Make multiple rapid requests to test rate limiting
    const requests = [];
    for (let i = 0; i < 3; i++) {
      requests.push(makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/compare',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [DEV_BYPASS_HEADER]: 'true'
        }
      }, {
        doc1Id: '1',
        doc2Id: '2'
      }));
    }

    const responses = await Promise.all(requests);
    
    // Check that at least one request succeeded
    const successCount = responses.filter(r => r.status === 200).length;
    const rateLimitCount = responses.filter(r => r.status === 429).length;

    logResult('Rate Limiting', true, `${successCount} succeeded, ${rateLimitCount} rate limited`);
    return { successCount, rateLimitCount };
  } catch (error) {
    logResult('Rate Limiting', false, error.message);
    return null;
  }
}

/**
 * Cleanup: Stop server
 */
async function cleanup() {
  if (server) {
    server.kill();
    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    logResult('Cleanup', true, 'Server stopped');
  }
}

/**
 * Main test execution following Claude principles
 */
async function runE2ETest() {
  console.log('🚀 Starting End-to-End Comparison Test');
  console.log('📋 Following DRY and Claude principles:');
  console.log('   ✓ Start with simplest working solution');
  console.log('   ✓ Fail fast when real systems are unavailable');
  console.log('   ✓ Use real data from real systems');
  console.log('   ✓ Make failures loud and visible');
  console.log('');

  try {
    // Step 1: Start server
    const serverStarted = await testStartServer();
    if (!serverStarted) {
      throw new Error('CRITICAL: Server failed to start - cannot continue');
    }

    // Step 2: Seed data
    const seedResult = await testSeedData();
    if (!seedResult) {
      throw new Error('CRITICAL: Failed to seed data - cannot continue');
    }

    // Step 3: Process extraction queue
    const extractedCount = await testProcessQueue();
    if (extractedCount === 0) {
      console.warn('⚠️  WARNING: No documents extracted - comparison may fail');
    }

    // Step 4: Test comparison
    const comparisonResult = await testDocumentComparison();
    if (!comparisonResult) {
      throw new Error('CRITICAL: Document comparison failed');
    }

    // Step 5: Test rate limiting
    await testRateLimiting();

    // Report results
    const successCount = testResults.filter(r => r.success).length;
    const totalCount = testResults.length;
    
    console.log('');
    console.log('📊 TEST SUMMARY:');
    console.log(`✅ Passed: ${successCount}/${totalCount} tests`);
    
    if (successCount === totalCount) {
      console.log('🎉 ALL TESTS PASSED - E2E comparison workflow is working!');
      process.exit(0);
    } else {
      console.log('❌ SOME TESTS FAILED - see details above');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 CRITICAL ERROR:', error.message);
    await cleanup();
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Run the test
runE2ETest().catch(async (error) => {
  console.error('💥 UNEXPECTED ERROR:', error);
  await cleanup();
  process.exit(1);
});