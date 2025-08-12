# OAuth Configuration Rollback Procedures

## Overview

This document provides step-by-step instructions to rollback the OAuth static redirect URI configuration changes if issues arise after deployment.

## When to Use These Procedures

Execute rollback if you experience:
- Authentication failures after deployment
- "The reply URL specified in the request does not match" errors
- Users unable to sign in via Azure AD
- Redirect loops or authentication timeouts

## Quick Rollback Steps

### 1. Immediate Rollback (< 5 minutes)

If you need to rollback immediately after deployment:

```bash
# Connect to the server
ssh user@server

# Navigate to the application directory
cd /path/to/vvg-template

# Revert to previous commit
git revert HEAD

# Or checkout specific commit before changes
git checkout <commit-before-oauth-changes>

# Restart the application
pm2 restart vvg-template
```

### 2. Manual Rollback

If automated rollback isn't possible:

#### Step 1: Restore Callback Route

Create the file `/app/callback/azure-ad/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = new URL(request.url);
  
  // Get the base URL from the request headers
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const host = forwardedHost || request.headers.get('host') || '';
  
  // Construct the base URL
  const baseUrl = `${forwardedProto}://${host}`;
  
  // Build the NextAuth callback URL
  const callbackUrl = new URL('/api/auth/callback/azure-ad', baseUrl);
  callbackUrl.search = searchParams.toString();
  
  // Redirect to the NextAuth callback
  return NextResponse.redirect(callbackUrl.toString());
}
```

#### Step 2: Modify auth-options.ts

Edit `/lib/auth-options.ts` to remove the redirect_uri parameter:

```typescript
// Remove the redirect_uri from authorization params
authorization: {
  params: {
    scope: "openid profile email",
    // redirect_uri: process.env.AZURE_AD_REDIRECT_URI  // REMOVE THIS LINE
  }
}
```

#### Step 3: Update Environment Files

You can keep the AZURE_AD_REDIRECT_URI variable set, but it won't be used.

## Rollback Verification

After rollback, verify the system is working:

### 1. Test Authentication

```bash
# Check if the callback route exists
curl -I https://your-domain/vvg-template/callback/azure-ad

# Should return 307 or 302 redirect
```

### 2. Test Sign-In Flow

1. Navigate to `/sign-in`
2. Click "Sign in with Azure Active Directory"
3. Complete Azure AD authentication
4. Verify successful redirect back to application

### 3. Check Logs

```bash
# Check application logs
pm2 logs vvg-template --lines 100

# Look for authentication-related errors
grep -i "oauth\|auth\|azure" /path/to/logs/app.log
```

## Environment-Specific Rollback

### Production
```bash
# Production URL check
curl https://department.vtc.systems/vvg-template/callback/azure-ad

# Restart production
pm2 restart vvg-template-production
```

### Staging
```bash
# Staging URL check
curl https://department.vtc.systems:8443/vvg-template-staging/callback/azure-ad

# Restart staging
pm2 restart vvg-template-staging
```

## Post-Rollback Actions

### 1. Keep Azure AD Registrations

**Important:** Do NOT remove the redirect URIs from Azure AD. Keep all registered URIs:
- They don't hurt to have registered
- You may want to migrate again later
- Removing them could break the rollback

### 2. Document the Issue

Create an incident report including:
- Time of deployment and rollback
- Specific errors encountered
- Environment(s) affected
- Number of users impacted
- Root cause (if identified)

### 3. Investigation Checklist

Before attempting migration again:
- [ ] Verify all redirect URIs are registered in Azure AD
- [ ] Check for proxy/load balancer configuration issues
- [ ] Ensure environment variables are properly set
- [ ] Test in staging environment first
- [ ] Review application logs for specific errors

## Alternative: Partial Rollback

If only specific environments are affected, you can keep the new configuration but add the callback route as a safety net:

1. Keep the new auth-options.ts configuration
2. Add back the callback route for problematic environments
3. This provides backwards compatibility while using the new approach

## Emergency Contacts

If rollback procedures fail:

1. **DevOps Team**: Contact for infrastructure issues
2. **Azure AD Admin**: For OAuth app registration changes
3. **Security Team**: If authentication is completely broken

## Prevention for Future Deployments

1. **Always test in staging first**
2. **Verify Azure AD registrations before deployment**
3. **Have rollback plan ready**
4. **Monitor authentication metrics after deployment**
5. **Deploy during low-traffic periods**

## Recovery Timeline

- **Immediate Detection**: 1-2 minutes
- **Rollback Execution**: 3-5 minutes
- **Verification**: 2-3 minutes
- **Total Recovery Time**: ~10 minutes

## Long-Term Fix

After successful rollback, plan for proper migration:

1. Test thoroughly in development
2. Verify all Azure AD redirect URIs
3. Test with production-like configuration
4. Create staged deployment plan
5. Monitor closely after deployment