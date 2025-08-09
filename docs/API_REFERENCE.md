# API Reference

## Overview

The VVG Template provides a RESTful API for document processing and comparison. All API endpoints follow consistent patterns for authentication, error handling, and response formatting.

## Authentication

Most endpoints require authentication via NextAuth.js session cookies. Development endpoints can bypass authentication using the `X-Dev-Bypass: true` header.

## Base URL

- Development: `http://localhost:3000`
- Production: Configure via `NEXTAUTH_URL` environment variable

## API Endpoints

### Health & Status

#### GET /api/health
Check application health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

#### GET /api/db-health
Check database connection status.

**Response:**
```json
{
  "status": "connected",
  "mode": "mysql|memory",
  "message": "Database connection successful"
}
```

#### GET /api/storage-health
Check storage provider status.

**Response:**
```json
{
  "status": "healthy",
  "provider": "local|s3",
  "bucket": "bucket-name"
}
```

### Authentication

#### GET /api/auth/session
Get current user session.

**Response:**
```json
{
  "user": {
    "email": "user@example.com",
    "name": "User Name",
    "image": "https://..."
  },
  "expires": "2025-01-01T00:00:00.000Z"
}
```

#### GET /api/auth/providers
List available authentication providers.

**Response:**
```json
{
  "azure-ad": {
    "id": "azure-ad",
    "name": "Azure Active Directory",
    "type": "oauth"
  }
}
```

### Document Management

#### GET /api/documents
List all documents for the authenticated user.

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Items per page (default: 10)
- `sort` (string): Sort field (created_at, filename)
- `order` (string): Sort order (asc, desc)

**Response:**
```json
{
  "documents": [
    {
      "id": "doc_123",
      "filename": "contract.pdf",
      "fileHash": "abc123...",
      "fileSize": 1024000,
      "isStandard": false,
      "hasExtractedText": true,
      "extractedTextLength": 5000,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET /api/documents/:id
Get document details by ID.

**Response:**
```json
{
  "document": {
    "id": "doc_123",
    "filename": "contract.pdf",
    "fileHash": "abc123...",
    "fileSize": 1024000,
    "isStandard": false,
    "hasExtractedText": true,
    "extractedText": "Document content...",
    "metadata": {},
    "downloadUrl": "https://...",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/upload
Upload a new document.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field
- Optional: `isStandard` (boolean) field

**Response:**
```json
{
  "document": {
    "id": "doc_123",
    "filename": "contract.pdf",
    "fileHash": "abc123...",
    "fileSize": 1024000,
    "uploadUrl": "https://..."
  },
  "message": "Document uploaded successfully"
}
```

#### DELETE /api/documents/:id
Delete a document.

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

#### POST /api/documents/:id/set-standard
Mark a document as the standard template.

**Response:**
```json
{
  "message": "Document set as standard successfully"
}
```

### Document Comparison

#### POST /api/compare
Compare two documents using AI analysis.

**Request:**
```json
{
  "standardDocumentId": "doc_123",
  "comparisonDocumentId": "doc_456"
}
```

**Response:**
```json
{
  "comparison": {
    "id": "comp_789",
    "status": "completed",
    "similarityScore": 0.85,
    "summary": "The documents have significant differences in...",
    "differences": [
      {
        "section": "Confidentiality",
        "importance": "high",
        "standardText": "...",
        "comparisonText": "...",
        "explanation": "..."
      }
    ],
    "suggestions": [
      {
        "type": "recommendation",
        "message": "Consider negotiating...",
        "priority": "high"
      }
    ],
    "processingTimeMs": 1500
  }
}
```

#### POST /api/compare/simple
Simplified comparison endpoint with immediate response.

**Request:**
```json
{
  "standardDocumentId": "doc_123",
  "comparisonDocumentId": "doc_456"
}
```

**Response:**
```json
{
  "result": {
    "summary": "Quick comparison summary...",
    "keyDifferences": ["..."],
    "recommendation": "..."
  }
}
```

#### GET /api/comparisons
List comparison history.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "comparisons": [
    {
      "id": "comp_789",
      "document1": {...},
      "document2": {...},
      "status": "completed",
      "similarityScore": 0.85,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### Processing Queue

#### POST /api/process-queue
Process pending document extraction tasks.

**Response:**
```json
{
  "processed": 5,
  "failed": 0,
  "message": "Queue processing completed"
}
```

### Development Endpoints

#### POST /api/seed-dev
Seed development database with sample data.

**Headers:**
- `X-Dev-Bypass: true` (required)

**Response:**
```json
{
  "message": "Development data seeded successfully",
  "documentsCreated": 3
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### Common Error Codes

- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `FILE_TOO_LARGE` - Upload exceeds size limit
- `UNSUPPORTED_FILE_TYPE` - Invalid file format
- `PROCESSING_ERROR` - Document processing failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Anonymous: 10 requests per minute
- Authenticated: 100 requests per minute
- Upload endpoints: 10 requests per hour

## File Upload Limits

- Maximum file size: 10MB
- Supported formats: PDF, DOCX, DOC, TXT
- Files are validated for type and content

## Response Headers

All API responses include:
- `X-Request-ID`: Unique request identifier
- `X-Response-Time`: Processing time in milliseconds
- `Content-Type`: application/json

## Webhooks

The API supports webhooks for asynchronous events (coming soon):
- Document processing completed
- Comparison analysis finished
- Document deleted

## SDK Examples

### JavaScript/TypeScript
```typescript
// Upload document
const formData = new FormData();
formData.append('file', fileBlob);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});

// Compare documents
const comparison = await fetch('/api/compare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    standardDocumentId: 'doc_123',
    comparisonDocumentId: 'doc_456'
  }),
  credentials: 'include'
});
```

### cURL
```bash
# Upload document
curl -X POST http://localhost:3000/api/upload \
  -H "Cookie: next-auth.session-token=..." \
  -F "file=@document.pdf"

# Compare documents
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"standardDocumentId":"doc_123","comparisonDocumentId":"doc_456"}'
```

## API Versioning

The API currently uses URL-based versioning. Future versions will be available at:
- `/api/v2/...`
- `/api/v3/...`

The current unversioned endpoints (`/api/...`) will continue to work and map to v1.