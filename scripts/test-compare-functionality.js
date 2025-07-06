#!/usr/bin/env node

/**
 * Test Compare Functionality
 * Tests the complete NDA comparison workflow using DRY principles
 */

const fetch = require('node-fetch');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test configuration
const TEST_CONFIG = {
  userEmail: 'michaelabdo@vvgtruck.com',
  standardDocId: null,
  thirdPartyDocId: null,
  verbose: true
};

// Utility functions following DRY principles
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    data: '\x1b[34m'
  };
  console.log(`${colors[type]}${message}\x1b[0m`);
};

const makeRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Test steps
const tests = {
  async fetchDocuments() {
    log('\n📄 Fetching available documents...', 'info');
    const result = await makeRequest('/documents');
    
    if (!result.success) {
      log(`Failed to fetch documents: ${result.error}`, 'error');
      return false;
    }
    
    const documents = result.data.data || [];
    log(`Found ${documents.length} documents`, 'success');
    
    // Find standard and third-party documents
    const standardDocs = documents.filter(doc => doc.is_standard);
    const thirdPartyDocs = documents.filter(doc => !doc.is_standard);
    
    if (standardDocs.length === 0 || thirdPartyDocs.length === 0) {
      log('Need at least one standard and one third-party document', 'error');
      return false;
    }
    
    TEST_CONFIG.standardDocId = standardDocs[0].id;
    TEST_CONFIG.thirdPartyDocId = thirdPartyDocs[0].id;
    
    log(`Selected standard doc: ${standardDocs[0].original_name} (ID: ${TEST_CONFIG.standardDocId})`, 'data');
    log(`Selected third-party doc: ${thirdPartyDocs[0].original_name} (ID: ${TEST_CONFIG.thirdPartyDocId})`, 'data');
    
    return true;
  },
  
  async testComparisonEndpoint() {
    log('\n🔄 Testing comparison endpoint...', 'info');
    
    const payload = {
      standardDocId: TEST_CONFIG.standardDocId.toString(),
      thirdPartyDocId: TEST_CONFIG.thirdPartyDocId.toString()
    };
    
    log(`Payload: ${JSON.stringify(payload)}`, 'data');
    
    const result = await makeRequest('/compare', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!result.success) {
      log(`Comparison failed: ${result.error}`, 'error');
      return false;
    }
    
    log('Comparison successful!', 'success');
    
    // Analyze the comparison result
    const comparison = result.data.comparison;
    if (comparison) {
      log('\n📊 Comparison Results:', 'info');
      log(`Status: ${comparison.status}`, 'data');
      log(`Created: ${new Date(comparison.createdAt).toLocaleString()}`, 'data');
      
      if (comparison.result) {
        log(`\nOverall Risk: ${comparison.result.overallRisk}`, comparison.result.overallRisk === 'high' ? 'error' : 'warn');
        log(`Confidence: ${Math.round(comparison.result.confidence * 100)}%`, 'data');
        
        log('\nKey Differences:', 'info');
        comparison.result.keyDifferences.forEach((diff, i) => {
          log(`  ${i + 1}. ${diff}`, 'data');
        });
        
        log('\nRecommended Actions:', 'info');
        comparison.result.recommendedActions.forEach((action, i) => {
          log(`  ${i + 1}. ${action}`, 'data');
        });
        
        if (comparison.result.sections && comparison.result.sections.length > 0) {
          log('\nDetailed Section Analysis:', 'info');
          comparison.result.sections.forEach(section => {
            log(`\n  Section: ${section.section} (${section.severity} severity)`, section.severity === 'high' ? 'error' : 'warn');
            section.differences.forEach(diff => {
              log(`    - ${diff}`, 'data');
            });
            if (section.suggestions.length > 0) {
              log('    Suggestions:', 'info');
              section.suggestions.forEach(sug => {
                log(`      • ${sug}`, 'success');
              });
            }
          });
        }
      }
    }
    
    return true;
  },
  
  async testSimpleComparison() {
    log('\n🔄 Testing simple comparison endpoint...', 'info');
    
    const result = await makeRequest('/compare/simple', {
      method: 'POST',
      body: JSON.stringify({
        standardDocId: TEST_CONFIG.standardDocId,
        thirdPartyDocId: TEST_CONFIG.thirdPartyDocId
      })
    });
    
    if (!result.success) {
      log(`Simple comparison failed: ${result.error}`, 'error');
      return false;
    }
    
    log('Simple comparison successful!', 'success');
    
    const { differences, summary } = result.data;
    log(`\nSummary: ${summary}`, 'data');
    log(`Found ${differences.length} differences`, 'info');
    
    return true;
  },
  
  async analyzeWorkflow() {
    log('\n🔍 Analyzing Complete Workflow...', 'info');
    
    // Check if documents have extracted text
    const docResult = await makeRequest(`/documents/${TEST_CONFIG.standardDocId}`);
    if (docResult.success) {
      const doc = docResult.data;
      if (!doc.extracted_text) {
        log('Standard document missing extracted text - extraction may be queued', 'warn');
      } else {
        log(`Standard document has ${doc.extracted_text.length} characters of extracted text`, 'success');
      }
    }
    
    // Check queue status
    const queueResult = await makeRequest('/process-queue', { method: 'GET' });
    if (queueResult.success) {
      const { stats } = queueResult.data;
      log('\nQueue Status:', 'info');
      log(`  Queued: ${stats.queued}`, 'data');
      log(`  Processing: ${stats.processing}`, 'data');
      log(`  Completed: ${stats.completed}`, 'data');
      log(`  Failed: ${stats.failed}`, 'data');
      
      if (stats.queued > 0 || stats.processing > 0) {
        log('\n⚠️  Some documents are still being processed', 'warn');
        log('Run: curl -X POST http://localhost:3000/api/process-queue', 'info');
      }
    }
    
    return true;
  }
};

// Main test runner
async function runTests() {
  log('🧪 Testing NDA Compare Functionality\n', 'info');
  
  const testOrder = [
    'fetchDocuments',
    'testComparisonEndpoint',
    'testSimpleComparison',
    'analyzeWorkflow'
  ];
  
  let allPassed = true;
  
  for (const testName of testOrder) {
    try {
      const passed = await tests[testName]();
      if (!passed) {
        allPassed = false;
        log(`\n❌ Test "${testName}" failed`, 'error');
        break;
      }
    } catch (error) {
      allPassed = false;
      log(`\n❌ Test "${testName}" threw error: ${error.message}`, 'error');
      break;
    }
  }
  
  if (allPassed) {
    log('\n✅ All tests passed!', 'success');
    
    log('\n📋 Summary:', 'info');
    log('1. Documents API is working correctly', 'success');
    log('2. Comparison API accepts and processes requests', 'success');
    log('3. Simple comparison endpoint is functional', 'success');
    log('4. Mock comparison logic returns expected structure', 'success');
    
    log('\n⚠️  Note: Using mock comparison logic', 'warn');
    log('Real OpenAI integration needed for production', 'info');
  } else {
    log('\n❌ Some tests failed', 'error');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  log(`Unexpected error: ${error.message}`, 'error');
  process.exit(1);
});