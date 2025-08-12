# OAuth Configuration Guide

## Overview

This guide explains how to configure OAuth authentication with Azure AD for the VVG Template application across different environments. The application now uses static redirect URI configuration following OAuth best practices.

## Required Environment Variables

### Core OAuth Variables

All environments require these Azure AD OAuth variables:

- `AZURE_AD_CLIENT_ID` - Your Azure AD application (client) ID
- `AZURE_AD_CLIENT_SECRET` - Your Azure AD application secret
- `AZURE_AD_TENANT_ID` - Your Azure AD tenant ID
- `AZURE_AD_REDIRECT_URI` - The exact redirect URI for OAuth callbacks (NEW)

### Authentication URLs

- `NEXTAUTH_URL` - The base URL where your application is hosted
- `NEXTAUTH_SECRET` - A random string used to encrypt tokens (generate with `openssl rand -base64 32`)

## Environment-Specific Redirect URIs

Each environment requires a specific redirect URI that must be registered in Azure AD:

| Environment | AZURE_AD_REDIRECT_URI | Notes |
|------------|----------------------|-------|
| Local Development | `http://localhost:3001/api/auth/callback/azure-ad` | Default port is 3001 |
| Staging | `https://department.vtc.systems:8443/vvg-template-staging/api/auth/callback/azure-ad` | Includes port and basePath |
| Production | `https://department.vtc.systems/vvg-template/api/auth/callback/azure-ad` | Includes basePath |

## Azure AD App Registration Setup

### Step 1: Access Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Select your application or create a new one

### Step 2: Configure Redirect URIs
1. In your app registration, go to "Authentication"
2. Under "Platform configurations" → "Web" → "Redirect URIs"
3. Add ALL the redirect URIs from the table above
4. Click "Save"

**Important**: Azure AD requires exact URI matches. Each environment needs its own redirect URI registered.

### Step 3: Configure Application Permissions
1. Go to "API permissions"
2. Ensure these permissions are granted:
   - `openid` - Sign users in
   - `profile` - View users' basic profile
   - `email` - View users' email address

## Environment Configuration

### Local Development (.env.local)
```env
# Azure AD OAuth
AZURE_AD_CLIENT_ID=your-dev-client-id
AZURE_AD_CLIENT_SECRET=your-dev-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_REDIRECT_URI=http://localhost:3001/api/auth/callback/azure-ad

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-dev-secret
```

### Staging (.env.staging)
```env
# Azure AD OAuth
AZURE_AD_CLIENT_ID=your-staging-client-id
AZURE_AD_CLIENT_SECRET=your-staging-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_REDIRECT_URI=https://department.vtc.systems:8443/vvg-template-staging/api/auth/callback/azure-ad

# NextAuth
NEXTAUTH_URL=https://department.vtc.systems:8443/vvg-template-staging
NEXTAUTH_SECRET=your-staging-secret
```

### Production (.env.production)
```env
# Azure AD OAuth
AZURE_AD_CLIENT_ID=your-production-client-id
AZURE_AD_CLIENT_SECRET=your-production-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_REDIRECT_URI=https://department.vtc.systems/vvg-template/api/auth/callback/azure-ad

# NextAuth
NEXTAUTH_URL=https://department.vtc.systems/vvg-template
NEXTAUTH_SECRET=your-production-secret
```

## Troubleshooting

### Common Issues

#### 1. "The reply URL specified in the request does not match..."
**Cause**: The redirect URI doesn't match what's registered in Azure AD

**Solution**:
- Check that `AZURE_AD_REDIRECT_URI` exactly matches a URI registered in Azure AD
- Verify protocol (http vs https), port, and path are identical
- Remember basePath must be included in the URI

#### 2. "OAuthCallback Error"
**Cause**: Misconfigured environment variables

**Solution**:
- Verify all OAuth environment variables are set
- Check `NEXTAUTH_URL` matches your application URL
- Ensure `AZURE_AD_REDIRECT_URI` is properly configured

#### 3. "Redirect loop after authentication"
**Cause**: Mismatch between NEXTAUTH_URL and actual access URL

**Solution**:
- Ensure `NEXTAUTH_URL` includes the basePath if deployed under a subpath
- Check that cookies are being set for the correct domain

#### 4. "Authentication works locally but not in production"
**Cause**: Different redirect URIs between environments

**Solution**:
- Register separate redirect URIs for each environment in Azure AD
- Use environment-specific `.env` files with correct URIs
- Verify HTTPS is properly configured in production

### Debugging Steps

1. **Check Environment Variables**
   ```bash
   # Verify variables are set
   echo $AZURE_AD_CLIENT_ID
   echo $AZURE_AD_REDIRECT_URI
   echo $NEXTAUTH_URL
   ```

2. **Verify Azure AD Configuration**
   - Log into Azure Portal
   - Check redirect URIs are registered
   - Verify client ID and tenant ID match

3. **Test OAuth Flow**
   - Clear browser cookies
   - Navigate to `/sign-in`
   - Check browser network tab for redirect URLs
   - Verify the redirect_uri parameter matches expectations

4. **Check Application Logs**
   ```bash
   # For PM2 deployment
   pm2 logs vvg-template
   
   # For Docker deployment
   docker logs vvg-app
   ```

## Security Best Practices

1. **Never commit secrets** - Keep `.env.local` files out of version control
2. **Use strong secrets** - Generate NEXTAUTH_SECRET with `openssl rand -base64 32`
3. **Rotate credentials** - Regularly update client secrets
4. **Use HTTPS** - Always use HTTPS in production
5. **Validate redirect URIs** - Only register necessary redirect URIs in Azure AD

## Migration from Dynamic Configuration

If you're migrating from the previous dynamic callback configuration:

1. **Add new environment variable** - Set `AZURE_AD_REDIRECT_URI` in all environments
2. **Update Azure AD** - Register all environment-specific redirect URIs
3. **Remove workaround** - The `/callback/azure-ad` route is no longer needed
4. **Test thoroughly** - Verify OAuth flow works in each environment

## Rollback Instructions

If you need to rollback to the previous configuration:

1. **Restore callback route** - Recover `/app/callback/azure-ad/route.ts` from git history
2. **Remove redirect_uri param** - Edit `lib/auth-options.ts` to remove the redirect_uri parameter
3. **Keep Azure AD URIs** - Leave the registered redirect URIs in Azure AD for future use

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [OAuth 2.0 Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

---

**Last Updated**: 2024  
**Configuration Version**: 2.0 (Static redirect URIs)