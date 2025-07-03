# NDA Analyzer Project Design

## 🌐 Overview

This project is a web-based NDA Analyzer Tool hosted under: ``

It allows users to upload third-party NDAs, compare them against a standard NDA, and receive AI-generated suggestions for alignment, along with an exportable summary.

---

## 🧱 Core Tech Stack

- **Frontend**: Next.js or similar (auth-enabled)
- **Backend**: Node.js or FastAPI (running under PM2)
- **Auth**: Azure AD SSO via OpenID Connect
- **OCR/Parsing**: Tesseract + LayoutParser (modular for future AWS Textract integration)
- **AI Comparison/Suggestion**: OpenAI GPT (via `gpt-4o`)
- **File Storage**: Amazon S3
- **Database**: PostgreSQL (new DB on existing instance)
- **Proxy/Ingress**: NGINX
- **Server Process Management**: PM2 on EC2

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

## 🗂 Database Schema (Lean Pointers Model)

### `documents`

Stores uploaded NDA metadata.

```sql
id UUID PRIMARY KEY,
owner_id TEXT,
file_name TEXT,
s3_url TEXT,
file_hash TEXT,
doc_type TEXT CHECK (doc_type IN ('STANDARD', 'THIRD_PARTY')),
created_at TIMESTAMP DEFAULT now()
```

### `comparisons`

Links two NDAs with a pointer to OpenAI output.

```sql
id UUID PRIMARY KEY,
standard_doc_id UUID REFERENCES documents(id),
third_party_doc_id UUID REFERENCES documents(id),
comparison_s3_url TEXT,
created_at TIMESTAMP DEFAULT now()
```

### `exports`

Holds generated summary exports.

```sql
id UUID PRIMARY KEY,
comparison_id UUID REFERENCES comparisons(id),
export_type TEXT CHECK (export_type IN ('PDF', 'DOCX')),
s3_url TEXT,
created_at TIMESTAMP DEFAULT now()
```

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

## ✅ Remaining Tasks

-

