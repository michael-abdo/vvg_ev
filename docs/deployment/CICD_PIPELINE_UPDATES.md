# CI/CD Pipeline Updates for Environment Migration

## Overview

This document identifies required updates to CI/CD pipelines to support the new 3-file environment structure.

## Affected Pipelines

### 1. GitHub Actions Workflows

#### `.github/workflows/ci.yml`
**Current State**: May reference old environment files  
**Updates Required**:
- Remove references to `.env.staging.example`, `.env.production.example`
- Update environment setup to use new structure
- Ensure test runs use proper environment loading

#### `.github/workflows/deploy.yml`
**Current State**: Deployment workflow for staging/production  
**Updates Required**:
- Update environment file handling
- Ensure `.env.local` is created on deployment servers
- Remove legacy file references

### 2. Deployment Scripts

#### `deployment/deploy.sh` (if exists)
**Updates Required**:
- Remove copying of legacy environment files
- Add logic to handle new 3-file structure
- Update environment validation

## Required Changes

### 1. Environment File Setup in CI

**Before** (Old Structure):
```yaml
- name: Setup environment
  run: |
    cp .env.example .env
    cp .env.production.example .env.production
```

**After** (New Structure):
```yaml
- name: Setup environment
  run: |
    # Base configuration already in .env
    # Production overrides in .env.production
    # Create .env.local for secrets
    cp .env.example .env.local
    
    # Add CI-specific secrets
    echo "NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}" >> .env.local
    echo "AZURE_AD_CLIENT_SECRET=${{ secrets.AZURE_AD_CLIENT_SECRET }}" >> .env.local
```

### 2. Build Process Updates

**Update build steps**:
```yaml
- name: Build application
  env:
    NODE_ENV: production
  run: |
    # Ensure environment files are loaded correctly
    npm run build
```

### 3. Deployment Updates

**Staging Deployment**:
```yaml
- name: Deploy to staging
  run: |
    # Copy base files
    scp .env ${{ secrets.STAGING_HOST }}:~/app/
    scp .env.production ${{ secrets.STAGING_HOST }}:~/app/
    
    # Create .env.local on server with secrets
    ssh ${{ secrets.STAGING_HOST }} << 'EOF'
      cd ~/app
      cat > .env.local << EOL
      NODE_ENV=production
      ENVIRONMENT=staging
      NEXTAUTH_URL=${{ secrets.STAGING_NEXTAUTH_URL }}
      NEXTAUTH_SECRET=${{ secrets.STAGING_NEXTAUTH_SECRET }}
      # ... other staging secrets
      EOL
      chmod 600 .env.local
    EOF
```

### 4. Testing Updates

**Update test environment**:
```yaml
- name: Run tests
  run: |
    # Tests should work with new structure
    npm test
    
- name: Run integration tests
  run: |
    # Ensure test environment uses proper files
    NODE_ENV=test npm run test:integration
```

## GitHub Secrets Updates

### Secrets to Add/Update:
1. `NEXTAUTH_SECRET` - For each environment
2. `AZURE_AD_CLIENT_SECRET` - For each environment
3. `DATABASE_PASSWORD` - For each environment
4. `AWS_SECRET_ACCESS_KEY` - If using S3
5. `OPENAI_API_KEY` - For AI features

### Secrets to Remove (if present):
- Any secrets referencing old environment structure
- Consolidated secrets that are now environment-specific

## Docker Updates (if applicable)

### Dockerfile Changes:
```dockerfile
# Copy new environment structure
COPY .env .env
COPY .env.production .env.production

# Note: .env.local should be mounted or created at runtime
```

### docker-compose.yml Updates:
```yaml
services:
  app:
    env_file:
      - .env
      - .env.production
      - .env.local  # Create this at deployment
```

## Verification Steps

### 1. CI Pipeline Verification
- [ ] Create test PR to verify CI runs correctly
- [ ] Check build process completes
- [ ] Verify tests pass with new structure
- [ ] Ensure no references to legacy files

### 2. Deployment Pipeline Verification
- [ ] Test staging deployment with new structure
- [ ] Verify secrets are properly injected
- [ ] Check application starts correctly
- [ ] Monitor for environment-related errors

## Rollback Considerations

If CI/CD updates cause issues:

1. **Temporary Workaround**:
   ```yaml
   # Add compatibility layer
   - name: Create legacy structure (temporary)
     run: |
       ln -s .env.local .env.development
   ```

2. **Revert Changes**:
   - Keep old workflow files in backup branch
   - Can quickly revert if needed

## Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| Phase 1 | Update CI workflows | 1 day |
| Phase 2 | Test in feature branches | 2 days |
| Phase 3 | Update staging deployment | 1 day |
| Phase 4 | Monitor staging | 3 days |
| Phase 5 | Update production deployment | 1 day |

## Checklist

### Pre-Update:
- [ ] Backup current workflows
- [ ] Document current process
- [ ] Identify all pipelines

### Updates:
- [ ] Update `.github/workflows/ci.yml`
- [ ] Update `.github/workflows/deploy.yml`
- [ ] Update deployment scripts
- [ ] Update Docker configurations
- [ ] Add/update GitHub secrets

### Post-Update:
- [ ] Test all workflows
- [ ] Verify deployments work
- [ ] Update documentation
- [ ] Remove legacy references

## Notes

- Test all changes in feature branches first
- Keep rollback plan ready
- Document any custom modifications
- Coordinate with DevOps team

---

**Created**: [Date]  
**Status**: Planning  
**Owner**: DevOps Team