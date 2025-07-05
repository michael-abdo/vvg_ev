# LOCAL TESTING CHECKLIST - DRY Refactoring Validation

## ✅ PHASE 1: CORE FUNCTIONALITY (Can Test Now)

### Build & Development
- [ ] `npm run build` - Production build succeeds
- [ ] `npm run dev` - Development server starts
- [ ] `npm run dev:seed` - Seeding works (4 documents)
- [ ] No TypeScript errors in build
- [ ] No import errors from deleted duplicates

### Storage Abstraction Layer
- [ ] File upload via `/api/upload` (local storage)
- [ ] File download works
- [ ] File validation (PDF, DOCX, DOC, TXT)
- [ ] File size limits (10MB)
- [ ] Hash-based deduplication

### Database Abstraction Layer  
- [ ] Document creation via API
- [ ] Document listing via `/api/documents`
- [ ] Document deletion
- [ ] In-memory store persists across hot reloads
- [ ] Seeded documents visible in `/documents` page

### Authentication Middleware
- [ ] Protected routes return 401 without session
- [ ] `withAuth()` wrapper functions correctly
- [ ] Error responses use centralized `ApiErrors`
- [ ] Sign-in page renders (won't authenticate)

### File Validation Utilities
- [ ] `FileValidation.validateFile()` works
- [ ] `FileValidation.getContentType()` returns correct MIME types  
- [ ] `FileValidation.getValidationError()` catches invalid files
- [ ] Upload endpoint rejects invalid file types/sizes

### UI Components & Pages
- [ ] All pages render without import errors
- [ ] Toast notifications work (consolidated use-toast)
- [ ] Mobile responsiveness (consolidated use-mobile)
- [ ] No CSS conflicts from deleted globals.css

## 🟡 PHASE 2: INFRASTRUCTURE TESTING (Requires EC2/RDS/S3)

### Database Migration
- [ ] SSM tunnel connection works
- [ ] `DB_CREATE_ACCESS=true` environment variable set
- [ ] Migration runs: `/api/migrate-db`
- [ ] MySQL tables created successfully
- [ ] Switch from in-memory to MySQL storage

### S3 Storage Integration
- [ ] AWS credentials configured
- [ ] S3 bucket accessible
- [ ] File uploads to S3 work
- [ ] Signed URL generation works
- [ ] Storage abstraction switches to S3

### Azure AD Authentication
- [ ] Azure AD tenant configuration
- [ ] Client ID/Secret/Tenant ID configured
- [ ] Login flow works end-to-end
- [ ] Real user sessions created
- [ ] Multi-user document isolation

### OpenAI Integration
- [ ] `OPENAI_API_KEY` configured
- [ ] Document comparison API calls
- [ ] Text extraction works
- [ ] AI analysis returns real results

## 🔴 PHASE 3: PRODUCTION VALIDATION (Full Infrastructure)

### Performance & Scale
- [ ] Large file uploads (approaching 10MB)
- [ ] Multiple concurrent users
- [ ] Database performance with real data
- [ ] S3 upload/download speed

### Security & Access
- [ ] Proper authentication in production
- [ ] File access permissions
- [ ] API rate limiting
- [ ] Error handling doesn't leak sensitive data

### Backup & Recovery
- [ ] Database backup procedures
- [ ] S3 backup configuration
- [ ] Disaster recovery testing

## 🎯 CONFIDENCE LEVELS

- **80% Confidence**: Phase 1 (LOCAL) ← YOU CAN DO THIS NOW
- **90% Confidence**: Phase 2 (INFRASTRUCTURE) ← Need EC2/RDS/S3
- **95% Confidence**: Phase 3 (PRODUCTION) ← Full deployment testing

## 🚨 ROLLBACK CRITERIA

If ANY Phase 2 test fails:
1. Reset to commit `26a1b28` (co-worker's validated baseline)
2. Cherry-pick only the safe 15% NDA improvements:
   - `FileValidation` utilities
   - `ApiErrors` enhancements  
   - Documentation updates
3. Discard the risky 85% template cleanup

## 📋 TESTING COMMANDS

```bash
# Phase 1 - Local Testing
npm run build
npm run dev:seed
curl http://localhost:3000/api/documents  # Should return 401
curl -X POST http://localhost:3000/api/upload  # Test file validation

# Phase 2 - Infrastructure Testing (when available)
npm run db:migrate
curl http://localhost:3000/api/storage-health
curl http://localhost:3000/api/db-health

# Phase 3 - Production Testing
# Full user workflow testing
# Performance monitoring
# Security auditing
```