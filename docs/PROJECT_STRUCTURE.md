# Project Structure

## Key Directories

```
NDA/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API endpoints
│   │   ├── upload/        # File upload endpoint
│   │   ├── compare/       # Document comparison
│   │   └── migrate-db/    # Database schema
│   ├── (dashboard)/       # Protected routes
│   └── upload/            # Upload page
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components (40+)
│   └── upload-nda.tsx    # Upload component
│
├── lib/                   # Utilities
│   ├── db.ts             # Database connection
│   └── text-extraction.ts # Document processing
│
├── docs/                  # Documentation
└── public/               # Static assets
```

## Database Schema

See `/app/api/migrate-db/route.ts` for the authoritative schema.

## Key Files

- `.env.local` - Environment configuration
- `middleware.ts` - Auth protection
- `next.config.js` - Next.js configuration

## Adding New Features

1. **API Routes**: Add to `/app/api/`
2. **Pages**: Add to `/app/` following Next.js conventions
3. **Components**: Add to `/components/` with proper exports
4. **Utilities**: Add to `/lib/` for reusable logic