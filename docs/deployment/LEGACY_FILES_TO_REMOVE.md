# Legacy Environment Files to Remove

## Overview

After successfully migrating to the new 3-file environment structure, the following legacy files should be removed to avoid confusion and maintain a clean codebase.

## Files to Remove

### 1. Environment Example Files
- **`.env.staging.example`** - Staging environment template (replaced by .env.production + .env.local)
- **`.env.production.example`** - Production environment template (replaced by .env.production + .env.local)

### 2. Docker Environment Files  
- **`.env.docker`** - Docker-specific configuration
- **`.env.docker.example`** - Docker environment template
- **`.env.docker.production`** - Docker production configuration

### 3. Test Environment Files
- **`.env.test`** - Test environment configuration
- **`.env.test.staging`** - Staging test configuration

### 4. Other Legacy Files (if present)
- **`.env.development`** - Development overrides (now in .env.local)
- **`.env.staging`** - Staging configuration (now in .env.local)

## Removal Process

### Step 1: Verify Migration Success
Before removing any files, ensure:
- [ ] New environment structure working in all environments
- [ ] All deployments successful with new structure
- [ ] No references to legacy files in code
- [ ] Team trained on new structure

### Step 2: Final Backup
```bash
# Create final backup before removal
mkdir -p .env-legacy-final-backup
cp .env.staging.example .env-legacy-final-backup/
cp .env.production.example .env-legacy-final-backup/
cp .env.docker* .env-legacy-final-backup/
cp .env.test* .env-legacy-final-backup/

# Create archive
tar -czf env-legacy-backup-$(date +%Y%m%d).tar.gz .env-legacy-final-backup/
```

### Step 3: Remove Files
```bash
# Remove legacy environment files
rm -f .env.staging.example
rm -f .env.production.example
rm -f .env.docker
rm -f .env.docker.example
rm -f .env.docker.production
rm -f .env.test
rm -f .env.test.staging

# Verify removal
ls -la .env*
```

### Step 4: Update Version Control
```bash
# If any legacy files were tracked
git rm .env.staging.example
git rm .env.production.example
git rm .env.docker
git rm .env.docker.example
git rm .env.docker.production
git rm .env.test
git rm .env.test.staging

# Commit changes
git commit -m "chore: Remove legacy environment files after migration"
```

## Code Updates Required

### 1. Remove References in Scripts
Check and update any scripts that reference legacy files:
- Build scripts
- Deployment scripts
- Docker compose files
- CI/CD pipelines

### 2. Update Documentation
Remove mentions of legacy files from:
- README.md
- Setup guides
- Deployment documentation
- Developer onboarding

### 3. Docker Configuration
If using Docker, update:
- Dockerfile to use new structure
- docker-compose.yml environment sections
- Container startup scripts

## Verification After Removal

### 1. Test All Environments
```bash
# Development
npm run dev

# Production build
npm run build

# Docker (if applicable)
docker-compose up
```

### 2. Check CI/CD
- [ ] GitHub Actions workflows updated
- [ ] Build pipelines reference correct files
- [ ] Deployment scripts use new structure

### 3. Team Communication
- [ ] Notify team of removal
- [ ] Update team wikis
- [ ] Remove old documentation

## Benefits of Removal

1. **Clarity**: No confusion about which files to use
2. **Security**: Fewer files with potential secrets
3. **Maintenance**: Less files to maintain
4. **Onboarding**: Simpler for new developers

## Rollback Plan

If issues arise after removal:

1. Restore from backup:
   ```bash
   tar -xzf env-legacy-backup-[DATE].tar.gz
   cp .env-legacy-final-backup/* .
   ```

2. Investigate what's still using legacy files

3. Update dependencies before attempting removal again

## Timeline

| Week | Action |
|------|--------|
| Week 1 | Migrate all environments |
| Week 2 | Monitor for issues |
| Week 3 | Remove from development |
| Week 4 | Remove from staging |
| Week 5 | Remove from production |
| Week 6 | Clean up documentation |

## Notes

- Keep backups for at least 90 days
- Document any files that couldn't be removed
- Update this list if new legacy files are discovered

---

**Created**: [Date]  
**Status**: Pending removal  
**Owner**: DevOps Team