# NDA Analyzer Project Design

## 🌐 Overview

This project is a web-based NDA Analyzer Tool hosted under: ``

It allows users to upload third-party NDAs, compare them against a standard NDA, and receive AI-generated suggestions for alignment, along with an exportable summary.

---

## 🧱 Core Tech Stack (Current Implementation)

- **Frontend**: Next.js 15.2.4 with TypeScript ✅ IMPLEMENTED
- **Backend**: Next.js API Routes (no separate backend) ✅ IMPLEMENTED
- **Auth**: Azure AD SSO via NextAuth ✅ IMPLEMENTED
- **OCR/Parsing**: Tesseract + LayoutParser (planned)
- **AI Comparison/Suggestion**: OpenAI GPT (mock implemented, awaiting API key)
- **File Storage**: Amazon S3 ✅ IMPLEMENTED
- **Database**: MySQL (shared truck_scrape database) ✅ CONNECTED
- **Proxy/Ingress**: NGINX (for production deployment)
- **Server Process Management**: PM2 on EC2 (for production deployment)

---

## 📂 Routes & Auth URLs

| Purpose                  | URL                                                                 |
| ------------------------ | ------------------------------------------------------------------- |
| App base                 | `https://legal.vtc.systems/nda-analyzer`                            |
| Azure AD Callback (prod) | `https://legal.vtc.systems/nda-analyzer/api/auth/callback/azure-ad` |
| Local dev callback       | `http://localhost:3000/api/auth/callback/azure-ad`                  |
| Sign-in page             | `https://legal.vtc.systems/nda-analyzer/sign-in`                    |

---

## 🛠 Infra & Deployment

1. **Provision EC2 instance**
2. **Install NGINX** (configured to proxy to backend)
3. **Configure buffer settings for Microsoft auth in **``
4. **Clone stripped GitHub starter repo from VVG**
5. **Install app dependencies**
6. **Use PM2 to manage backend:**

```bash
npm install
npm run build
pm run start
pm2 start npm --name nda-analyzer -- start
```

---

## 🗂 Database Schema

See `/app/api/migrate-db/route.ts` for the authoritative MySQL schema implementation with 3 tables:
- `nda_documents` - Stores uploaded NDA metadata
- `nda_comparisons` - Links two NDAs with comparison results
- `nda_exports` - Holds generated summary exports

---

## 📁 S3 JSON Structure (Stored at `comparison_s3_url`)

```json
{
  "model": "gpt-4o",
  "prompt_version": "v2.1",
  "inputs": {
    "standard_doc_id": "uuid1",
    "third_party_doc_id": "uuid2"
  },
  "comparison": { ... },
  "suggestions": [ ... ],
  "status": "approved",
  "approved_by": "legal@example.com",
  "approved_at": "2025-07-02T17:00:00Z"
}
```

---

## 🔁 Flow Summary

1. **Upload** standard & third-party NDA → store in S3
2. **Extract** text using Tesseract + LayoutParser
3. **Generate** diff and suggestions with OpenAI
4. **Store** OpenAI result as JSON in S3
5. **Expose** suggestions in UI
6. **Generate export** PDF/DOCX and store pointer

---

## 🔐 Notes

- SSO set up via Bhavik
- EC2 and DB provisioned via Satyen
- Auth-enabled repo template provided by Jack (clone but don't overwrite)
- NGINX buffer tuning ensures Microsoft auth doesn't break at scale

---

## 📊 Implementation Status

### ✅ Completed
- Azure AD authentication via NextAuth
- MySQL database connection
- S3 integration with AWS SDK
- Upload API endpoint (`/api/upload`)
- Upload UI component with drag-drop
- Basic dashboard with navigation
- Mock comparison API (`/api/compare`)

### 🚧 In Progress
- Database schema (defined but not created - pending permissions)
- Text extraction utilities (created but not integrated)
- Document library UI

### ❌ Not Started
- Tesseract/LayoutParser integration
- OpenAI API integration (missing API key)
- Export functionality (PDF/DOCX)
- Real comparison logic
- EC2 deployment

## 🚨 Current Blockers

1. **S3 Bucket**: `vvg-nda-analyzer` doesn't exist
   - Consider using `vvg-cloud-storage` instead
2. **Database Permissions**: Cannot CREATE TABLE
   - Waiting on Satyen
3. **OpenAI API Key**: Not configured
   - Required for comparison feature

## ✅ Next Steps

1. **Immediate** (can do now):
   - Fix S3 bucket configuration
   - Build document library UI
   - Integrate text extraction with upload
   
2. **After Permissions**:
   - Run database migration
   - Test full document workflow
   
3. **Production**:
   - Get EC2 instance from Satyen
   - Deploy with NGINX + PM2

