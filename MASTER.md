# NDA Analyzer - Master Documentation

**This is the single source of truth. All other documents reference this file.**

Last Updated: 2025-07-03 | Version: 1.0.0

---

## 🏗️ System Architecture

### Tech Stack (Locked In)
- **Frontend**: Next.js 15.2.4 with TypeScript
- **Authentication**: Azure AD via NextAuth  
- **Database**: MySQL via AWS RDS (truck_scrape - legacy, rename to nda_analyzer)
- **Storage**: AWS S3 (vvg-cloud-storage bucket)
- **AI**: OpenAI GPT-4 (configured)
- **Deployment**: EC2 + NGINX + PM2

### Core Components
1. **Upload System**: `/app/api/upload` → S3 storage
2. **Comparison Engine**: `/app/api/compare` → AI analysis
3. **Document Library**: User document management
4. **Export System**: PDF/DOCX generation

### Database Schema
Source: `/app/api/migrate-db/route.ts`
- `nda_documents` - Document metadata
- `nda_comparisons` - Comparison results  
- `nda_exports` - Generated exports

---


---

## 🚀 Implementation Plan

### Phase 1: MVP Features (Current)
1. Fix S3 bucket configuration
2. Build document library with mock data
3. Create comparison UI

### Phase 2: Database Integration (Blocked)
1. Run schema migration
2. Connect upload to database
3. Implement real queries

### Phase 3: AI Integration (Ready)
1. Integrate text extraction
2. Connect OpenAI API (✅ API key configured)
3. Build export system

### Phase 4: Deployment (Ready)
- Deployment files created: nginx config, PM2 config, deploy script
- EC2 access needed for final deployment


---

## 🔧 Developer Guide


### API Patterns
All APIs require authentication:
```typescript
const session = await getServerSession(authOptions)
if (!session?.user?.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Code Patterns

**Database Queries**:
```typescript
import { executeQuery } from '@/lib/db'

const documents = await executeQuery({
  query: 'SELECT * FROM nda_documents WHERE user_id = ?',
  values: [session.user.email]
})
```

**S3 Upload**:
```typescript
const s3Key = `${process.env.S3_FOLDER_PREFIX}users/${userEmail}/documents/${fileHash}/${filename}`
await s3Client.send(new PutObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME,
  Key: s3Key,
  Body: buffer
}))
```

---

## 📋 Requirements

### Core Features
1. **Upload NDAs** - PDF/DOCX support with deduplication
2. **Compare Documents** - AI-powered analysis
3. **View Results** - Side-by-side comparison
4. **Export Summary** - PDF/DOCX download

### User Workflows
1. Login → Upload Standard NDA → Mark as template
2. Upload Third-party NDA → Select comparison → View results
3. Review suggestions → Export summary

### Success Metrics
- Upload: < 30 seconds for 10MB
- Comparison: < 2 minutes
- 95% text extraction accuracy

### API Endpoints

**Implemented**:
- `POST /api/upload` - Upload document to S3
- `POST /api/compare` - Compare two documents (mock)
- `GET /api/test-db` - Test database connection
- `POST /api/migrate-db` - Run schema migration

**To Implement**:
- `GET /api/documents` - List user's documents
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/set-standard` - Mark as standard
- `GET /api/comparisons` - List comparison history
- `POST /api/export` - Generate PDF/DOCX

---


---

## 📞 Contact Directory

- **Database/EC2**: Satyen
- **Azure AD**: Bhavik  
- **AWS/S3**: AWS Admin
- **Deployment**: Jack

---

## 📚 Document Map

- **Quick Start & Running**: See `README.md`
- **Current Status & Blockers**: See `STATUS.md`
- **Deployment Config**: See `deployment/` directory (nginx, PM2, deploy scripts)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-07-03 | Initial master document |
| 1.0.1 | 2025-07-03 | Updated blockers: EC2 access, deployment files ready |
| 1.0.2 | 2025-07-04 | Consolidated documentation, OpenAI configured, simplified workflow |

---

**Remember**: This document is the source of truth. Update here first, then propagate to other docs if needed.