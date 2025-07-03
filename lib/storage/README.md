# Storage Abstraction Layer

## Overview

The storage abstraction layer provides a unified interface for file storage that works seamlessly with both local filesystem (for development) and AWS S3 (for production). This allows you to develop and test without S3 access, then switch to S3 when permissions are granted.

## Architecture

### Local Storage Provider
- Stores files in the filesystem (default: `.storage/` directory)
- Saves metadata alongside files as `.meta.json`
- Mimics S3 structure and operations
- No external dependencies

### S3 Storage Provider
- Uses AWS SDK for S3 operations
- Full S3 feature support
- Production-ready with proper error handling
- Supports signed URLs and advanced features

## Configuration

### Environment Variables

```bash
# Storage provider selection
STORAGE_PROVIDER=local  # or 's3'
S3_ACCESS=false         # Set to 'true' to auto-select S3

# Local storage configuration
LOCAL_STORAGE_PATH=.storage

# S3 configuration
S3_BUCKET_NAME=vvg-cloud-storage
S3_FOLDER_PREFIX=nda-analyzer/
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Automatic Provider Selection

The system automatically chooses the provider based on:
1. `STORAGE_PROVIDER` environment variable
2. `S3_ACCESS=true` (auto-selects S3)
3. Defaults to local storage

## Usage

### Basic Operations

```typescript
import { storage } from '@/lib/storage';

// Initialize (required before first use)
await storage.initialize();

// Upload a file
const result = await storage.upload('path/to/file.pdf', buffer, {
  contentType: 'application/pdf',
  metadata: {
    uploadedBy: 'user@example.com',
    originalName: 'document.pdf'
  }
});

// Download a file
const download = await storage.download('path/to/file.pdf');
const fileData = download.data; // Buffer

// Check if file exists
const exists = await storage.exists('path/to/file.pdf');

// List files
const list = await storage.list({
  prefix: 'user/documents/',
  maxKeys: 100
});

// Delete a file
const deleted = await storage.delete('path/to/file.pdf');

// Get file metadata
const metadata = await storage.head('path/to/file.pdf');

// Copy a file
const copied = await storage.copy('source.pdf', 'destination.pdf');

// Generate signed URL (S3 only)
const url = await storage.getSignedUrl('file.pdf', 'get', { expires: 3600 });
```

### NDA-Specific Paths

Use the `ndaPaths` helper for consistent file organization:

```typescript
import { ndaPaths } from '@/lib/storage';

// Document storage paths
const docPath = ndaPaths.document(userId, fileHash, filename);
// → "nda-analyzer/users/user@example.com/documents/abc123.../file.pdf"

// Comparison result paths
const compPath = ndaPaths.comparison(userId, comparisonId);
// → "nda-analyzer/users/user@example.com/comparisons/123/result.json"

// Export paths
const exportPath = ndaPaths.export(userId, exportId, 'pdf');
// → "nda-analyzer/users/user@example.com/exports/456/report.pdf"
```

### Provider Detection

```typescript
// Check which provider is active
if (storage.isLocal()) {
  console.log('Using local filesystem storage');
}

if (storage.isS3()) {
  console.log('Using AWS S3 storage');
}

const provider = storage.getProvider(); // 'local' or 's3'
```

## Health Check

Test storage functionality with the health check endpoint:

```bash
# After authentication
curl http://localhost:3000/api/storage-health
```

The health check tests:
- Upload operation
- Download operation
- File existence check
- Metadata retrieval
- File listing
- Signed URL generation (S3 only)
- File deletion

## Development Workflow

### Without S3 Access (Current State)

```bash
# Use local storage
npm run dev

# Files are stored in .storage/ directory
# All operations work normally
# Data persists between restarts
```

### With S3 Access (When Granted)

```bash
# Set environment variable
echo "S3_ACCESS=true" >> .env.local

# Start application
npm run dev

# All operations now use S3
# Existing local files won't be migrated automatically
```

## Error Handling

The storage layer provides comprehensive error handling:

```typescript
import { 
  StorageError, 
  FileNotFoundError, 
  AccessDeniedError 
} from '@/lib/storage';

try {
  await storage.download('nonexistent.pdf');
} catch (error) {
  if (error instanceof FileNotFoundError) {
    console.log('File not found');
  } else if (error instanceof AccessDeniedError) {
    console.log('Access denied');
  } else if (error instanceof StorageError) {
    console.log(`Storage error: ${error.code}`);
  }
}
```

## Local Storage Structure

```
.storage/
└── nda-analyzer/
    └── users/
        └── user@example.com/
            └── documents/
                └── abc123.../
                    ├── contract.pdf
                    └── contract.pdf.meta.json
```

## S3 Structure

```
vvg-cloud-storage/
└── nda-analyzer/
    └── users/
        └── user@example.com/
            ├── documents/
            │   └── abc123.../contract.pdf
            ├── comparisons/
            │   └── 123/result.json
            └── exports/
                └── 456/report.pdf
```

## Migration

When switching from local to S3:

1. Set `S3_ACCESS=true` in environment
2. Restart the application
3. New files will use S3
4. Existing local files remain until manually migrated

To migrate existing files:
```typescript
// Custom migration script (if needed)
const localFiles = await storage.list({ prefix: 'nda-analyzer/' });
for (const file of localFiles.files) {
  const data = await storage.download(file.key);
  await s3Storage.upload(file.key, data.data);
}
```

## Troubleshooting

### Local Storage Issues
- **Permission denied**: Check directory permissions
- **No space left**: Clear old files or increase disk space
- **Path too long**: Check file path lengths

### S3 Issues
- **Access denied**: Check AWS credentials and bucket permissions
- **Bucket not found**: Verify bucket name and region
- **Network errors**: Check internet connectivity and AWS endpoints

### Common Fixes
```bash
# Reset local storage
rm -rf .storage/

# Test storage health
curl http://localhost:3000/api/storage-health

# Check environment variables
echo $S3_ACCESS
echo $S3_BUCKET_NAME
```