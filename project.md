# NDA Analyzer App - Project Overview

## 🧠 Big Picture: What are we building?

You're deploying a fullstack NDA Analyzer App that:
- Lives at a public subdomain (https://legal.vtc.systems/nda-analyzer)
- Authenticates users via SSO (Azure AD) ✅ IMPLEMENTED
- Processes NDA documents and stores data in S3 + MySQL DB ✅ PARTIALLY IMPLEMENTED
- Uses Tesseract/LayoutParser for text extraction (planned)
- Generates OpenAI-based comparison + suggestions (mock implemented)
- Is hosted on a Linux EC2 instance with NGINX + PM2 (pending deployment)

## 🔧 Components and Their Roles

| Component | What it does | How it connects |
|-----------|--------------|-----------------|
| Frontend (Next.js or similar) | User-facing UI | Sends requests to API, handles auth |
| Backend (FastAPI / Node.js) | Serves APIs for upload, parse, compare | Proxied by NGINX |
| NGINX | Reverse proxy + static server | Accepts traffic on :80, forwards to backend |
| PM2 | Keeps your backend process alive | Used to run backend on EC2 |
| SSO (Azure AD) | Handles user authentication | Callback URL configured per project |
| MySQL | Stores metadata (e.g., doc pointers) | Shared RDS instance (truck_scrape database) |
| S3 | Stores actual PDFs, comparison outputs | Keeps database clean |
| Tesseract/LayoutParser | Extracts text from uploaded NDAs | Replaces Textract for cost reasons |
| OpenAI API | Compares NDAs, suggests edits | Output stored in S3 to avoid re-calls |
| GitHub repo | Contains the stripped base project (auth + UI) | Use Jack's truck repo as starter |

## 🔐 Auth: What you're setting up

You're using Azure AD for authentication, and these URLs matter:

| Purpose | URL |
|---------|-----|
| App Base | https://legal.vtc.systems/nda-analyzer |
| Auth Callback (Prod) | https://legal.vtc.systems/nda-analyzer/api/auth/callback/azure-ad |
| Auth Callback (Dev) | http://localhost:3000/api/auth/callback/azure-ad |
| Sign-in Page | https://legal.vtc.systems/nda-analyzer/sign-in |

✅ You confirmed with Jack this naming is correct and consistent with previous apps.

## 🌐 Infra Flow Summary (Request Lifecycle)

```
User ➝ legal.vtc.systems/nda-analyzer
  |
  └──> [NGINX (EC2)]
           |
           ├── static assets? serve directly
           └── /api/... ➝ http://localhost:3000 (your backend)
                              |
                              └── process doc, auth, etc.
```

## 📦 GitHub Setup

- Use vvg_truckscrape as a template, clone it, start a new repo
- Strip pages/APIs you don't need
- Drop in your .env
- Rebuild npm run build, deploy with pm2

## 📂 Data Flow and Storage

```
Uploaded NDA (PDF) ➝ S3
           |
           └──> Tesseract/LayoutParser ➝ text ➝ OpenAI
                                          |
                                          ├── comparison
                                          └── suggestions
                                                  |
                                    Save both in JSON to S3
                                                  |
                        DB stores document + pointer to result
```

## 📊 DB Schema (final)

- **documents**: stores file metadata + hash + S3 URL
- **comparisons**: links 2 documents + pointer to S3 result
- **exports**: final PDF/DOCX download links

✅ You're not storing raw suggestions in DB, just pointers

Jack suggested a tracking table — just for user/audit history

## 🧠 What Jack is doing for you

Jack's giving you:
- An NGINX template that already works with Microsoft auth
- A PM2-based app deploy pattern
- A GitHub starter template with working auth already built in
- Access to Satyen/Bhavik to coordinate EC2 + DB setup

## ✅ What you're doing right

- Picking Tesseract/LayoutParser over Textract for cost control
- Keeping DB lean (only pointers, not payloads)
- Confirming with Jack to follow prior naming/infra patterns
- Modularizing components for reuse in future Legal Doc projects

## ✅ Progress Completed

| Task | Status | Date |
|------|--------|------|
| Clone vvg_truckscrape repo as template | ✅ DONE | 2025-07-03 |
| Strip unnecessary pages/APIs | ✅ DONE | 2025-07-03 |
| Configure local auth environment | ✅ DONE | 2025-07-03 |
| Test auth flow on localhost:3000 | ✅ DONE | 2025-07-03 |
| Verify NextAuth + Azure AD integration | ✅ DONE | 2025-07-03 |
| **Database access confirmed** | ✅ DONE | 2025-07-03 |

**Local Development Ready:** App runs successfully on localhost:3000 with working Azure AD authentication.

**Database Connection Fully Operational:** 
- MySQL RDS: `vtcawsinnovationmysql01-cluster.cluster-c1hfshlb6czo.us-west-2.rds.amazonaws.com`
- User: `michael` (SELECT, INSERT, UPDATE, DELETE permissions)
- Database: `truck_scrape` (using existing database)
- Connection: Via AWS SSM tunnel on localhost:10003
- Status: ✅ **WORKING** - App can read/write data successfully

**Critical Configuration Notes:**
- Password in .env.local must be quoted: `MYSQL_PASSWORD="Ei#qs9T!px@Wso"`
- Requires AWS SSM tunnel: `aws ssm start-session --target i-07fba3edeb2e54729 --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters host="vtcawsinnovationmysql01-cluster.cluster-c1hfshlb6czo.us-west-2.rds.amazonaws.com",portNumber="3306",localPortNumber="10003" --profile vvg`
- Available tables: manufacturer_model_au, vvg_trucklistings, vvg_trucklistings_au
- User lacks CREATE DATABASE/TABLE permissions (contact Satyen for schema creation)

## 🧭 Remaining Tasks  

| Task | Owner | Status |
|------|-------|--------|
| **Request CREATE TABLE permissions or dedicated NDA schema** | Reach out to Satyen | **NEXT PRIORITY** |
| Add NDA processing logic (upload/extract/compare) | You | **READY** - Database working |
| Generate sample NDA flow (upload ➝ extract ➝ compare ➝ suggest ➝ export) | You | **READY** - Database working |
| Configure S3 bucket for document storage | You | Can start with existing AWS creds |
| Get EC2 instance provisioned | Reach out to Satyen | Still needed for deployment |
| Write NGINX config, deploy via PM2 | You, guided by Jack's Loom | After EC2 |
| Schedule feedback loop with Carmen (legal/db insight) | In progress | - |

## 🏗️ Current Implementation Status

**✅ Already Implemented:**
1. **Authentication**: Azure AD SSO via NextAuth fully working
2. **Database Connection**: MySQL via SSM tunnel operational
3. **Upload API**: `/api/upload` endpoint with S3 integration
4. **Upload UI**: Complete upload component with drag-drop
5. **Comparison API**: `/api/compare` endpoint (mock implementation)
6. **Dashboard**: Basic UI with navigation to upload page
7. **S3 Integration**: AWS SDK configured and working

**🚧 Partially Implemented:**
1. **Database Schema**: Tables defined but not created (pending permissions)
2. **Text Extraction**: Utility library created but not integrated
3. **Document Viewing**: No UI yet for viewing uploaded documents

**❌ Not Yet Implemented:**
1. **Tesseract/LayoutParser** integration
2. **OpenAI API** integration (missing API key)
3. **Export functionality** (PDF/DOCX generation)
4. **Document library** view
5. **Real comparison** logic
6. **Production deployment**

## 🗄️ Database Schema

See `/app/api/migrate-db/route.ts` for the authoritative MySQL schema definition (3 tables: nda_documents, nda_comparisons, nda_exports).

## 🚨 Critical Blockers

1. **S3 Bucket**: `vvg-nda-analyzer` does NOT exist
   - Need to either create this bucket OR
   - Use an existing bucket like `vvg-cloud-storage`
   
2. **Database Permissions**: Cannot CREATE TABLE
   - Waiting on Satyen for permissions
   
3. **OpenAI API Key**: Not configured
   - Required for actual NDA comparison

## 🚀 Next Immediate Actions

**TODAY - While Waiting for Permissions:**
1. **Fix S3 bucket configuration** (use existing bucket or request new one)
2. **Build document library UI** to view uploaded files
3. **Integrate text extraction** library with upload flow
4. **Create comparison UI** for selecting documents

**ONCE PERMISSIONS GRANTED:**
1. Run database migration to create tables
2. Test full upload → store → retrieve flow
3. Implement real OpenAI comparison

**FOR PRODUCTION DEPLOYMENT:**
1. Contact Satyen for EC2 instance 
2. Deploy app to EC2 using Jack's NGINX + PM2 pattern
3. Update production URLs and configure production SSM tunnel

## TL;DR

You're building a secure, high-trust, document-processing tool backed by a simple EC2 + NGINX + S3 + DB stack. Jack's giving you a clean baseline, and you're doing exactly the right thing by:
- Validating each step
- Keeping infra minimal but extensible
- Avoiding premature complexity
- Designing for reuse and cost-awareness

You're on track. Just keep confirming each part works before layering on complexity, and you'll ship something solid. Let me know if you want a starter nginx.conf, .env, or PM2 boot script template — happy to provide.