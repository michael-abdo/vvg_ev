# Environment Configuration Guide

## Overview

This guide explains the VVG Template's environment configuration system, which follows Next.js best practices with a secure 3-file structure.

## Environment Files

The project uses three core environment files:

| File | Purpose | Git Status | Contains |
|------|---------|------------|----------|
| `.env` | Base configuration | ✅ Committed | Non-sensitive defaults |
| `.env.production` | Production overrides | ✅ Committed | Production URLs, non-sensitive settings |
| `.env.local` | Secrets & local overrides | ❌ Gitignored | API keys, passwords, credentials |

## Loading Order

Next.js loads environment files in this order (lowest to highest priority):

1. `.env` - Always loaded (base defaults)
2. `.env.production` - Only when `NODE_ENV=production`
3. `.env.local` - Always loaded (highest priority)

Values in later files override values from earlier files.

## Quick Start

### 1. Local Development Setup

```bash
# Copy the example file
cp .env.example .env.local

# Generate NextAuth secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local

# Edit .env.local and add your secrets
nano .env.local

# Start development
npm run dev
```

### 2. Production Deployment

On your production server:

```bash
# Create .env.local with production secrets
nano .env.local

# Add production values:
NEXTAUTH_URL=https://legal.vtc.systems/vvg-template
NEXTAUTH_SECRET=your-production-secret
AZURE_AD_CLIENT_ID=your-production-client-id
# ... etc

# Build and start
npm run build
pm2 start ecosystem.config.js
```

## Variable Types

### 1. Public Variables (Browser-Accessible)

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser:

```env
NEXT_PUBLIC_BASE_PATH=/vvg-template
NEXT_PUBLIC_APP_NAME="VVG Template"
```

### 2. Server-Only Variables

All other variables are only available server-side:

```env
DATABASE_URL=mysql://...
OPENAI_API_KEY=sk-...
```

## Security Best Practices

### ✅ DO:
- Keep all secrets in `.env.local`
- Use `.env` for non-sensitive defaults
- Generate strong secrets: `openssl rand -base64 32`
- Rotate credentials regularly
- Use different secrets per environment

### ❌ DON'T:
- Commit `.env.local` to git
- Put secrets in `.env` or `.env.production`
- Use example values in production
- Share `.env.local` files between developers
- Log environment variables

## Common Patterns

### Development Override

In `.env.local`:
```env
# Override production settings for local dev
NODE_ENV=development
LOG_LEVEL=debug
FEATURE_DEV_BYPASS=true
MYSQL_HOST=localhost
```

### Feature Flags

In `.env`:
```env
FEATURE_ADVANCED_SEARCH=false
```

In `.env.production`:
```env
FEATURE_ADVANCED_SEARCH=true
```

### Environment-Specific URLs

In `.env`:
```env
APP_DOMAIN=localhost:3001
```

In `.env.production`:
```env
APP_DOMAIN=legal.vtc.systems
```

## Deployment Guide

### Staging Deployment

1. SSH to staging server
2. Create `.env.local` with staging secrets
3. Ensure `.env` and `.env.production` are present
4. Build: `npm run build`
5. Restart: `pm2 restart all`

### Production Deployment

1. SSH to production server
2. Create `.env.local` with production secrets
3. Verify all required variables
4. Build: `npm run build:standalone`
5. Deploy: `pm2 restart ecosystem.config.js`

## Troubleshooting

### Variable Not Loading?

1. Check spelling (case-sensitive)
2. Verify file loading order
3. Rebuild after changes: `npm run build`
4. Check `NODE_ENV` value

### Wrong Value?

Check priority order - `.env.local` overrides everything:
```bash
# Debug loading order
node -e "console.log(process.env.MY_VARIABLE)"
```

### Production Issues?

1. Verify `.env.local` exists on server
2. Check file permissions: `chmod 600 .env.local`
3. Ensure PM2 loads environment correctly
4. Review build logs

## Migration from Old Structure

If you're migrating from the old multi-file structure:

1. **Backup existing files**: `cp -r .env* .env-backup/`
2. **Create new structure**:
   - Copy non-sensitive values to `.env`
   - Copy production overrides to `.env.production`
   - Keep secrets in `.env.local`
3. **Remove old files**: `.env.staging.example`, `.env.docker`, etc.
4. **Test thoroughly** before deploying

## Environment Variable Reference

### Core Configuration
- `NODE_ENV` - Node environment (development/production)
- `ENVIRONMENT` - Deployment environment
- `PROJECT_NAME` - Project identifier
- `PROJECT_DISPLAY_NAME` - User-facing name

### Authentication (Secrets in .env.local)
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Session encryption key
- `AZURE_AD_CLIENT_ID` - Azure AD app ID
- `AZURE_AD_CLIENT_SECRET` - Azure AD secret
- `AZURE_AD_TENANT_ID` - Azure AD tenant
- `AZURE_AD_REDIRECT_URI` - OAuth callback URL

### Database
- `MYSQL_HOST` - Database host
- `MYSQL_PORT` - Database port
- `MYSQL_DATABASE` - Database name
- `MYSQL_USER` - Database username (secret)
- `MYSQL_PASSWORD` - Database password (secret)

### Storage
- `STORAGE_PROVIDER` - local or s3
- `AWS_ACCESS_KEY_ID` - AWS key (secret)
- `AWS_SECRET_ACCESS_KEY` - AWS secret (secret)
- `S3_BUCKET_NAME` - S3 bucket name

### API Keys (All secrets)
- `OPENAI_API_KEY` - OpenAI API key
- `QUEUE_SYSTEM_TOKEN` - Internal API token

## Security Checklist

Before deploying:

- [ ] No secrets in `.env` or `.env.production`
- [ ] `.env.local` is gitignored
- [ ] Production has unique secrets
- [ ] Strong `NEXTAUTH_SECRET` generated
- [ ] File permissions set (600 for `.env.local`)
- [ ] No console.log of env variables
- [ ] Different database credentials per environment
- [ ] API keys are environment-specific

## Support

For environment configuration issues:
1. Check this guide first
2. Review error logs: `pm2 logs`
3. Verify with: `node scripts/test-env-loading.js`
4. Contact DevOps team if needed