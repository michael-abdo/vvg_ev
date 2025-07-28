# NDA-Specific Elements in VVG Template

This document lists all NDA-specific elements in the codebase. The core functionality is generic document processing that can be adapted for any document type.

## Database Schema (NDA-Specific)

All database tables use "nda_" prefix:
- `nda_documents` - Could be renamed to `documents`
- `nda_comparisons` - Could be renamed to `comparisons`
- `nda_exports` - Could be renamed to `exports`
- `nda_processing_queue` - Could be renamed to `processing_queue`

## Type Definitions (NDA-Specific)

### Files with NDA types:
- `/types/nda/index.ts` - All interfaces prefixed with "NDA"
- `/lib/nda/types.ts` - Internal NDA types

### Specific Types to Rename:
- `NDADocument` → `Document`
- `NDAComparison` → `Comparison`
- `NDAExport` → `Export`
- `NDAProcessingQueue` → `ProcessingQueue`
- `NDAMetadata` → `DocumentMetadata`
- `NDADocumentWithText` → `DocumentWithText`

## Repository Layer

Directory: `/lib/nda/repositories/`
- All repositories reference NDA-prefixed tables
- Repository methods are generic but table names are NDA-specific

## UI Components and Text

### Component Names:
- `UploadNDA` component - Generic upload functionality with NDA naming
- Various UI strings mentioning "NDA"

### UI Text References:
- "Upload NDA" → "Upload Document"
- "NDA Analysis" → "Document Analysis"
- "Compare NDAs" → "Compare Documents"
- "NDA Library" → "Document Library"

## Sample Documents

### NDA Templates:
```
/documents/vvg/Form NDA [standard].docx
/documents/vvg/Form NDA [mutual].docx
/documents/third-party/Mutual NDA Example.txt
/documents/third-party/One-Way NDA Sample.pdf
/documents/third-party/Short NDA Template.txt
```

## Configuration

### Project Display Names:
- Currently uses "NDA Analyzer" in various places
- Should use `${PROJECT_DISPLAY_NAME}` placeholder

## Generic Components (No Changes Needed)

These components are already generic and work for any document type:
- File upload system
- Text extraction (PDF, DOCX, TXT)
- Document storage (S3/local)
- Comparison engine
- Queue processing
- Authentication system
- Health checks
- Error handling
- Logging system

## Conversion Guide

To convert this to a generic document processing template:

1. **Database Migration**:
   - Create new migration to rename tables (remove "nda_" prefix)
   - Update all SQL queries in repositories

2. **Type System**:
   - Rename all NDA-prefixed types to generic names
   - Update imports throughout codebase

3. **UI Updates**:
   - Replace "NDA" with "Document" in all UI text
   - Update component names
   - Use configuration variables for project-specific text

4. **Sample Documents**:
   - Replace NDA samples with generic document examples
   - Or make samples configurable per project type

5. **Configuration**:
   - Add `DOCUMENT_TYPE` environment variable
   - Use this to customize UI text dynamically

The core architecture supports any document comparison use case:
- Legal contracts
- Policy documents
- Terms of service
- Employment agreements
- Any text-based document comparison