# API Reference

Complete API documentation for the Document Processing Template.

## 🔗 Base URL

- **Development**: `http://localhost:3000/template/api`
- **Production**: `https://your-domain.com/template/api`

## 🔐 Authentication

All API endpoints (except health checks) require authentication via NextAuth.js session or API key.

### Session Authentication
```javascript
// Client-side with next-auth
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
// Session automatically included in requests
```

### API Key Authentication
```bash
# Include in headers
Authorization: Bearer your-api-key
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "abc-123-def"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file type",
    "details": {
      "field": "file",
      "allowedTypes": ["pdf", "docx", "txt"]
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "abc-123-def"
  }
}
```

## 🏥 Health & Status

### GET /health
Application health check.

**Authentication**: None required

```bash
curl https://your-domain.com/template/api/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### GET /db-health
Database connectivity check.

**Authentication**: None required

```bash
curl https://your-domain.com/template/api/db-health
```

**Response**:
```json
{
  "database": "connected",
  "tablesExist": true,
  "migrationStatus": "up-to-date",
  "connectionPool": {
    "active": 2,
    "idle": 8,
    "total": 10
  }
}
```

### GET /storage-health
Storage connectivity check.

**Authentication**: None required

```bash
curl https://your-domain.com/template/api/storage-health
```

**Response**:
```json
{
  "storage": "s3",
  "accessible": true,
  "permissions": "read-write",
  "bucketName": "your-bucket-name",
  "region": "us-west-2"
}
```

## 📄 Documents

### GET /documents
List user's documents with pagination.

**Authentication**: Required

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in filename and content
- `type` (string): Filter by file type (`pdf`, `docx`, `txt`)
- `sort` (string): Sort field (`created_at`, `filename`, `size`)
- `order` (string): Sort order (`asc`, `desc`)

```bash
curl -H "Authorization: Bearer your-token" \
  "https://your-domain.com/template/api/documents?page=1&limit=10&search=contract&sort=created_at&order=desc"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_123",
      "filename": "contract.pdf",
      "originalName": "Employment Contract.pdf",
      "size": 1024000,
      "mimeType": "application/pdf",
      "status": "processed",
      "isStandard": false,
      "extractedText": "Contract text...",
      "metadata": {
        "pages": 5,
        "wordCount": 1500
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### POST /documents
Upload a new document.

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Body Parameters**:
- `file` (file): Document file (PDF, DOCX, TXT)
- `isStandard` (boolean): Mark as standard template (optional)

```bash
curl -X POST \
  -H "Authorization: Bearer your-token" \
  -F "file=@contract.pdf" \
  -F "isStandard=false" \
  https://your-domain.com/template/api/documents
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "doc_123",
    "filename": "contract.pdf",
    "originalName": "Employment Contract.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "status": "processing",
    "processingId": "queue_456"
  }
}
```

### GET /documents/:id
Get document details.

**Authentication**: Required (document owner only)

```bash
curl -H "Authorization: Bearer your-token" \
  https://your-domain.com/template/api/documents/doc_123
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "doc_123",
    "filename": "contract.pdf",
    "originalName": "Employment Contract.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "status": "processed",
    "isStandard": false,
    "extractedText": "Full contract text...",
    "metadata": {
      "pages": 5,
      "wordCount": 1500,
      "language": "en",
      "confidence": 0.95
    },
    "downloadUrl": "https://s3.../doc_123.pdf?expires=...",
    "previewUrl": "https://s3.../doc_123_preview.png?expires=...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /documents/:id
Update document metadata.

**Authentication**: Required (document owner only)

**Content-Type**: `application/json`

**Body Parameters**:
- `isStandard` (boolean): Mark as standard template
- `metadata` (object): Custom metadata

```bash
curl -X PUT \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"isStandard": true, "metadata": {"category": "employment"}}' \
  https://your-domain.com/template/api/documents/doc_123
```

### DELETE /documents/:id
Delete a document.

**Authentication**: Required (document owner only)

```bash
curl -X DELETE \
  -H "Authorization: Bearer your-token" \
  https://your-domain.com/template/api/documents/doc_123
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Document deleted successfully",
    "deletedId": "doc_123"
  }
}
```

### GET /documents/:id/download
Download original document file.

**Authentication**: Required (document owner only)

```bash
curl -H "Authorization: Bearer your-token" \
  -o contract.pdf \
  https://your-domain.com/template/api/documents/doc_123/download
