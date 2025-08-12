# Azure AD App Registration Request

Hi Bhavik

I need a new Azure AD app registration for testing my VVG template. This is just a local boiler plate project template to help build new applications quickly

**New App Details:**
- App Name: VVG Template
- Purpose: Local development and testing of document processing template
- Environment: Development/Testing only

**Required Redirect URIs:**
- http://localhost:3000/template/api/auth/callback/azure-ad
- http://localhost:3001/template-staging/api/auth/callback/azure-ad
- http://localhost:3000/api/auth/callback/azure-ad (optional - for compatibility)
- http://localhost:3001/api/auth/callback/azure-ad (optional - for compatibility)

**Required Configuration:**
- Authorization Code Flow: Enabled
- ID Tokens: Enabled
- Implicit Grant: Disabled
- Scopes: openid, profile, email, offline_access, User.Read

**Please provide:**
- Client ID
- Client Secret
- Tenant ID

This will allow me to test authentication flows locally without affecting any production applications.

Thanks!