# Staging Deployment Checklist

## Pre-Deployment Verification

### 1. Local Testing
- [ ] Run migration script locally: `./scripts/migrate-env.sh`
- [ ] Verify environment loading: `node scripts/test-env-loading.js`
- [ ] Run security validation: `./scripts/validate-env-security.sh`
- [ ] Test development mode: `npm run dev`
- [ ] Test production build: `npm run build`

### 2. Environment Files Ready
- [ ] `.env` file exists with non-sensitive defaults
- [ ] `.env.production` file exists with production overrides
- [ ] `.env.example` updated with secrets template only
- [ ] `.env.local` prepared with staging secrets

### 3. Backup Current Configuration
- [ ] SSH to staging server
- [ ] Create backup directory: `mkdir -p ~/env-backup-$(date +%Y%m%d)`
- [ ] Backup current env files: `cp .env* ~/env-backup-$(date +%Y%m%d)/`
- [ ] Document current PM2 status: `pm2 status > ~/env-backup-$(date +%Y%m%d)/pm2-status.txt`

## Deployment Steps

### 1. Upload New Environment Structure
```bash
# From local machine
scp .env staging-server:~/vvg-template/
scp .env.production staging-server:~/vvg-template/
scp .env.example staging-server:~/vvg-template/
```

### 2. Update Staging .env.local
On staging server, ensure `.env.local` contains:
```env
# Staging-specific overrides
NODE_ENV=production
ENVIRONMENT=staging
NEXTAUTH_URL=https://legal.vtc.systems:8443/vvg-template-staging
AZURE_AD_REDIRECT_URI=https://legal.vtc.systems:8443/vvg-template-staging/api/auth/callback/azure-ad

# Staging secrets (update with actual values)
NEXTAUTH_SECRET=staging-secret
AZURE_AD_CLIENT_ID=staging-client-id
AZURE_AD_CLIENT_SECRET=staging-client-secret
# ... other secrets
```

### 3. Verify File Permissions
```bash
chmod 600 .env.local
ls -la .env*
```

### 4. Run Migration Script
```bash
./scripts/migrate-env.sh
```

### 5. Build Application
```bash
npm run build
# or
npm run build:standalone
```

### 6. Restart PM2
```bash
pm2 restart vvg-template-staging
pm2 logs vvg-template-staging --lines 50
```

## Post-Deployment Verification

### 1. Application Health
- [ ] Check PM2 status: `pm2 status`
- [ ] Verify no restart loops: `pm2 describe vvg-template-staging`
- [ ] Check application logs for errors
- [ ] Monitor memory usage: `pm2 monit`

### 2. Functionality Testing
- [ ] Access staging URL: https://legal.vtc.systems:8443/vvg-template-staging
- [ ] Test authentication flow
- [ ] Verify Azure AD OAuth works
- [ ] Test document upload
- [ ] Verify API endpoints respond

### 3. Environment Validation
- [ ] Check loaded environment: `pm2 env vvg-template-staging`
- [ ] Verify correct NODE_ENV and ENVIRONMENT values
- [ ] Confirm database connectivity
- [ ] Test S3 access (if applicable)

## Rollback Procedure

If issues occur:

### 1. Immediate Rollback
```bash
# Restore backup files
cp ~/env-backup-$(date +%Y%m%d)/.env* .

# Restart application
pm2 restart vvg-template-staging
```

### 2. Verify Rollback
- [ ] Check application status
- [ ] Test core functionality
- [ ] Monitor logs for stability

### 3. Investigation
- [ ] Collect error logs
- [ ] Document specific failures
- [ ] Review environment differences

## Success Criteria

### ✅ Deployment Successful When:
1. Application starts without errors
2. All health checks pass
3. Authentication works correctly
4. No errors in logs for 5 minutes
5. All API endpoints respond correctly

### ❌ Rollback Required If:
1. Application fails to start
2. Authentication broken
3. Database connection errors
4. Repeated crashes or restarts
5. API endpoints returning errors

## Notes

- Keep backup for at least 7 days
- Document any deviations from plan
- Update this checklist with lessons learned
- Coordinate with team before deployment

## Contact Information

- **DevOps Lead**: [Contact]
- **On-Call Engineer**: [Contact]
- **Escalation**: [Contact]

---

**Last Updated**: [Date]  
**Version**: 1.0