```

Returns the original file with appropriate Content-Type and Content-Disposition headers.

### GET /documents/:id/preview
Get document preview (first page as image).

**Authentication**: Required (document owner only)

```bash
curl -H "Authorization: Bearer your-token" \
  -o preview.png \
  https://your-domain.com/template/api/documents/doc_123/preview
```

### POST /documents/:id/extract
Re-extract text from document.

**Authentication**: Required (document owner only)

```bash
curl -X POST \
  -H "Authorization: Bearer your-token" \
  https://your-domain.com/template/api/documents/doc_123/extract
```

**Response**:
```json
{
  "success": true,
  "data": {
    "extractedText": "Extracted text content...",
    "metadata": {
      "wordCount": 1500,
      "language": "en",
      "confidence": 0.95
    },
    "status": "processed"
  }
}
```

### POST /documents/:id/set-standard
Mark/unmark document as standard template.

**Authentication**: Required (document owner only)

**Body Parameters**:
- `isStandard` (boolean): True to mark as standard

```bash
curl -X POST \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"isStandard": true}' \
  https://your-domain.com/template/api/documents/doc_123/set-standard
```

## 🔍 Document Comparison

### POST /compare
Compare two documents using AI.

**Authentication**: Required

**Content-Type**: `application/json`

**Body Parameters**:
- `document1Id` (string): First document ID
- `document2Id` (string): Second document ID
- `comparisonType` (string): Type of comparison (`detailed`, `summary`, `legal`)
- `focusAreas` (array): Specific areas to focus on (optional)

```bash
curl -X POST \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "document1Id": "doc_123",
    "document2Id": "doc_456",
    "comparisonType": "detailed",
    "focusAreas": ["terms", "obligations", "termination"]
  }' \
  https://your-domain.com/template/api/compare
```

**Response**:
```json
{
  "success": true,
  "data": {
    "comparisonId": "comp_789",
    "status": "processing",
    "estimatedTime": 30,
    "documents": {
      "document1": {
        "id": "doc_123",
        "filename": "standard_template.pdf"
      },
      "document2": {
        "id": "doc_456",
        "filename": "client_contract.pdf"
      }
    }
  }
}
```

### POST /compare/simple
Simple text-based comparison without AI.

**Authentication**: Required

**Body Parameters**:
- `document1Id` (string): First document ID
- `document2Id` (string): Second document ID

```bash
curl -X POST \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "document1Id": "doc_123",
    "document2Id": "doc_456"
  }' \
  https://your-domain.com/template/api/compare/simple
