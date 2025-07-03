# NDA Analyzer - Master Documentation

**This is the single source of truth. All other documents reference this file.**

Last Updated: 2025-07-03 | Version: 1.0.0

---

## 🏗️ System Architecture

### Tech Stack (Locked In)
- **Frontend**: Next.js 15.2.4 with TypeScript
- **Authentication**: Azure AD via NextAuth  
- **Database**: MySQL via AWS RDS (truck_scrape)
- **Storage**: AWS S3 (vvg-cloud-storage bucket)
- **AI**: OpenAI GPT-4 (planned)
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

## 📊 Current Status

### Working ✅
- Azure AD authentication
- MySQL connection (via SSM tunnel)
- Upload API endpoint
- Basic UI structure

### Blocked ❌
- **S3 Permissions**: No access to any bucket → Contact AWS admin
- **DB Permissions**: Cannot CREATE TABLE → Contact Satyen
- **OpenAI Key**: Not provided → Use mock data

### In Progress 🔄
- Document library UI
- Text extraction integration

For detailed status: See `Status Report` section below.

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

### Phase 3: AI Integration (Blocked)
1. Integrate text extraction
2. Connect OpenAI API
3. Build export system

For detailed roadmap: See `Development Phases` section below.

---

## 🔧 Developer Guide

### Environment Setup
```bash
# 1. Start SSM tunnel
aws ssm start-session --target i-07fba3edeb2e54729 \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters host="vtcawsinnovationmysql01-cluster.cluster-c1hfshlb6czo.us-west-2.rds.amazonaws.com",portNumber="3306",localPortNumber="10003" \
  --profile vvg

# 2. Start development
npm run dev
```

### Key Environment Variables
- `MYSQL_PASSWORD="Ei#qs9T!px@Wso"` (must be quoted!)
- `S3_BUCKET_NAME=vvg-cloud-storage`
- `S3_FOLDER_PREFIX=nda-analyzer/`

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

## 🔍 Quick Reference

### Status Report
**Current Blockers & Workarounds**
| Issue | Impact | Workaround | Owner |
|-------|---------|------------|-------|
| S3 Access Denied | Cannot upload | Use local storage | AWS Admin |
| No CREATE TABLE | Cannot persist | Use mock data | Satyen |
| No OpenAI Key | No AI analysis | Return mock results | Manager |

### Development Phases
**MVP Roadmap (Working Around Blockers)**
| Phase | Description | Can Start? | Duration |
|-------|-------------|------------|----------|
| 1 | Document UI | ✅ Now | 3 days |
| 2 | Text Extraction | ✅ Now | 2 days |
| 3 | Mock Comparison | ✅ Now | 2 days |
| 4 | Database Integration | ❌ Blocked | 2 days |
| 5 | Real AI | ❌ Blocked | 3 days |

### Contact Directory
- **Database/EC2**: Satyen
- **Azure AD**: Bhavik  
- **AWS/S3**: AWS Admin
- **Deployment**: Jack

---

## 📚 Document Map

This master document eliminates the need for most other docs, but for specific deep-dives:

- **Quick Start**: `README.md` (points here)
- **Detailed Status**: Generate from "Status Report" section
- **Development Tasks**: Generate from "Development Phases" section
- **Code Patterns**: See "Developer Guide" section

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-07-03 | Initial master document |

---

**Remember**: This document is the source of truth. Update here first, then propagate to other docs if needed.