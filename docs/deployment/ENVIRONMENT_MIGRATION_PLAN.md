# Environment Configuration Migration Plan

## Overview

This plan outlines the migration from the current 9-file environment structure to the recommended 3-file best practice structure, ensuring zero downtime and improved security.

## Migration Goals

1. **Simplify** from 9 environment files to 3 core files
2. **Secure** by removing all sensitive placeholders from committed files
3. **Standardize** environment variable loading order
4. **Document** clear deployment procedures

## Target Structure

```
.env                    # Base configuration (committed)
.env.production         # Production overrides (committed)
.env.local             # Secrets & local overrides (gitignored)
```

## Phase 1: Preparation (Day 1)

### Step 1: Create Base Configuration File

Create `.env` with shared non-sensitive defaults:

```bash
# .env - Base Configuration (Safe to commit)
# This file contains non-sensitive defaults used across all environments

# =================================================================
# CORE CONFIGURATION
# =================================================================
NODE_ENV=development
ENVIRONMENT=development
PROJECT_NAME=vvg-template
PROJECT_DISPLAY_NAME="VVG Template"

# =================================================================
# APPLICATION SETTINGS
# =================================================================
PORT=3001
LOG_LEVEL=info
MAX_UPLOAD_SIZE=10485760

# =================================================================
# PATHS AND URLS (Defaults)
# =================================================================
BASE_PATH=
NEXT_PUBLIC_BASE_PATH=
SIGNIN_PAGE=/sign-in
SIGNOUT_PAGE=/auth/signout
DASHBOARD_PATH=/dashboard
DEFAULT_REDIRECT_PATH=/dashboard

# =================================================================
# FEATURE FLAGS
# =================================================================
FEATURE_DEV_BYPASS=false
ENABLE_CACHE=true

# =================================================================
# DATABASE CONFIGURATION (Non-sensitive)
# =================================================================
MYSQL_PORT=3306
MYSQL_DATABASE=vvg_template
DB_CREATE_ACCESS=false

# =================================================================
# STORAGE CONFIGURATION (Non-sensitive)
# =================================================================
STORAGE_PROVIDER=local
LOCAL_UPLOAD_DIR=./uploads
LOCAL_STORAGE_PATH=./storage
S3_ACCESS=false
AWS_REGION=us-east-1

# =================================================================
# EMAIL CONFIGURATION (Non-sensitive)
# =================================================================
AWS_SES_SMTP_HOST=email-smtp.us-west-2.amazonaws.com
AWS_SES_SMTP_PORT=587
ENABLE_EMAIL_IN_DEV=false

# =================================================================
# SECURITY DEFAULTS
# =================================================================
SECURE_COOKIES=false
TRUST_PROXY=false
```

### Step 2: Create Production Configuration

Create `.env.production` with production-specific non-sensitive overrides:

```bash
# .env.production - Production Configuration (Safe to commit)
# Loaded when NODE_ENV=production, overrides values from .env

# =================================================================
# ENVIRONMENT
# =================================================================
NODE_ENV=production
ENVIRONMENT=production
PROJECT_DISPLAY_NAME="VVG Template - Production"

# =================================================================
# PRODUCTION URLS (Non-sensitive)
# =================================================================
APP_DOMAIN=legal.vtc.systems
BASE_PATH=/vvg-template
NEXT_PUBLIC_BASE_PATH=/vvg-template

# =================================================================
# PRODUCTION SETTINGS
# =================================================================
LOG_LEVEL=error
FEATURE_DEV_BYPASS=false
DB_CREATE_ACCESS=true
STORAGE_PROVIDER=s3
S3_ACCESS=true

# =================================================================
# PRODUCTION DATABASE (Non-sensitive)
# =================================================================
MYSQL_HOST=production-db.cluster-xyz.us-east-1.rds.amazonaws.com
MYSQL_DATABASE=vvg_template_production

# =================================================================
# PRODUCTION STORAGE (Non-sensitive)
# =================================================================
S3_BUCKET_NAME=vvg-template-production-documents
S3_FOLDER_PREFIX=production/

# =================================================================
# SECURITY
# =================================================================
SECURE_COOKIES=true
TRUST_PROXY=true
```

### Step 3: Update .env.example

