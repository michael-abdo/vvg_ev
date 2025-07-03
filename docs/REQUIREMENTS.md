# NDA Analyzer - Consolidated Requirements

## Executive Summary

**Single Source of Truth**: This document consolidates all requirements for the NDA Analyzer application, resolving inconsistencies between various documents and aligning with the actual implementation.

**Current Status**: Azure AD authentication and basic infrastructure are implemented. Database connectivity is established but CREATE TABLE permissions are pending. Core NDA functionality is ready to build.

## Core Requirements

### 1. Authentication & Authorization
- **Requirement**: Secure authentication via Azure AD SSO
- **Status**: ✅ **IMPLEMENTED**
- **Implementation**: NextAuth with Azure AD provider at `/app/api/auth/[...nextauth]/route.ts`

### 2. Document Upload
- **Requirement**: Upload NDA documents (PDF/DOCX) with deduplication
- **Status**: ✅ **IMPLEMENTED** (API ready, S3 bucket needs update)
- **Implementation**: `/app/api/upload/route.ts` with SHA-256 hashing

### 3. Document Storage
- **Requirement**: Secure cloud storage for uploaded documents
- **Status**: 🚧 **BLOCKED** - S3 bucket `vvg-nda-analyzer` doesn't exist
- **Workaround**: Use existing `vvg-cloud-storage` bucket with subfolder

### 4. Database
- **Requirement**: Store document metadata and comparison results
- **Status**: 🚧 **CONNECTED** but no CREATE TABLE permissions
- **Implementation**: MySQL (not PostgreSQL) via `truck_scrape` database
- **Schema**: Defined in `/app/api/migrate-db/route.ts`

### 5. Text Extraction
- **Requirement**: Extract text from PDF/DOCX files
- **Status**: 🏗️ **SCAFFOLDED** - Utilities created but not integrated
- **Implementation**: Tesseract + LayoutParser (replacing AWS Textract for cost)

### 6. NDA Comparison
- **Requirement**: Compare uploaded NDA against standard template
- **Status**: 🔄 **MOCKED** - Returns sample data
- **Blocker**: OpenAI API key not configured

### 7. AI Suggestions
- **Requirement**: Generate alignment suggestions using AI
- **Status**: ❌ **NOT STARTED**
- **Dependency**: OpenAI GPT-4 API integration

### 8. Export Functionality
- **Requirement**: Export comparison results as PDF/DOCX
- **Status**: ❌ **NOT STARTED**
- **Technology**: Planned using PDF-lib/docx libraries

## Technical Stack (Locked In)

### Non-Negotiable Infrastructure
1. **Frontend Framework**: Next.js 15.2.4 with TypeScript
2. **Authentication**: Azure AD via NextAuth
3. **Database**: MySQL RDS (shared `truck_scrape` database)
4. **File Storage**: AWS S3
5. **Deployment Target**: EC2 + NGINX + PM2
6. **UI Components**: shadcn/ui (40+ components already installed)

### Flexible Choices
1. **Text Extraction**: Tesseract/LayoutParser (can change if needed)
2. **AI Provider**: OpenAI (can switch to other providers)
3. **Export Libraries**: Not yet selected

## Database Schema

See `/app/api/migrate-db/route.ts` for the authoritative MySQL schema implementation.

## API Endpoints

### Implemented
- `POST /api/upload` - File upload with S3 integration
- `POST /api/compare` - Document comparison (returns mock data)
- `GET /api/auth/*` - NextAuth endpoints

### To Be Implemented
- `GET /api/documents` - List user's documents
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/set-standard` - Set as standard NDA
- `GET /api/comparisons` - List comparison history
- `GET /api/comparisons/:id` - Get comparison details
- `POST /api/export` - Generate PDF/DOCX export

## User Workflows

### 1. Upload Standard NDA
1. User logs in via Azure AD
2. Navigates to upload page
3. Uploads their standard NDA template
4. System extracts text and stores document
5. User marks document as "standard"

### 2. Compare Third-Party NDA
1. User uploads third-party NDA
2. Selects standard NDA for comparison
3. System processes both documents
4. AI generates comparison and suggestions
5. Results displayed with differences highlighted

### 3. Export Results
1. User reviews comparison results
2. Optionally edits AI suggestions
3. Exports as PDF or DOCX
4. Downloads formatted report

## Performance Requirements
- Upload: < 30 seconds for 10MB file
- Text extraction: < 60 seconds per document
- Comparison: < 2 minutes for full analysis
- Export: < 30 seconds to generate

## Security Requirements
- All endpoints require authentication
- User data isolation (users see only their documents)
- S3 files organized by user ID
- Database queries filtered by user_id
- No sensitive data in logs

## Current Blockers

### Critical (Blocking Development)
1. **S3 Bucket**: `vvg-nda-analyzer` doesn't exist
   - **Impact**: Cannot test upload functionality
   - **Resolution**: Use `vvg-cloud-storage` bucket

2. **Database Permissions**: Cannot CREATE TABLE
   - **Impact**: Cannot store document metadata
   - **Resolution**: Waiting on Satyen for permissions

### Non-Critical (Can Work Around)
1. **OpenAI API Key**: Not configured
   - **Impact**: Comparison returns mock data
   - **Resolution**: Continue with mock data for MVP

2. **EC2 Instance**: Not provisioned
   - **Impact**: Cannot deploy to production
   - **Resolution**: Continue local development

## MVP Scope

### Phase 1: Core Upload (Can Do Now)
- ✅ Authentication flow
- ✅ Upload API endpoint
- 🔄 Fix S3 bucket configuration
- 🔄 Document library UI
- 🔄 View uploaded documents

### Phase 2: Text Processing (After DB Permissions)
- Create database tables
- Integrate text extraction
- Store extracted text
- Process uploaded documents

### Phase 3: Comparison (After OpenAI Key)
- Implement real comparison logic
- Generate AI suggestions
- Display results UI
- Store comparison history

### Phase 4: Export & Polish
- PDF/DOCX export
- Improved UI/UX
- Performance optimization
- Error handling

## Success Criteria
1. Users can authenticate via Azure AD
2. Users can upload NDA documents
3. System extracts text accurately
4. Comparison identifies key differences
5. AI suggestions are relevant and helpful
6. Exports are professionally formatted
7. All user data is properly isolated

## Assumptions
- Users have Azure AD accounts
- NDAs are in English
- Documents are text-based (not scanned images initially)
- Users have modern browsers
- S3 storage is available

## Out of Scope
- Multi-language support (initial version)
- OCR for scanned documents (initial version)
- Collaborative editing
- Version control for documents
- Email notifications
- Mobile app

## Next Steps
1. **Immediate**: Update S3 bucket configuration to use existing bucket
2. **Today**: Build document library UI and test upload flow
3. **This Week**: Get database permissions from Satyen
4. **Next Week**: Integrate text extraction and implement comparison

---

**Last Updated**: 2025-07-03
**Document Version**: 1.0
**Status**: Authoritative requirements document