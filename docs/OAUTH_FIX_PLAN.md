# OAuth Configuration Fix Plan

## Executive Summary

The VVG template has an OAuth anti-pattern that dynamically constructs URLs from headers, creating a security vulnerability. However, this exists as a workaround for a legitimate basePath issue with Azure AD callbacks. This plan addresses both the security concern and the underlying problem.

## Current State Analysis

### The Problem
1. **Security Issue**: `/app/callback/azure-ad/route.ts` reads the `host` header to construct URLs (can be spoofed)
2. **Root Cause**: Azure AD redirects to `/callback/azure-ad` instead of `/{basePath}/api/auth/callback/azure-ad`
3. **Current Workaround**: A redirect handler catches the wrong callback and forwards to the correct path

### Why This Exists
- Azure AD redirect URIs must be exact matches
- The app deploys with a basePath (e.g., `/vvg-template`)
- Azure AD doesn't know about the basePath
- NextAuth expects callbacks at `/{basePath}/api/auth/callback/azure-ad`

## Components Affected by Fix

### 1. **Direct Impact**
- `/app/callback/azure-ad/route.ts` - Needs complete rewrite
- Azure AD app registration - Redirect URI must be updated
- Environment configuration - New variables needed

### 2. **Configuration Changes**
- `.env.*` files - Add explicit callback URL configuration
- `lib/auth-options.ts` - Update to use static configuration
- NextAuth configuration - Add proper redirect URI handling

### 3. **Minimal Side Effects**
- No changes to middleware
- No changes to UI components
- No changes to other API routes
- No changes to path utilities

## ✅ Verification Step

**Have we thought deeply enough?**
- ✓ Root cause understood (basePath mismatch)
- ✓ Security implications clear
- ✓ Minimal components affected
- ✓ Solution maintains functionality

**Assumptions to test:**
- Azure AD supports multiple redirect URIs
- NextAuth can handle explicit callback URLs
- Environment-based configuration is sufficient

**Is this the simplest approach?**
- Yes, uses existing NextAuth capabilities
- No new dependencies needed
- Follows industry standards

## Solution Design

### Approach: Static Configuration with Environment Variables

Instead of dynamic URL construction, use explicit configuration:

```env
# Development
NEXTAUTH_URL=http://localhost:3000
AZURE_AD_REDIRECT_URI=http://localhost:3000/api/auth/callback/azure-ad

# Production  
NEXTAUTH_URL=https://legal.vtc.systems/vvg-template
AZURE_AD_REDIRECT_URI=https://legal.vtc.systems/vvg-template/api/auth/callback/azure-ad
```

### Benefits
1. **Security**: No header manipulation possible
2. **Clarity**: Explicit configuration
3. **Standards**: Follows OAuth best practices
4. **Flexibility**: Different URIs per environment

## Project Structure

```
/app/callback/azure-ad/
  └── route.ts (DELETE - no longer needed)

/lib/
  └── auth-options.ts (UPDATE - use static config)

/.env.example (UPDATE - add new variables)
/.env.production.example (UPDATE - add new variables)
/.env.staging.example (UPDATE - add new variables)

/docs/
  └── deployment/
      └── OAUTH_CONFIGURATION.md (CREATE - deployment guide)
```

## Implementation Plan

### Phase 1: Configuration Setup (30 minutes)
1. Add `AZURE_AD_REDIRECT_URI` to all environment files
2. Document the new variable in examples
3. Update deployment documentation

### Phase 2: Code Changes (1 hour)
1. Update `lib/auth-options.ts` to use static redirect URI
2. Remove the dynamic callback handler
3. Test OAuth flow works correctly

### Phase 3: Azure AD Updates (30 minutes)
1. Add all environment-specific redirect URIs to Azure AD
2. Document the required URIs
3. Update setup instructions

### Phase 4: Testing (1 hour)
1. Test local development flow
2. Test staging deployment
3. Test production deployment
4. Verify rollback procedures

## ✅ Final Verification

**Have we thought deeply enough?**
- ✓ Solution addresses security issue
- ✓ Maintains all functionality
- ✓ Follows best practices
- ✓ Simple implementation

**Is this the simplest approach?**
- ✓ Uses built-in NextAuth features
- ✓ Standard environment variables
- ✓ No custom code needed
- ✓ Clear documentation

## Implementation Steps

### Step 1: Update Environment Files (15 min)
```bash
# Add to .env.example
AZURE_AD_REDIRECT_URI=http://localhost:3000/api/auth/callback/azure-ad

# Add to .env.production.example  
AZURE_AD_REDIRECT_URI=https://legal.vtc.systems/vvg-template/api/auth/callback/azure-ad

# Add to .env.staging.example
AZURE_AD_REDIRECT_URI=https://legal.vtc.systems:8443/vvg-template-staging/api/auth/callback/azure-ad
```

### Step 2: Update Auth Configuration (30 min)
- Modify Azure AD provider in `auth-options.ts` to use the environment variable
- Add validation for the redirect URI
- Remove any dynamic URL construction

### Step 3: Remove Workaround (15 min)
- Delete `/app/callback/azure-ad/route.ts`
- Remove PROJECT_NAME usage for this purpose
- Clean up any related comments

### Step 4: Update Azure AD App Registration (30 min)
- Add all environment-specific redirect URIs
- Document which URIs are for which environment
- Test each environment

### Step 5: Test Everything (1 hour)
- Local development with no basePath
- Local development with basePath
- Staging deployment
- Production deployment

### Step 6: Documentation (30 min)
- Create OAuth configuration guide
- Update deployment instructions
- Add troubleshooting section

## Risk Assessment

### Low Risk
- Using standard NextAuth configuration
- Following OAuth best practices
- Easy rollback (restore old handler)

### Mitigation
- Test in staging first
- Keep old handler code in git history
- Document rollback procedure

## Success Criteria

1. ✅ No dynamic URL construction from headers
2. ✅ OAuth flow works in all environments
3. ✅ Follows security best practices
4. ✅ Clear documentation for setup
5. ✅ No regression in functionality

## Time Estimate

**Total: 3-4 hours**
- Configuration: 30 minutes
- Code changes: 1 hour
- Azure AD setup: 30 minutes  
- Testing: 1 hour
- Documentation: 30 minutes

## Conclusion

This plan fixes the security vulnerability while maintaining functionality. It replaces a dynamic workaround with static configuration, following OAuth best practices. The implementation is straightforward and low-risk.