```

**Response**:
```json
{
  "success": true,
  "data": {
    "similarity": 0.85,
    "differences": [
      {
        "section": "Terms and Conditions",
        "type": "addition",
        "content": "Additional clause about remote work"
      },
      {
        "section": "Compensation",
        "type": "modification",
        "original": "$50,000 annually",
        "modified": "$55,000 annually"
      }
    ],
    "statistics": {
      "totalWords": 1500,
      "commonWords": 1275,
      "differentWords": 225
    }
  }
}
```

### GET /compare/:id
Get comparison results.

**Authentication**: Required

```bash
curl -H "Authorization: Bearer your-token" \
  https://your-domain.com/template/api/compare/comp_789
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "comp_789",
    "status": "completed",
    "comparisonType": "detailed",
    "documents": {
      "document1": {
        "id": "doc_123",
        "filename": "standard_template.pdf",
        "role": "template"
      },
      "document2": {
        "id": "doc_456",
        "filename": "client_contract.pdf",
        "role": "comparison"
      }
    },
    "results": {
      "overallSimilarity": 0.82,
      "riskLevel": "medium",
      "summary": "The document contains several deviations from the standard template...",
      "sections": [
        {
          "name": "Compensation",
          "similarity": 0.95,
          "riskLevel": "low",
          "changes": [
            {
              "type": "modification",
              "description": "Salary amount increased",
              "impact": "low",
              "recommendation": "Review if within budget"
            }
          ]
        }
      ],
      "keyDifferences": [
        "Additional remote work clause",
        "Modified termination notice period",
        "New intellectual property section"
      ],
      "recommendations": [
        "Review remote work policy compliance",
        "Verify termination notice meets legal requirements"
      ]
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "completedAt": "2024-01-01T00:00:30.000Z"
  }
}
```

## 📈 Dashboard & Analytics

### GET /dashboard/stats
Get user dashboard statistics.

**Authentication**: Required

```bash
curl -H "Authorization: Bearer your-token" \
  https://your-domain.com/template/api/dashboard/stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalDocuments": 25,
    "standardTemplates": 5,
    "thirdPartyDocuments": 20,
    "totalComparisons": 12,
    "recentActivity": [
      {
        "type": "document_upload",
        "description": "Uploaded contract.pdf",
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      {
        "type": "comparison_completed",
        "description": "Compared standard_template.pdf with client_contract.pdf",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "storageUsed": {
      "bytes": 52428800,
      "formatted": "50 MB"
    },
    "comparisonHistory": {
      "thisMonth": 5,
      "lastMonth": 8,
      "trend": "decrease"
    }
  }
}
```

## ⚙️ Processing Queue

### GET /process-queue
Get processing queue status.

**Authentication**: Required (admin only)

```bash
curl -H "Authorization: Bearer your-token" \
  https://your-domain.com/template/api/process-queue
```

**Response**:
```json
{
  "success": true,
  "data": {
    "active": 2,
    "waiting": 5,
    "completed": 150,
    "failed": 3,
    "jobs": [
      {
        "id": "job_123",
        "type": "text_extraction",
        "documentId": "doc_456",
        "status": "active",
        "progress": 75,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 🔧 Utility Endpoints

### POST /validate-url
Validate if a URL is accessible for document upload.

**Authentication**: Required

**Body Parameters**:
- `url` (string): URL to validate

```bash
curl -X POST \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/document.pdf"}' \
  https://your-domain.com/template/api/validate-url
```

**Response**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "accessible": true,
    "contentType": "application/pdf",
    "contentLength": 1024000,
    "filename": "document.pdf"
  }
}
```

## 📧 Email Integration

### POST /email/send
Send email notification.

**Authentication**: Required

**Body Parameters**:
- `to` (string): Recipient email
- `subject` (string): Email subject
- `template` (string): Email template name
- `data` (object): Template data

```bash
curl -X POST \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Document Comparison Complete",
    "template": "comparison_complete",
    "data": {
      "comparisonId": "comp_789",
      "documentName": "contract.pdf"
    }
  }' \
  https://your-domain.com/template/api/email/send
```

## ❌ Error Codes

### Authentication Errors
- `AUTH_REQUIRED` (401): Authentication required
- `AUTH_INVALID` (401): Invalid authentication token
- `AUTH_EXPIRED` (401): Authentication token expired
- `PERMISSION_DENIED` (403): Insufficient permissions

### Validation Errors
- `VALIDATION_ERROR` (400): Invalid request data
- `INVALID_FILE_TYPE` (400): Unsupported file type
- `FILE_TOO_LARGE` (400): File exceeds size limit
- `MISSING_REQUIRED_FIELD` (400): Required field missing

### Resource Errors
- `DOCUMENT_NOT_FOUND` (404): Document not found
- `COMPARISON_NOT_FOUND` (404): Comparison not found
- `DOCUMENT_NOT_ACCESSIBLE` (403): Document belongs to another user

### Processing Errors
- `PROCESSING_FAILED` (500): Document processing failed
- `EXTRACTION_FAILED` (500): Text extraction failed
- `COMPARISON_FAILED` (500): Document comparison failed
- `STORAGE_ERROR` (500): File storage error

### Rate Limiting
- `RATE_LIMIT_EXCEEDED` (429): Too many requests

## 🔒 Security Headers

All API responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## 📚 SDKs & Client Libraries

### JavaScript/TypeScript
```bash
npm install @your-org/vvg-template-sdk
```

```javascript
import { VVGTemplateClient } from '@your-org/vvg-template-sdk'

const client = new VVGTemplateClient({
  baseUrl: 'https://your-domain.com/template/api',
  apiKey: 'your-api-key'
})

// Upload document
const document = await client.documents.upload(file)

// Compare documents
const comparison = await client.compare.create({
  document1Id: 'doc_123',
  document2Id: 'doc_456'
})
```

### Python
```bash
pip install vvg-template-sdk
```

```python
from vvg_template import VVGTemplateClient

client = VVGTemplateClient(
    base_url='https://your-domain.com/template/api',
    api_key='your-api-key'
)

# Upload document
document = client.documents.upload('contract.pdf')

# Compare documents
comparison = client.compare.create(
    document1_id='doc_123',
    document2_id='doc_456'
)
```

---

**Need help?** Check the [troubleshooting guide](../deployment/troubleshooting.md) or create an issue on GitHub.