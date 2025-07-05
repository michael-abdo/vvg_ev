# NDA Analyzer

AI-powered legal document analysis tool for comparing Non-Disclosure Agreements.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables in .env.local
# (Database, AWS, OpenAI credentials)

# Start clean development server
npm run dev

# OR start with test documents seeded automatically
npm run dev:seed
```

## Available Commands

### Development
- **`npm run dev`** - Start development server
- **`npm run dev:clean`** - Start with port cleanup
- **`npm run dev:seed`** - Start server + automatically seed test documents

### Production
- **`npm run build`** - Build for production
- **`npm run start`** - Start production server
- **`npm run lint`** - Run linting
- **`npm run db:migrate`** - Run database migrations

## Environment Setup

Requires these environment variables in `.env.local`:

```bash
# Database (MySQL via SSM tunnel)
MYSQL_HOST=127.0.0.1
MYSQL_PORT=10003
MYSQL_USER=your-username
MYSQL_PASSWORD="your-password"
MYSQL_DATABASE=truck_scrape  # Legacy name, will rename to nda_analyzer

# Authentication (Azure AD)
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Storage (AWS S3)
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=vvg-cloud-storage

# AI Analysis (OpenAI)
OPENAI_API_KEY=your-openai-key
```

## Database Connection

Start SSM tunnel for database access:

```bash
aws ssm start-session --target i-07fba3edeb2e54729 \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters host="vtcawsinnovationmysql01-cluster.cluster-c1hfshlb6czo.us-west-2.rds.amazonaws.com",portNumber="3306",localPortNumber="10003"
```

## Features

- **Document Upload**: Upload NDAs in PDF, DOCX, or TXT format
- **AI Analysis**: Compare documents using OpenAI GPT models
- **Template Management**: Standard VVG templates vs third-party NDAs
- **Secure Storage**: AWS S3 with local fallback for development
- **Authentication**: Azure AD integration

## Code Organization

### Centralized Utilities & Components

The codebase follows DRY (Don't Repeat Yourself) principles with centralized utilities and reusable components:

#### `lib/utils.ts`
- **`ApiErrors`** - Standardized API error responses (401, 404, 400, 500, etc.)
- **`FileValidation`** - Centralized file upload validation
  - Allowed types: PDF, DOCX, DOC, TXT
  - Max size: 10MB
  - MIME type detection
  - Validation error handling
- **`requireDevelopment()`** - Development environment enforcement

#### `lib/auth-utils.ts`
- **`withAuth()`** - Higher-order function for API route authentication
- Replaces inline session checking across all protected endpoints

#### `components/page-container.tsx`
- **`PageContainer`** - Consistent page layout wrapper
- Provides standard container spacing (p-8)
- Accepts optional className for customization

#### `components/page-title.tsx`
- **`PageTitle`** - Consistent page headings
- Supports optional description text
- Standard text-3xl font-bold styling

#### Usage Examples

```typescript
// API routes with authentication
export const GET = withAuth(async (request: NextRequest, userEmail: string) => {
  // userEmail is guaranteed to exist
});

// File validation
const validationError = FileValidation.getValidationError(file);
if (validationError) return validationError;

// Standardized error responses
return ApiErrors.unauthorized();
return ApiErrors.notFound('Document');

// Page layout components
<PageContainer>
  <PageTitle description="Optional description">
    Page Title
  </PageTitle>
  {/* Page content */}
</PageContainer>
```

### Eliminated Duplicates

The following duplicate files were removed during DRY refactoring:
- `components/ui/use-mobile.tsx` → use `hooks/use-mobile.tsx`
- `hooks/use-toast.ts` → use `components/ui/use-toast.ts`
- `styles/globals.css` → use `app/globals.css`
- `tests/documents/` → consolidated into `documents/vvg/`

## Project Structure

```
NDA/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── compare/           # Document comparison page
│   ├── documents/         # Document library page
│   └── upload/            # Upload page
├── components/            # React components
│   └── ui/               # UI components (shadcn/ui)
├── database/              # Database migrations and scripts
├── deployment/            # Deployment configurations
├── docs/                  # Documentation
│   ├── MASTER.md         # Master documentation
│   ├── CHANGELOG.md      # Project changelog
│   ├── development/      # Development docs
│   ├── git-workflow/     # Git workflow documentation
│   ├── project-status/   # Project status reports
│   └── testing/          # Testing documentation
├── documents/             # Sample NDA documents
│   ├── third-party/      # Third-party NDAs
│   └── vvg/              # VVG standard templates
├── hooks/                 # React hooks
├── lib/                   # Library code
│   ├── nda/              # NDA-specific modules
│   └── storage/          # Storage abstraction
├── public/                # Static assets
├── scripts/               # Build and dev scripts
├── tests/                 # Test files
│   └── scripts/          # Test scripts
└── types/                 # TypeScript type definitions

## Architecture

See [`docs/MASTER.md`](docs/MASTER.md) for detailed system architecture and tech stack.