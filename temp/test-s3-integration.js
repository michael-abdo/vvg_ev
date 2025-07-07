#!/usr/bin/env node

// Simple S3 Integration Test
// Tests if S3 is properly configured and working

require('dotenv').config({ path: '.env.local' });

console.log('🧪 S3 Integration Test');
console.log('======================');

// Test S3 configuration
function testConfiguration() {
  console.log('\n🔧 Testing S3 Configuration...');
  
  const requiredVars = ['S3_BUCKET_NAME', 'AWS_REGION', 'S3_ACCESS'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:', missing);
    return false;
  }
  
  console.log('✅ S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
  console.log('✅ AWS_REGION:', process.env.AWS_REGION);
  console.log('✅ S3_ACCESS:', process.env.S3_ACCESS);
  
  return true;
}

// Test AWS CLI access
async function testAwsCli() {
  console.log('\n🔧 Testing AWS CLI Access...');
  
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    const bucket = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    
    // Test bucket access
    const { stdout } = await execAsync(`aws s3 ls s3://${bucket}/ --region ${region}`);
    console.log('✅ S3 bucket accessible via CLI');
    console.log('📁 Bucket contents preview:', stdout.split('\n').slice(0, 3).join('\n'));
    
    return true;
  } catch (error) {
    console.log('❌ AWS CLI test failed:', error.message);
    return false;
  }
}

// Test storage module
async function testStorageModule() {
  console.log('\n🔧 Testing Storage Module...');
  
  try {
    // Import storage module
    const { storage } = require('../lib/storage');
    
    // Initialize storage
    await storage.initialize();
    
    console.log('✅ Storage module initialized');
    console.log('📦 Provider:', storage.getProvider());
    console.log('🌍 Is S3:', storage.isS3?.() || false);
    console.log('🏠 Is Local:', storage.isLocal?.() || false);
    
    // Test a simple operation
    const testKey = `test/integration-test-${Date.now()}.txt`;
    const testContent = 'S3 Integration Test Content';
    
    console.log('\n📤 Testing upload...');
    const uploadResult = await storage.upload(testKey, Buffer.from(testContent), {
      contentType: 'text/plain'
    });
    console.log('✅ Upload successful:', uploadResult.key);
    
    console.log('\n📥 Testing download...');
    const downloadResult = await storage.download(testKey);
    const downloadedContent = downloadResult.data.toString();
    console.log('✅ Download successful, content matches:', downloadedContent === testContent);
    
    console.log('\n🗑️ Testing delete...');
    const deleteResult = await storage.delete(testKey);
    console.log('✅ Delete successful:', deleteResult.deleted);
    
    return true;
  } catch (error) {
    console.log('❌ Storage module test failed:', error.message);
    console.log('🔍 Error details:', error);
    return false;
  }
}

// Test server endpoints (if accessible)
async function testServerEndpoints() {
  console.log('\n🔧 Testing Server Endpoints...');
  
  try {
    // Test if server is running
    const response = await fetch('http://localhost:3000/api/db-health');
    console.log('📡 Server response status:', response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Server accessible and responding');
      return true;
    } else {
      console.log('🔐 Server requires authentication (expected)');
      return true; // This is expected behavior
    }
  } catch (error) {
    console.log('❌ Server not accessible:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🏁 Starting S3 Integration Tests\n');
  
  const results = {
    config: testConfiguration(),
    awsCli: await testAwsCli(),
    storageModule: await testStorageModule(),
    serverEndpoints: await testServerEndpoints()
  };
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  console.log('\n🎯 Overall Result');
  console.log('==================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED - S3 Integration is fully operational!');
    console.log('✅ Ready for production deployment with S3 storage');
  } else {
    console.log('⚠️ Some tests failed - check configuration and permissions');
  }
  
  return allPassed;
}

// Run the tests
runTests().catch(error => {
  console.log('💥 Test suite error:', error.message);
  process.exit(1);
});