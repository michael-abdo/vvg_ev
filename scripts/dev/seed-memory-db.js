#!/usr/bin/env node

/**
 * Direct in-memory database seeding for development
 * 
 * This script directly seeds the in-memory database without HTTP requests
 * Only for local development testing - production uses persistent MySQL
 */

const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

// Configuration
const CONFIG = {
  testUser: process.env.DEV_SEED_USER || 'dev-user@example.com',
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

function seedMemoryDatabase() {
  console.log(`${colors.bright}🌱 Seeding in-memory database...${colors.reset}\n`);
  
  // Initialize global memory store if it doesn't exist
  if (!global._ndaMemoryStore) {
    global._ndaMemoryStore = {
      documents: new Map(),
      comparisons: new Map(),
      exports: new Map(),
      queue: new Map(),
      nextId: {
        documents: 1,
        comparisons: 1,
        exports: 1,
        queue: 1
      }
    };
  }

  const memoryStore = global._ndaMemoryStore;
  
  console.log(`${colors.cyan}👤${colors.reset} Seeding for user: ${CONFIG.testUser}\n`);

  let seedCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Seed documents directly into memory
  for (const doc of CONFIG.documents) {
    const filePath = path.resolve(doc.path);
    const docType = doc.isStandard ? 'Standard Template' : 'Third-Party NDA';
    
    console.log(`${colors.cyan}⏳${colors.reset} Seeding ${docType}: ${doc.displayName}`);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`${colors.yellow}❌${colors.reset} File not found: ${filePath}`);
        errorCount++;
        continue;
      }

      const fileBuffer = fs.readFileSync(filePath);
      const fileHash = createHash('sha256').update(fileBuffer).digest('hex');
      const fileName = path.basename(filePath);
      
      // Check if document already exists
      const existingDoc = Array.from(memoryStore.documents.values()).find(d => 
        d.file_hash === fileHash && d.user_id === CONFIG.testUser
      );
      
      if (existingDoc) {
        console.log(`${colors.yellow}⚠️${colors.reset} Document already exists: ${doc.displayName} (ID: ${existingDoc.id})`);
        skipCount++;
        continue;
      }

      // Create document record
      const documentId = memoryStore.nextId.documents++;
      const now = new Date();
      
      const document = {
        id: documentId,
        filename: `${CONFIG.testUser}/${fileHash}/${fileName}`,
        original_name: fileName,
        display_name: doc.displayName,
        file_hash: fileHash,
        s3_url: `local://${CONFIG.testUser}/${fileHash}/${fileName}`,
        file_size: fileBuffer.length,
        upload_date: now,
        user_id: CONFIG.testUser,
        status: 'UPLOADED',
        extracted_text: null,
        is_standard: doc.isStandard,
        content_type: getContentType(fileName),
        metadata: {
          docType: doc.isStandard ? 'STANDARD' : 'THIRD_PARTY',
          contentType: getContentType(fileName),
          provider: 'local'
        }
      };

      memoryStore.documents.set(documentId, document);
      
      console.log(`${colors.green}✅${colors.reset} Seeded: ${doc.displayName} (ID: ${documentId})`);
      seedCount++;
      
    } catch (error) {
      console.log(`${colors.yellow}❌${colors.reset} Error seeding ${doc.displayName}: ${error.message}`);
      errorCount++;
    }
  }

  // Summary
  console.log(`\n${colors.bright}📊 Seeding Summary${colors.reset}`);
  console.log('==================\n');
  
  if (seedCount > 0) {
    console.log(`${colors.green}✅${colors.reset} Seeded: ${seedCount} documents`);
  }
  if (skipCount > 0) {
    console.log(`${colors.yellow}⚠️${colors.reset} Already existed: ${skipCount} documents`);
  }
  if (errorCount > 0) {
    console.log(`${colors.yellow}❌${colors.reset} Errors: ${errorCount} documents`);
  }

  console.log(`\n${colors.bright}🎉 Memory Database Seeded!${colors.reset}`);
  console.log(`${colors.blue}📊 Total documents in memory: ${memoryStore.documents.size}${colors.reset}\n`);
  
  return { seedCount, skipCount, errorCount };
}

// Export for use in other scripts
module.exports = { seedMemoryDatabase, CONFIG };

// Run directly if called as script
if (require.main === module) {
  seedMemoryDatabase();
}