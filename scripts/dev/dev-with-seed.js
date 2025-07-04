#!/usr/bin/env node

/**
 * Development server with auto-seeding
 * 
 * Starts Next.js and seeds documents once ready
 * Configure with DEV_SEED_USER environment variable
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUser: process.env.DEV_SEED_USER || 'dev-user@example.com',
  maxRetries: 3,
  retryDelay: 2000,
  documents: [
    // Standard Templates
    {
      path: 'documents/vvg/Form NDA [Mutual].docx',
      displayName: 'VVG Standard Mutual NDA',
      isStandard: true,
    },
    {
      path: 'documents/vvg/Form NDA [Velocity as Disclosing Party].docx',
      displayName: 'VVG Disclosing Party NDA',
      isStandard: true,
    },
    {
      path: 'documents/vvg/Form NDA [Velocity as Receiving Party].docx',
      displayName: 'VVG Receiving Party NDA',
      isStandard: true,
    },
    // Third-party NDAs
    {
      path: 'documents/third-party/UK-Government-Mutual-NDA.pdf',
      displayName: 'UK Government Mutual NDA',
      isStandard: false,
    },
    {
      path: 'documents/third-party/Torys-Mutual-NDA-Template.pdf',
      displayName: 'Torys Law Firm NDA Template',
      isStandard: false,
    },
    {
      path: 'documents/third-party/Sample-Tech-Company-Mutual-NDA.txt',
      displayName: 'Tech Company Mutual NDA',
      isStandard: false,
    },
    {
      path: 'documents/third-party/Financial-Services-NDA.txt',
      displayName: 'Financial Services NDA',
      isStandard: false,
    },
    {
      path: 'documents/third-party/Healthcare-Industry-NDA.txt',
      displayName: 'Healthcare Industry NDA',
      isStandard: false,
    },
    {
      path: 'documents/third-party/Manufacturing-Vendor-NDA.txt',
      displayName: 'Manufacturing Vendor NDA',
      isStandard: false,
    },
    {
      path: 'documents/third-party/Simple-Mutual-NDA-Template.txt',
      displayName: 'Simple Mutual NDA Template',
      isStandard: false,
    },
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Simple server check - just see if port is open
async function isServerReady() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/documents',
      method: 'GET',
      headers: {
        'x-test-user': CONFIG.testUser
      },
      timeout: 1000
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function waitForServer(maxWaitTime = 60000) {
  const startTime = Date.now();
  let attempts = 0;
  
  while (Date.now() - startTime < maxWaitTime) {
    attempts++;
    if (await isServerReady()) {
      return true;
    }
    
    if (attempts % 5 === 0) {
      console.log(`⏳ Still waiting... (${Math.floor((Date.now() - startTime) / 1000)}s)`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return false;
}

async function killExistingServers() {
  return new Promise((resolve) => {
    spawn('lsof', ['-ti:3000'], { shell: true })
      .on('exit', () => {
        spawn('pkill', ['-f', 'next dev'], { shell: true })
          .on('exit', () => {
            setTimeout(resolve, 1000);
          });
      });
  });
}

async function uploadDocument(doc) {
  const filePath = path.resolve(doc.path);
  
  if (!fs.existsSync(filePath)) {
    return { success: false, error: `File not found: ${filePath}` };
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  
  const formData = new FormData();
  const file = new File([fileBuffer], fileName, {
    type: getContentType(fileName)
  });
  
  formData.append('file', file);
  formData.append('isStandard', doc.isStandard.toString());
  formData.append('displayName', doc.displayName);

  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'x-test-user': CONFIG.testUser
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (result.duplicate) {
        return { success: true, duplicate: true, document: result.document };
      }
      return { success: false, error: result.message || 'Upload failed' };
    }

    return { success: true, document: result.document };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.txt': 'text/plain'
  };
  return types[ext] || 'application/octet-stream';
}

async function seedDocuments() {
  console.log(`${colors.bright}🌱 Seeding documents...${colors.reset}\n`);
  
  const standardDocs = CONFIG.documents.filter(d => d.isStandard);
  const thirdPartyDocs = CONFIG.documents.filter(d => !d.isStandard);
  
  console.log(`${colors.blue}ℹ${colors.reset} Seeding ${standardDocs.length} standard templates and ${thirdPartyDocs.length} third-party NDAs\n`);
  console.log(`${colors.cyan}👤${colors.reset} Using test user: ${CONFIG.testUser}\n`);

  let uploadedCount = 0;
  let existingCount = 0;
  let errorCount = 0;

  // Upload all documents
  for (const doc of CONFIG.documents) {
    const docType = doc.isStandard ? 'Standard Template' : 'Third-Party NDA';
    console.log(`${colors.cyan}⏳${colors.reset} Uploading ${docType}: ${doc.displayName}`);
    
    const result = await uploadDocument(doc);
    
    if (result.success) {
      if (result.duplicate) {
        console.log(`${colors.yellow}⚠️${colors.reset} Document already exists: ${doc.displayName} (ID: ${result.document.id})`);
        existingCount++;
      } else {
        console.log(`${colors.green}✅${colors.reset} Uploaded: ${doc.displayName} (ID: ${result.document.id})`);
        if (doc.isStandard) {
          console.log(`${colors.green}✅${colors.reset}    Already marked as standard template`);
        }
        uploadedCount++;
      }
    } else {
      console.log(`${colors.yellow}❌${colors.reset} Failed: ${doc.displayName} - ${result.error}`);
      errorCount++;
    }
  }

  // Summary
  console.log(`\n${colors.bright}📊 Seeding Summary${colors.reset}`);
  console.log('==================\n');
  
  if (uploadedCount > 0) {
    console.log(`${colors.green}✅${colors.reset} Uploaded: ${uploadedCount} documents`);
  }
  if (existingCount > 0) {
    console.log(`${colors.yellow}⚠️${colors.reset} Already existed: ${existingCount} documents`);
  }
  if (errorCount > 0) {
    console.log(`${colors.yellow}❌${colors.reset} Errors: ${errorCount} documents`);
  }

  console.log(`\n${colors.bright}🎉 Seeding Complete!${colors.reset}`);
  console.log('===================\n');
  console.log('You can now:');
  console.log(`   • View documents at ${colors.blue}http://localhost:3000/documents${colors.reset}`);
  console.log(`   • Compare NDAs at ${colors.blue}http://localhost:3000/compare${colors.reset}`);
  console.log('   • Test the complete workflow\n');
}

async function main() {
  console.log('🚀 Starting development server with auto-seeding...\n');
  
  // Verify environment
  if (!process.env.DEV_SEED_USER) {
    console.log(`${colors.yellow}⚠️  DEV_SEED_USER not set, using default: ${CONFIG.testUser}${colors.reset}`);
    console.log(`${colors.blue}💡 Set DEV_SEED_USER environment variable to use your email${colors.reset}\n`);
  }
  
  // Kill existing servers first
  console.log('🔪 Killing any existing servers...');
  await killExistingServers();
  console.log('✅ Port 3000 is free\n');

  // Start Next.js
  const next = spawn('next', ['dev'], {
    stdio: 'inherit',
    shell: true
  });

  // Wait for server
  console.log('⏳ Waiting for server to be ready...');
  
  const ready = await waitForServer();
  
  if (!ready) {
    console.log('⚠️  Server is taking longer than expected...');
    console.log('The server might still be starting. Proceeding with seeding in 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  console.log('✅ Server is ready!\n');

  // Run seeding
  try {
    await seedDocuments();
    console.log('\n✅ Development server is running with seeded documents!');
    console.log('   Visit: http://localhost:3000/documents\n');
  } catch (error) {
    console.log('\n⚠️  Seeding failed, but server is still running');
    console.error('Error:', error.message);
  }

  // Handle shutdown
  process.on('SIGINT', () => {
    next.kill('SIGINT');
    process.exit(0);
  });
}

main().catch(console.error);