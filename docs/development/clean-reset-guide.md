# Clean Reset Guide

Complete rebuild and restart utility for VVG Template environments.

## Overview

The `clean-reset.sh` script provides a unified way to completely rebuild and restart both staging and production environments. It automates the entire process from cleaning build artifacts to verifying that both environments are running correctly.

## Features

✅ **Unified Management** - Single command for both environments  
✅ **Safety Checks** - Pre-flight validation and confirmation prompts  
✅ **Flexible Options** - Skip environments, force mode, help documentation  
✅ **Build Artifact Cleaning** - Removes .next cache and standalone builds  
✅ **PM2 Integration** - Uses existing deployment scripts with PM2 management  
✅ **Health Verification** - Confirms environments are running after reset  
✅ **Progress Tracking** - Clear status indicators and error handling  

## Usage

### Basic Commands

```bash
# Complete clean reset of both environments
./scripts/clean-reset.sh

# Or via npm
npm run clean-reset
```

### Advanced Options

```bash
# Skip confirmation prompts (automation-friendly)
./scripts/clean-reset.sh --force
npm run clean-reset:force

# Reset only staging environment
./scripts/clean-reset.sh --skip-production
npm run reset:staging

# Reset only production environment  
./scripts/clean-reset.sh --skip-staging
npm run reset:production

# Get help
./scripts/clean-reset.sh --help
```

### Combined Options

```bash
# Force reset staging only
./scripts/clean-reset.sh --force --skip-production

# Force reset production only
./scripts/clean-reset.sh --force --skip-staging
```

## Process Flow

### 1. Pre-flight Checks
- ✅ PM2 installation and daemon status
- ✅ Environment files (.env.staging, .env.production)
- ✅ Deploy script availability
- ✅ User confirmation (unless --force)

### 2. Build Artifact Cleaning
- 🧹 Remove .next directory (Next.js cache)
- 🧹 Remove .next-standalone directory (standalone build)
- 🧹 Clear npm cache (force mode only)

### 3. Application Rebuild
- 📦 Install/update dependencies
- 🔨 Build Next.js application
- ✅ Verify build success

### 4. Environment Reset
- 🔄 Execute deployment for each environment
- 🚀 PM2 process restart
- ⚙️ Environment-specific configuration
- 📊 Health checks and validation

### 5. Verification
- 🔍 Check PM2 process status
- ✅ Confirm applications are online
- 📝 Display access URLs and next steps

## Environment Configuration

### Staging Environment
- **Port**: 3001
- **Base Path**: `/template-staging`
- **PM2 App**: `vvg-template-staging`
- **Config**: `.env.staging`

### Production Environment
- **Port**: 3000
- **Base Path**: `/template`
- **PM2 App**: `vvg-template-production`  
- **Config**: `.env.production`

## Error Handling

The script includes comprehensive error handling:

- **Missing Dependencies**: Clear error messages for missing PM2 or environment files
- **Build Failures**: Stops execution if build process fails
- **Deployment Errors**: Rolls back on deployment script failures
- **Health Check Failures**: Reports which environments failed to start
- **Graceful Interruption**: Handles Ctrl+C and cleanup

## Output Examples

### Successful Execution
```
╔═══════════════════════════════════════════════════════════════╗
║                    VVG TEMPLATE CLEAN RESET                   ║
║               Complete Rebuild & Restart Utility             ║
╚═══════════════════════════════════════════════════════════════╝

[05:35:09] Starting clean reset process...
Host: localhost
Staging: INCLUDED
Production: INCLUDED
Force mode: DISABLED

[05:35:09] 🔍 Running pre-flight checks...
   ✓ Pre-flight checks passed

📊 Current PM2 Status:
No VVG Template processes found

[05:35:09] 🧹 Cleaning build artifacts...
   ✓ Removed .next directory
   ✓ Build artifacts cleaned

[05:35:09] 🔨 Rebuilding application...
   ✓ Dependencies installed
   ✓ Application built successfully

🔄 Resetting staging Environment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[05:35:30] Executing deployment for staging...
   ✅ staging environment reset successfully

🔄 Resetting production Environment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[05:35:50] Executing deployment for production...
   ✅ production environment reset successfully

[05:36:00] 🔍 Verifying environments...
   ✓ Staging (port 3001): Running
   ✓ Production (port 3000): Running

╔═══════════════════════════════════════════════════════════════╗
║                    CLEAN RESET COMPLETE                       ║
╚═══════════════════════════════════════════════════════════════╝

🎉 Clean reset completed successfully!

Next steps:
• View logs: pm2 logs vvg-template
• Check status: pm2 status
• Access staging: http://localhost:3001/template-staging
• Access production: http://localhost:3000/template
```

### Error Example
```
❌ Missing environment files:
   • .env.staging
Create the missing files before running clean reset
```

## Dependencies

### Required
- **PM2**: Process manager (install: `npm install -g pm2`)
- **Node.js**: Runtime environment
- **Environment Files**: `.env.staging` and/or `.env.production`

### Used Scripts
- `scripts/deploy-env.sh` - Individual environment deployment
- `config/ecosystem/staging.config.js` - PM2 staging configuration
- `config/ecosystem/production.config.js` - PM2 production configuration

## Troubleshooting

### PM2 Not Found
```bash
npm install -g pm2
pm2 ping
```

### Missing Environment Files
```bash
cp .env.staging.example .env.staging
cp .env.production.example .env.production
# Edit with your configuration
```

### Deployment Script Errors
```bash
# Check if deploy script is executable
chmod +x scripts/deploy-env.sh

# Test individual environment
./scripts/deploy-env.sh staging localhost
```

### Process Not Starting
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs vvg-template-staging
pm2 logs vvg-template-production

# Restart manually
pm2 restart vvg-template-staging
pm2 restart vvg-template-production
```

## Integration with CI/CD

The script is designed to be automation-friendly:

```bash
# In GitHub Actions or similar
- name: Clean Reset Environments
  run: npm run clean-reset:force
```

## Security Notes

- Environment files may contain sensitive data
- The script validates file existence but doesn't validate content
- Use appropriate file permissions for .env files (600)
- Consider using secrets management in production

## Performance Notes

- Build process may take 30-60 seconds
- Total reset time: ~2-3 minutes for both environments
- Zero-downtime deployment depends on nginx configuration
- PM2 handles process restarts gracefully

---

**Need help?** Check the [troubleshooting guide](../deployment/troubleshooting.md) or view script help with `./scripts/clean-reset.sh --help`.