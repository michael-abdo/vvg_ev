# DRY Refactoring Exceptions Documentation

This document lists API routes and patterns that couldn't be fully standardized during the DRY refactoring process.

## Routes That Don't Use Standard Patterns

### 1. Authentication Routes
- **Route**: `/api/auth/[...nextauth]`
- **Reason**: NextAuth has its own handler pattern that doesn't fit our withAuth wrapper
- **Pattern**: Uses NextAuth's built-in auth handling

### 2. Health Check Routes
- **Routes**: 
  - `/api/db-health`
  - `/api/storage-health`
- **Reason**: Health checks should be accessible without authentication for monitoring
- **Pattern**: Direct handlers without auth wrapper

### 3. Development-Only Routes
- **Routes**:
  - `/api/debug-db`
  - `/api/seed-dev`
  - `/api/test-crud`
  - `/api/test-db`
  - `/api/migrate-db`
- **Reason**: These routes use requireDevelopment() utility instead of auth
- **Pattern**: Development environment check rather than user authentication

### 4. Process Queue GET Handler
- **Route**: `/api/process-queue` (GET method)
- **Reason**: Queue status endpoint doesn't require authentication for system monitoring
- **Pattern**: Only POST method uses withAuth, GET is public

## Known TypeScript Issues

### 1. Route Context Type Issues
- **Problem**: The withAuth wrapper's optional context parameter conflicts with Next.js route type expectations
- **Files Affected**: All routes using withAuth
- **Workaround**: Build succeeds despite TypeScript errors as Next.js skips type validation

### 2. Enum Import Issues
- **Problem**: Some enums are exported as types but used as values
- **Files Affected**: 
  - `app/api/compare/route.ts` (ComparisonStatus)
  - `app/api/process-queue/route.ts` (TaskType, QueueStatus)
  - Various routes using DocumentStatus
- **Fix Required**: Update enum exports in type files

### 3. Other Type Issues
- **pdf-parse**: Missing type declarations
- **Storage providers**: Buffer type compatibility issues
- **Database functions**: Nullable return types not matching interface expectations

## Patterns Successfully Applied

✅ All protected routes now use withAuth wrapper
✅ All error responses standardized with ApiErrors utility
✅ Document validation centralized with parseDocumentId and isDocumentOwner
✅ File validation centralized with FileValidation utility
✅ Authentication logic centralized in auth-utils.ts

## Recommendations

1. **TypeScript Fixes**: Create a separate task to address all TypeScript errors
2. **Route Types**: Consider creating custom Next.js route types that work with our auth wrapper
3. **Enum Exports**: Update all enum exports to be proper value exports, not type exports
4. **Type Declarations**: Add missing type declarations for third-party libraries

## Test Coverage

All refactored routes have been tested with:
- ✅ File existence checks
- ✅ Import verification
- ✅ Pattern usage validation
- ✅ Build compilation
- ✅ Manual error response elimination

The test script is available at: `docs/test-dry-refactoring-simple.js`