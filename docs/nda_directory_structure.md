# NDA Analyzer - Complete Directory Structure

## 📁 Full Project Structure

```
NDA/                          # Root directory (EXISTING)
│
├── 📂 app/                                # Next.js 15 App Router (EXISTING)
│   ├── 📂 (dashboard)/                    # Existing dashboard routes
│   │   ├── 📄 layout.tsx                 # Dashboard layout (EXISTING)
│   │   ├── 📄 page.tsx                   # Dashboard home (EXISTING)
│   │   └── 📂 [existing-routes]/         # Other existing routes
│   │
│   ├── 📂 nda/                           # 🆕 NEW: NDA Feature Routes
│   │   ├── 📄 layout.tsx                 # 🆕 NDA section layout
│   │   ├── 📄 page.tsx                   # 🆕 NDA dashboard/home
│   │   ├── 📄 loading.tsx                # 🆕 Loading UI for NDA pages
│   │   ├── 📄 error.tsx                  # 🆕 Error UI for NDA pages
│   │   │
│   │   ├── 📂 upload/                    # 🆕 Document Upload Pages
│   │   │   ├── 📄 page.tsx               # 🆕 Upload interface
│   │   │   └── 📄 loading.tsx            # 🆕 Upload loading state
│   │   │
│   │   ├── 📂 documents/                 # 🆕 Document Management
│   │   │   ├── 📄 page.tsx               # 🆕 Document library view
│   │   │   ├── 📂 [id]/                  # 🆕 Individual document pages
│   │   │   │   ├── 📄 page.tsx           # 🆕 Document details
│   │   │   │   ├── 📄 edit/page.tsx      # 🆕 Edit document metadata
│   │   │   │   └── 📄 activate/page.tsx  # 🆕 Activate as standard
│   │   │   └── 📄 loading.tsx            # 🆕 Documents loading state
│   │   │
│   │   ├── 📂 compare/                   # 🆕 Document Comparison
│   │   │   ├── 📄 page.tsx               # 🆕 Comparison setup
│   │   │   ├── 📂 [comparisonId]/        # 🆕 Comparison results
│   │   │   │   ├── 📄 page.tsx           # 🆕 Results display
│   │   │   │   └── 📄 loading.tsx        # 🆕 Results loading
│   │   │   └── 📄 loading.tsx            # 🆕 Compare loading state
│   │   │
│   │   ├── 📂 history/                   # 🆕 Comparison History
│   │   │   ├── 📄 page.tsx               # 🆕 History list
│   │   │   └── 📄 loading.tsx            # 🆕 History loading
│   │   │
│   │   └── 📂 settings/                  # 🆕 NDA Settings
│   │       ├── 📄 page.tsx               # 🆕 Settings interface
│   │       └── 📄 loading.tsx            # 🆕 Settings loading
│   │
│   ├── 📂 api/                           # API Routes (EXISTING + NEW)
│   │   ├── 📂 auth/                      # NextAuth routes (EXISTING)
│   │   │   └── 📂 [...nextauth]/
│   │   │       └── 📄 route.ts           # NextAuth config (EXISTING)
│   │   │
│   │   ├── 📂 [existing-api-routes]/     # Other existing API routes
│   │   │
│   │   └── 📂 nda/                       # 🆕 NEW: NDA API Routes
│   │       ├── 📄 route.ts               # 🆕 General NDA API info
│   │       │
│   │       ├── 📂 upload/                # 🆕 File Upload API
│   │       │   └── 📄 route.ts           # 🆕 POST /api/nda/upload
│   │       │
│   │       ├── 📂 documents/             # 🆕 Document Management API
│   │       │   ├── 📄 route.ts           # 🆕 GET/POST /api/nda/documents
│   │       │   └── 📂 [id]/
│   │       │       ├── 📄 route.ts       # 🆕 GET/PUT/DELETE /api/nda/documents/[id]
│   │       │       ├── 📂 activate/
│   │       │       │   └── 📄 route.ts   # 🆕 POST /api/nda/documents/[id]/activate
│   │       │       └── 📂 download/
│   │       │           └── 📄 route.ts   # 🆕 GET /api/nda/documents/[id]/download
│   │       │
│   │       ├── 📂 compare/               # 🆕 Comparison API
│   │       │   └── 📄 route.ts           # 🆕 POST /api/nda/compare
│   │       │
│   │       ├── 📂 comparisons/           # 🆕 Comparison Results API
│   │       │   ├── 📄 route.ts           # 🆕 GET /api/nda/comparisons
│   │       │   └── 📂 [id]/
│   │       │       ├── 📄 route.ts       # 🆕 GET /api/nda/comparisons/[id]
│   │       │       └── 📂 rerun/
│   │       │           └── 📄 route.ts   # 🆕 POST /api/nda/comparisons/[id]/rerun
│   │       │
│   │       ├── 📂 process/               # 🆕 Processing Status API
│   │       │   └── 📂 [id]/
│   │       │       └── 📄 route.ts       # 🆕 GET /api/nda/process/[id]
│   │       │
│   │       └── 📂 analytics/             # 🆕 Analytics API (Future)
│   │           └── 📄 route.ts           # 🆕 GET /api/nda/analytics
│   │
│   ├── 📄 layout.tsx                     # Root layout (EXISTING)
│   ├── 📄 page.tsx                       # Home page (EXISTING)
│   ├── 📄 loading.tsx                    # Global loading (EXISTING)
│   ├── 📄 error.tsx                      # Global error (EXISTING)
│   ├── 📄 not-found.tsx                  # 404 page (EXISTING)
│   └── 📄 globals.css                    # Global styles (EXISTING)
│
├── 📂 components/                        # Components (EXISTING + NEW)
│   ├── 📂 ui/                           # shadcn/ui components (EXISTING)
│   │   ├── 📄 button.tsx                # (EXISTING - 40+ components)
│   │   ├── 📄 input.tsx                 # (EXISTING)
│   │   ├── 📄 card.tsx                  # (EXISTING)
│   │   ├── 📄 table.tsx                 # (EXISTING)
│   │   ├── 📄 progress.tsx              # (EXISTING)
│   │   ├── 📄 toast.tsx                 # (EXISTING)
│   │   ├── 📄 dialog.tsx                # (EXISTING)
│   │   ├── 📄 tabs.tsx                  # (EXISTING)
│   │   ├── 📄 badge.tsx                 # (EXISTING)
│   │   ├── 📄 skeleton.tsx              # (EXISTING)
│   │   └── 📄 ... [35+ more]            # (EXISTING)
│   │
│   ├── 📂 nda/                          # 🆕 NEW: NDA-Specific Components
│   │   ├── 📄 index.ts                  # 🆕 Export barrel
│   │   │
│   │   ├── 📂 upload/                   # 🆕 Upload Components
│   │   │   ├── 📄 upload-form.tsx       # 🆕 Main upload form
│   │   │   ├── 📄 file-dropzone.tsx     # 🆕 Drag-drop area
│   │   │   ├── 📄 upload-progress.tsx   # 🆕 Upload progress bar
│   │   │   └── 📄 file-validator.tsx    # 🆕 File validation UI
│   │   │
│   │   ├── 📂 documents/                # 🆕 Document Components
│   │   │   ├── 📄 document-library.tsx  # 🆕 Main document list
│   │   │   ├── 📄 document-card.tsx     # 🆕 Individual document card
│   │   │   ├── 📄 document-actions.tsx  # 🆕 Action buttons/menu
│   │   │   ├── 📄 document-filters.tsx  # 🆕 Filter/search controls
│   │   │   └── 📄 standard-nda-badge.tsx # 🆕 Active standard indicator
│   │   │
│   │   ├── 📂 comparison/               # 🆕 Comparison Components
│   │   │   ├── 📄 comparison-setup.tsx  # 🆕 Select documents to compare
│   │   │   ├── 📄 comparison-view.tsx   # 🆕 Side-by-side comparison
│   │   │   ├── 📄 diff-highlighter.tsx  # 🆕 Text difference highlighting
│   │   │   ├── 📄 ai-analysis.tsx       # 🆕 AI analysis display
│   │   │   └── 📄 suggestions-panel.tsx # 🆕 AI suggestions panel
│   │   │
│   │   ├── 📂 results/                  # 🆕 Results Components
│   │   │   ├── 📄 results-display.tsx   # 🆕 Main results container
│   │   │   ├── 📄 results-summary.tsx   # 🆕 Executive summary
│   │   │   ├── 📄 results-details.tsx   # 🆕 Detailed analysis
│   │   │   ├── 📄 export-buttons.tsx    # 🆕 Export options
│   │   │   └── 📄 results-history.tsx   # 🆕 Previous comparisons
│   │   │
│   │   ├── 📂 status/                   # 🆕 Status Components
│   │   │   ├── 📄 processing-status.tsx # 🆕 Processing indicator
│   │   │   ├── 📄 status-badge.tsx      # 🆕 Status badges
│   │   │   ├── 📄 progress-tracker.tsx  # 🆕 Multi-step progress
│   │   │   └── 📄 error-display.tsx     # 🆕 Error state display
│   │   │
│   │   ├── 📂 settings/                 # 🆕 Settings Components
│   │   │   ├── 📄 settings-panel.tsx    # 🆕 Main settings panel
│   │   │   ├── 📄 nda-preferences.tsx   # 🆕 User preferences
│   │   │   └── 📄 active-standard.tsx   # 🆕 Manage active standard
│   │   │
│   │   └── 📂 shared/                   # 🆕 Shared NDA Components
│   │       ├── 📄 nda-layout.tsx        # 🆕 Common NDA page layout
│   │       ├── 📄 nda-header.tsx        # 🆕 NDA section header
│   │       ├── 📄 nda-navigation.tsx    # 🆕 NDA sub-navigation
│   │       └── 📄 nda-breadcrumbs.tsx   # 🆕 Breadcrumb navigation
│   │
│   └── 📂 [existing-components]/        # Other existing components
│
├── 📂 lib/                              # Utilities (EXISTING + NEW)
│   ├── 📄 auth.ts                       # NextAuth config (EXISTING)
│   ├── 📄 database.ts                   # MySQL connection (EXISTING)
│   ├── 📄 s3.ts                         # S3 utilities (EXISTING)
│   ├── 📄 utils.ts                      # General utilities (EXISTING)
│   │
│   ├── 📂 nda/                          # 🆕 NEW: NDA Utilities
│   │   ├── 📄 index.ts                  # 🆕 Export barrel
│   │   ├── 📄 database.ts               # 🆕 NDA database operations
│   │   ├── 📄 file-processing.ts        # 🆕 PDF/DOCX text extraction
│   │   ├── 📄 openai.ts                 # 🆕 OpenAI integration
│   │   ├── 📄 s3-operations.ts          # 🆕 NDA-specific S3 operations
│   │   ├── 📄 document-parser.ts        # 🆕 Document parsing logic
│   │   ├── 📄 comparison-engine.ts      # 🆕 Comparison logic
│   │   ├── 📄 validation.ts             # 🆕 Input validation schemas
│   │   ├── 📄 types.ts                  # 🆕 TypeScript type definitions
│   │   └── 📄 constants.ts              # 🆕 NDA-specific constants
│   │
│   └── 📂 [existing-lib-files]/         # Other existing utilities
│
├── 📂 hooks/                            # Custom Hooks (EXISTING + NEW)
│   ├── 📄 [existing-hooks].ts           # Existing custom hooks
│   │
│   └── 📂 nda/                          # 🆕 NEW: NDA Hooks
│       ├── 📄 index.ts                  # 🆕 Export barrel
│       ├── 📄 use-document-upload.ts    # 🆕 File upload hook
│       ├── 📄 use-documents.ts          # 🆕 Document management hook
│       ├── 📄 use-comparison.ts         # 🆕 Comparison management hook
│       ├── 📄 use-processing-status.ts  # 🆕 Status polling hook
│       ├── 📄 use-nda-settings.ts       # 🆕 Settings management hook
│       └── 📄 use-debounced-search.ts   # 🆕 Search functionality hook
│
├── 📂 types/                            # Type Definitions (EXISTING + NEW)
│   ├── 📄 index.ts                      # General types (EXISTING)
│   ├── 📄 auth.ts                       # Auth types (EXISTING)
│   ├── 📄 database.ts                   # Database types (EXISTING)
│   │
│   └── 📂 nda/                          # 🆕 NEW: NDA Types
│       ├── 📄 index.ts                  # 🆕 Export barrel
│       ├── 📄 document.ts               # 🆕 Document type definitions
│       ├── 📄 comparison.ts             # 🆕 Comparison type definitions
│       ├── 📄 api.ts                    # 🆕 API request/response types
│       ├── 📄 ui.ts                     # 🆕 UI component prop types
│       └── 📄 openai.ts                 # 🆕 OpenAI response types
│
├── 📂 styles/                           # Styles (EXISTING)
│   ├── 📄 globals.css                   # Global styles with Tailwind (EXISTING)
│   └── 📄 [existing-styles]             # Other existing styles
│
├── 📂 public/                           # Static Assets (EXISTING + NEW)
│   ├── 📂 icons/                        # Existing icons
│   ├── 📂 images/                       # Existing images
│   │
│   └── 📂 nda/                          # 🆕 NEW: NDA Assets
│       ├── 📄 nda-icon.svg              # 🆕 NDA feature icon
│       ├── 📄 document-placeholder.svg  # 🆕 Document placeholder
│       ├── 📄 comparison-illustration.svg # 🆕 Comparison illustration
│       └── 📄 upload-placeholder.svg    # 🆕 Upload area placeholder
│
├── 📂 database/                         # 🆕 NEW: Database Scripts
│   ├── 📂 migrations/                   # 🆕 Database migrations
│   │   ├── 📄 001_create_nda_tables.sql # 🆕 Initial NDA tables
│   │   ├── 📄 002_add_indexes.sql       # 🆕 Performance indexes
│   │   └── 📄 003_add_constraints.sql   # 🆕 Data constraints
│   │
│   ├── 📂 seeds/                        # 🆕 Test data (development)
│   │   ├── 📄 sample_documents.sql      # 🆕 Sample NDA documents
│   │   └── 📄 test_users.sql            # 🆕 Test user data
│   │
│   └── 📄 schema.sql                    # 🆕 Complete schema definition
│
├── 📂 docs/                             # 🆕 NEW: Documentation
│   ├── 📄 README.md                     # 🆕 NDA feature documentation
│   ├── 📄 API.md                        # 🆕 API documentation
│   ├── 📄 DEPLOYMENT.md                 # 🆕 Deployment guide
│   └── 📄 TROUBLESHOOTING.md            # 🆕 Common issues guide
│
├── 📂 __tests__/                        # 🆕 NEW: Tests (if using)
│   ├── 📂 components/
│   │   └── 📂 nda/                      # 🆕 NDA component tests
│   ├── 📂 api/
│   │   └── 📂 nda/                      # 🆕 NDA API tests
│   └── 📂 lib/
│       └── 📂 nda/                      # 🆕 NDA utility tests
│
├── 📄 middleware.ts                     # NextAuth middleware (EXISTING)
├── 📄 next.config.js                    # Next.js config (EXISTING)
├── 📄 tailwind.config.js                # Tailwind config (EXISTING)
├── 📄 tsconfig.json                     # TypeScript config (EXISTING)
├── 📄 package.json                      # Dependencies (EXISTING + NEW)
├── 📄 .env.local                        # Environment variables (EXISTING + NEW)
├── 📄 .env.example                      # Environment template (EXISTING + NEW)
├── 📄 .gitignore                        # Git ignore (EXISTING)
├── 📄 CLAUDE.md                         # 🆕 Navigation guide (CREATED)
└── 📄 README.md                         # Project README (EXISTING)
```

## 📝 Key Directory Insights

### 🔧 **Integration Points**
- **Existing Auth**: Leverages `app/api/auth/[...nextauth]/route.ts`
- **Existing Database**: Uses `lib/database.ts` connection
- **Existing S3**: Extends `lib/s3.ts` utilities
- **Existing UI**: Uses all `components/ui/` shadcn components

### 🆕 **New Additions Required**
- **42 new files/directories** for complete NDA feature
- **8 API routes** for backend functionality
- **20+ components** following existing patterns
- **Database migrations** for 3 new tables
- **TypeScript types** for type safety

### 🎯 **Development Priority Order**
1. **Database** (`database/migrations/`) - Foundation
2. **Types** (`types/nda/`) - Type safety
3. **API Routes** (`app/api/nda/`) - Backend logic
4. **Utilities** (`lib/nda/`) - Business logic
5. **Components** (`components/nda/`) - UI elements
6. **Pages** (`app/nda/`) - User interface

### 🔒 **Security Boundaries**
- All new API routes include NextAuth session validation
- Database operations filtered by `user_email`
- S3 operations use user-specific folder structure
- File uploads validated for type and size

This structure maintains clean separation while leveraging your existing Next.js infrastructure efficiently.
