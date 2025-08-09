# Production Deployment Checklist

## ⚠️ CRITICAL: Production Deployment Requirements

### Pre-Approval
- [ ] Change request approved
- [ ] Maintenance window scheduled
- [ ] Stakeholders notified
- [ ] Rollback plan reviewed
- [ ] Staging deployment successful for 24+ hours

## Pre-Deployment Verification

### 1. Staging Validation
- [ ] Staging running with new environment structure for 24+ hours
- [ ] No errors or issues reported in staging
- [ ] Performance metrics acceptable
- [ ] All features tested and working

### 2. Production Readiness
- [ ] All environment files prepared
- [ ] Production secrets ready (never commit!)
- [ ] Backup plan documented
- [ ] Team members on standby
- [ ] Monitoring alerts configured

### 3. Pre-Deployment Backup
```bash
# SSH to production server
ssh production-server

# Create timestamped backup
BACKUP_DIR=~/env-backup-$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR

# Backup all environment files
cp -r .env* $BACKUP_DIR/
cp -r .next $BACKUP_DIR/
cp ecosystem.config.js $BACKUP_DIR/

# Document current state
pm2 status > $BACKUP_DIR/pm2-status.txt
pm2 describe vvg-template > $BACKUP_DIR/pm2-describe.txt
node -v > $BACKUP_DIR/node-version.txt

# Create backup archive
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR/
```

## Deployment Steps

### 1. Upload New Environment Files
```bash
# From local machine (use secure transfer)
scp .env production-server:~/vvg-template/
scp .env.production production-server:~/vvg-template/
scp .env.example production-server:~/vvg-template/
```

### 2. Update Production .env.local
⚠️ **CRITICAL**: Never expose production secrets!

On production server, update `.env.local`:
```env
# Production configuration
NODE_ENV=production
ENVIRONMENT=production
NEXTAUTH_URL=https://legal.vtc.systems/vvg-template
AZURE_AD_REDIRECT_URI=https://legal.vtc.systems/vvg-template/api/auth/callback/azure-ad

# Production secrets (use actual values)
NEXTAUTH_SECRET=production-secret-NEVER-SHARE
AZURE_AD_CLIENT_ID=production-client-id
AZURE_AD_CLIENT_SECRET=production-client-secret
MYSQL_USER=production-db-user
MYSQL_PASSWORD=production-db-password
# ... other production secrets
```

### 3. Verify File Security
```bash
# Set strict permissions
chmod 600 .env.local
chmod 644 .env .env.production

# Verify ownership
chown appuser:appuser .env*

# List files
ls -la .env*
```

### 4. Run Migration Verification
```bash
# Run migration script
./scripts/migrate-env.sh

# If any issues, STOP and investigate
```

### 5. Build Application
```bash
# Clean previous build
rm -rf .next

# Build with production optimizations
NODE_ENV=production npm run build:standalone

# Verify build success
if [ $? -ne 0 ]; then
  echo "BUILD FAILED - ABORT DEPLOYMENT"
  exit 1
fi
```

### 6. Graceful Restart
```bash
# Save current PM2 state
pm2 save

# Perform graceful reload (zero downtime)
pm2 reload ecosystem.config.js --update-env

# Monitor startup
pm2 logs vvg-template --lines 100
```

## Post-Deployment Verification

### 1. Immediate Health Checks (0-5 minutes)
- [ ] Application started successfully
- [ ] No error logs in first 5 minutes
- [ ] PM2 status shows "online"
- [ ] No restart loops
- [ ] Memory usage normal

### 2. Functional Testing (5-15 minutes)
- [ ] Access production URL: https://legal.vtc.systems/vvg-template
- [ ] Test authentication (use test account)
- [ ] Verify document upload works
- [ ] Check API endpoints respond
- [ ] Test critical user flows

### 3. Monitoring (15-30 minutes)
- [ ] Check application metrics
- [ ] Verify database connections stable
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify S3 operations (if applicable)

### 4. Extended Monitoring (30+ minutes)
- [ ] No increase in error rates
- [ ] Performance metrics stable
- [ ] No unusual patterns in logs
- [ ] User reports normal

## Emergency Rollback Procedure

### ⚠️ Initiate Rollback If:
- Application fails to start
- Error rate > 5%
- Authentication broken
- Database errors
- Performance degradation > 20%

### Rollback Steps
```bash
# 1. Restore environment files
BACKUP_DIR=~/env-backup-[TIMESTAMP]
cp $BACKUP_DIR/.env* .

# 2. Restore previous build (if needed)
rm -rf .next
cp -r $BACKUP_DIR/.next .

# 3. Restart application
pm2 restart ecosystem.config.js

# 4. Verify rollback successful
pm2 status
pm2 logs vvg-template --lines 50
```

### Post-Rollback
- [ ] Confirm application stable
- [ ] Notify stakeholders
- [ ] Create incident report
- [ ] Schedule post-mortem

## Success Criteria

### ✅ Deployment Successful When:
1. Zero downtime during deployment
2. All health checks pass
3. No errors in first 30 minutes
4. Performance metrics normal
5. All critical features working

### ❌ Deployment Failed If:
1. Application won't start
2. Authentication broken
3. Increased error rate
4. Performance degradation
5. Critical features failing

## Communication Plan

### During Deployment
- [ ] Post in #deployments channel: "Starting VVG Template production deployment"
- [ ] Update status every 15 minutes
- [ ] Immediate notification if issues

### Post-Deployment
- [ ] Announce successful deployment
- [ ] Share any important notes
- [ ] Update deployment log

## Final Checklist

### Before Marking Complete:
- [ ] All tests passed
- [ ] No errors in logs
- [ ] Backup verified and documented
- [ ] Team notified of success
- [ ] Deployment documented
- [ ] Lessons learned captured

## Important Contacts

- **Production Lead**: [Name] - [Contact]
- **On-Call Engineer**: [Name] - [Contact]  
- **Database Admin**: [Name] - [Contact]
- **Security Team**: [Name] - [Contact]
- **Escalation Manager**: [Name] - [Contact]

## Notes

- Never rush production deployments
- Always have rollback plan ready
- Keep backups for minimum 30 days
- Document any deviations
- Update runbooks after deployment

---

**Last Updated**: [Date]  
**Version**: 1.0  
**Approved By**: [Manager Name]