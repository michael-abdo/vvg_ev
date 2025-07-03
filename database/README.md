# NDA Analyzer Database

## Overview

This directory contains the database schema and migration scripts for the NDA Analyzer application. The system is designed to work both with and without database CREATE permissions.

## Architecture

The database abstraction layer (`/lib/nda/database.ts`) provides:
- **In-memory storage** when database CREATE access is not available
- **MySQL storage** when full database access is granted
- **Seamless transition** between the two modes

## Database Schema

### Tables

1. **nda_documents** - Stores uploaded NDA metadata
   - File information (hash, size, S3 URL)
   - Processing status
   - Extracted text content
   - Standard template flag

2. **nda_comparisons** - Stores comparison results
   - Links two documents
   - AI analysis results
   - Similarity scores
   - Key differences and suggestions

3. **nda_exports** - Tracks generated reports
   - Export format (PDF/DOCX)
   - Download tracking
   - S3 storage URLs

4. **nda_processing_queue** - Async task queue
   - Text extraction tasks
   - Comparison tasks
   - Export generation tasks

## Setup Instructions

### Without Database CREATE Access (Current State)

```bash
# Run in memory-only mode
npm run dev

# Or explicitly set no database access
DB_CREATE_ACCESS=false npm run dev
```

The application will:
- Use in-memory storage for all data
- Function normally but data won't persist between restarts
- Allow full feature development and testing

### With Database CREATE Access (When Granted)

1. **Set environment variable**:
   ```bash
   # In .env.local
   DB_CREATE_ACCESS=true
   ```

2. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Start application**:
   ```bash
   npm run dev
   ```

## Migration Script

The migration script (`run-migrations.ts`) will:
1. Test database connection
2. Verify CREATE permissions
3. Execute all SQL migrations
4. Verify table creation

## Usage in Code

```typescript
import { documentDb, comparisonDb, queueDb } from '@/lib/nda';

// Create a document (works with or without DB)
const document = await documentDb.create({
  filename: 's3/path/to/file.pdf',
  original_name: 'contract.pdf',
  file_hash: 'abc123...',
  s3_url: 's3://bucket/path',
  file_size: 1024000,
  user_id: 'user@example.com',
  status: DocumentStatus.UPLOADED,
  is_standard: false
});

// Find documents
const userDocs = await documentDb.findByUser('user@example.com');

// Check for duplicates
const existing = await documentDb.findByHash('abc123...');
```

## Type Safety

All database operations are fully typed:
- `/types/nda/index.ts` - Public API types
- `/lib/nda/types.ts` - Internal database types

## Development Workflow

1. **Develop features** using in-memory storage
2. **Test locally** without database dependencies
3. **Deploy** when database access is granted
4. **Data persists** automatically when DB is available

## Troubleshooting

### "No CREATE TABLE permissions"
- Continue using in-memory mode
- Contact database admin for permissions
- All features work except persistence

### "Cannot connect to database"
- Check SSM tunnel is running
- Verify credentials in .env.local
- Fall back to in-memory mode if needed

### "Data not persisting"
- Check `DB_CREATE_ACCESS` environment variable
- Verify migrations have been run
- Check database connection logs