Create a new `.env.example` that ONLY shows what goes in `.env.local`:

```bash
# .env.example - Template for .env.local
# Copy this file to .env.local and add your secrets
# NEVER commit .env.local to version control

# =================================================================
# REQUIRED SECRETS
# =================================================================

# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Azure AD OAuth
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_REDIRECT_URI=http://localhost:3001/api/auth/callback/azure-ad

# Database
MYSQL_HOST=localhost
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password

# AWS Credentials (if using S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# API Keys
OPENAI_API_KEY=your-openai-key

# Email (if using AWS SES)
AWS_SES_SMTP_USERNAME=your-username
AWS_SES_SMTP_PASSWORD=your-password

# Internal Security
QUEUE_SYSTEM_TOKEN=generate-random-token

# =================================================================
# DEVELOPMENT OVERRIDES (Optional)
# =================================================================
# Add any local development overrides here
# Example: NODE_ENV=development
```

## Phase 2: Implementation (Day 2-3)

### Step 1: Update .gitignore

```gitignore
# Environment files
.env.local
.env*.local

# Legacy files (remove after migration)
.env.development
.env.test
.env.staging
```

### Step 2: Create Migration Script

```bash
#!/bin/bash
# scripts/migrate-env.sh

echo "Environment Migration Script"
echo "==========================="

# Backup existing files
mkdir -p .env-backup
cp .env* .env-backup/ 2>/dev/null

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✓ Created .env.local - Please add your secrets"
else
    echo "✓ .env.local already exists"
fi

# Verify base files exist
if [ -f .env ]; then
    echo "✓ Base .env file exists"
else
    echo "✗ Missing .env file - please create it"
fi

if [ -f .env.production ]; then
    echo "✓ Production .env.production file exists"
else
    echo "✗ Missing .env.production file - please create it"
fi

echo ""
echo "Next steps:"
echo "1. Add your secrets to .env.local"
echo "2. Test with: npm run dev"
echo "3. Build with: npm run build"
```

### Step 3: Update Documentation

Create clear documentation for each environment.

## Phase 3: Testing (Day 4)

### Test Loading Order

```javascript
// scripts/test-env-loading.js
console.log('Environment Loading Test');
console.log('=======================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ENVIRONMENT:', process.env.ENVIRONMENT);
console.log('BASE_PATH:', process.env.BASE_PATH);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '***SET***' : 'NOT SET');
```

### Verification Checklist

- [ ] Development works with new structure
- [ ] Production build succeeds
- [ ] No secrets in committed files
- [ ] PM2 loads environment correctly
- [ ] Docker builds work

## Phase 4: Deployment (Day 5)

### Staging Deployment

1. Update staging server:
   ```bash
   # On staging server
   cp .env.production .env.production.backup
   # Upload new .env and .env.production
   # Keep existing .env.local with secrets
   pm2 restart all
   ```

2. Verify functionality

### Production Deployment

1. Schedule maintenance window
2. Backup existing configuration
3. Deploy new structure
4. Monitor for issues

## Migration Timeline

| Day | Phase | Activities |
|-----|-------|------------|
| 1 | Preparation | Create new env files, update examples |
| 2-3 | Implementation | Update code, create scripts |
| 4 | Testing | Test all environments |
| 5 | Staging Deploy | Deploy to staging |
| 6 | Production Deploy | Deploy to production |
| 7 | Cleanup | Remove legacy files |

## Rollback Plan

If issues occur:

1. **Immediate Rollback**:
   ```bash
   # Restore from backup
   cp .env-backup/.env* .
   pm2 restart all
   ```

2. **Investigation**:
   - Check loading order
   - Verify all required variables
   - Review application logs

## Success Criteria

- ✓ 3-file structure implemented
- ✓ No secrets in committed files
- ✓ All environments functional
- ✓ Documentation updated
- ✓ Team trained on new structure

## Post-Migration Cleanup

After successful migration:

1. Remove legacy environment files
2. Update CI/CD pipelines
3. Archive old documentation
4. Update onboarding materials

## Benefits Realized

- **Security**: No secrets in repository
- **Simplicity**: 67% fewer environment files
- **Clarity**: Clear separation of concerns
- **Maintainability**: Single source of truth for defaults