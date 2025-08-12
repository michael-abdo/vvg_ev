# Bearer Token Authentication Implementation Guide

## Overview

This guide provides atomic, step-by-step instructions for implementing Azure AD Bearer token authentication in the Template application. This will enable proper API authentication using JWT tokens while maintaining existing session-based web authentication.

## Prerequisites

- ✅ Azure AD application configured with client credentials
- ✅ NextAuth.js already working for session-based auth
- ✅ Development environment with Node.js 18+

## Implementation Breakdown

### 📋 **Task 1: JWT Validation Utility (50 lines)**

#### **Step 1.1: Install Dependencies**
```bash
# Install JWT library recommended by Next.js
npm install jose

# Install types if using TypeScript
npm install --save-dev @types/node
```

#### **Step 1.2: Create JWT Validation File**
```bash
# Create the directory if it doesn't exist
mkdir -p lib/auth
touch lib/auth/jwt-validator.ts
```

#### **Step 1.3: Define TypeScript Interfaces**
Add to `lib/auth/jwt-validator.ts`:
```typescript
export interface AzureADUserInfo {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  appId: string;
  roles?: string[];
}

export interface TokenValidationResult {
  valid: boolean;
  user?: AzureADUserInfo;
  error?: string;
}
```

#### **Step 1.4: Implement JWKS Fetching**
Add JWKS (JSON Web Key Set) fetching logic:
```typescript
import { createRemoteJWKSet } from 'jose';

const AZURE_AD_TENANT_ID = process.env.AZURE_AD_TENANT_ID!;
const AZURE_AD_CLIENT_ID = process.env.AZURE_AD_CLIENT_ID!;

// Azure AD JWKS endpoint
const JWKS_URI = `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/discovery/v2.0/keys`;
const jwks = createRemoteJWKSet(new URL(JWKS_URI));
```

#### **Step 1.5: Implement Token Parsing**
Add token extraction and basic validation:
```typescript
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7); // Remove 'Bearer ' prefix
}
```

#### **Step 1.6: Implement JWT Signature Validation**
Add JWT signature verification against Azure AD:
```typescript
import { jwtVerify } from 'jose';

async function verifyJWTSignature(token: string) {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/v2.0`,
      audience: AZURE_AD_CLIENT_ID,
    });
    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
}
```

#### **Step 1.7: Implement Claims Validation**
Add validation of token claims:
```typescript
function validateTokenClaims(payload: any): AzureADUserInfo {
  const requiredClaims = ['sub', 'email', 'name', 'tid', 'aud'];
  
  for (const claim of requiredClaims) {
    if (!payload[claim]) {
      throw new Error(`Missing required claim: ${claim}`);
    }
  }

  // Check token expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token has expired');
  }

  return {
    id: payload.sub,
    email: payload.email || payload.preferred_username,
    name: payload.name,
    tenantId: payload.tid,
    appId: payload.aud,
    roles: payload.roles || []
  };
}
```

#### **Step 1.8: Create Main Validation Function**
Combine all validation logic:
```typescript
export async function validateAzureADToken(
  authHeader: string | null
): Promise<TokenValidationResult> {
  try {
    // Step 1: Extract token from header
    const token = extractBearerToken(authHeader);
    if (!token) {
      return { valid: false, error: 'No Bearer token provided' };
    }

    // Step 2: Verify JWT signature
    const payload = await verifyJWTSignature(token);

    // Step 3: Validate claims
    const userInfo = validateTokenClaims(payload);

    return { valid: true, user: userInfo };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
}
```

#### **Step 1.9: Add Error Handling and Logging**
Import logging utility and add error tracking:
```typescript
import { Logger } from '@/lib/services/logger';

// Add logging to the main function
export async function validateAzureADToken(
  authHeader: string | null
): Promise<TokenValidationResult> {
  try {
    Logger.auth.step('JWT_VALIDATION', 'Starting token validation');
    
    // ... existing validation logic ...
    
    Logger.auth.success('JWT_VALIDATION', 'Token validated successfully', { 
      userId: userInfo.id 
    });
    return { valid: true, user: userInfo };
  } catch (error) {
    Logger.auth.error('JWT_VALIDATION', 'Token validation failed', error as Error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
}
```

---

### 📋 **Task 2: Bearer Auth Wrappers (100 lines)**

#### **Step 2.1: Create Bearer Auth Utilities File**
```bash
touch lib/auth/bearer-auth-utils.ts
```

#### **Step 2.2: Import Dependencies**
Add necessary imports to `lib/auth/bearer-auth-utils.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAzureADToken, AzureADUserInfo } from './jwt-validator';
import { ApiErrors } from '@/lib/utils';
import { Logger } from '@/lib/services/logger';
import { config, EnvironmentHelpers } from '@/lib/config';
import { APP_CONSTANTS } from '@/lib/config';
```

#### **Step 2.3: Define Handler Types**
Create TypeScript types for the handler functions:
```typescript
export type BearerAuthHandler = (
  request: NextRequest,
  userInfo: AzureADUserInfo
) => Promise<NextResponse>;

export type BearerAuthDynamicHandler<T extends Record<string, any>> = (
  request: NextRequest,
  userInfo: AzureADUserInfo,
  context: { params: Promise<T> }
) => Promise<NextResponse>;

export interface BearerAuthOptions {
  allowDevBypass?: boolean;
  trackTiming?: boolean;
  includeHeaders?: boolean;
}
```

#### **Step 2.4: Implement withBearerAuth Function**
Create the main Bearer auth wrapper:
```typescript
export function withBearerAuth(
  handler: BearerAuthHandler,
  options: BearerAuthOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    
    try {
      Logger.auth.start('BEARER_AUTH', 'Validating Bearer token');
      
      // Development bypass check
      if (options.allowDevBypass && 
          EnvironmentHelpers.isDevelopment() && 
          request.headers.get(APP_CONSTANTS.HEADERS.DEV_BYPASS) === 'true') {
        
        Logger.auth.step('BEARER_AUTH', 'Using development bypass');
        const mockUser: AzureADUserInfo = {
          id: 'dev-user-123',
          email: config.TEST_USER_EMAIL,
          name: 'Development User',
          tenantId: config.AZURE_AD_TENANT_ID,
          appId: config.AZURE_AD_CLIENT_ID
        };
        
        const response = await handler(request, mockUser);
        
        if (options.trackTiming !== false) {
          response.headers.set('X-Processing-Time', `${Date.now() - startTime}ms`);
        }
        
        return response;
      }

      // Validate Bearer token
      const authHeader = request.headers.get('Authorization');
      const validationResult = await validateAzureADToken(authHeader);

      if (!validationResult.valid || !validationResult.user) {
        Logger.auth.error('BEARER_AUTH', 'Token validation failed', 
          new Error(validationResult.error || 'Unknown validation error'));
        return ApiErrors.unauthorized(validationResult.error || 'Invalid token');
      }

      Logger.auth.success('BEARER_AUTH', 'Bearer token validated successfully', {
        userId: validationResult.user.id
      });

      // Call the actual handler
      const response = await handler(request, validationResult.user);

      // Add timing header if requested
      if (options.trackTiming !== false) {
        response.headers.set('X-Processing-Time', `${Date.now() - startTime}ms`);
      }

      // Add auth headers if requested
      if (options.includeHeaders) {
        response.headers.set('X-Auth-Method', 'bearer-token');
        response.headers.set('X-Auth-User', validationResult.user.id);
      }

      return response;
      
    } catch (error) {
      Logger.auth.error('BEARER_AUTH', 'Bearer auth wrapper error', error as Error);
      return ApiErrors.serverError('Authentication error');
    }
  };
}
```

#### **Step 2.5: Implement withBearerAuthDynamic Function**
Create the dynamic route version:
```typescript
export function withBearerAuthDynamic<T extends Record<string, any>>(
  handler: BearerAuthDynamicHandler<T>,
  options: BearerAuthOptions = {}
) {
  return async (
    request: NextRequest, 
    context: { params: Promise<T> }
  ): Promise<NextResponse> => {
    const startTime = Date.now();
    
    try {
      Logger.auth.start('BEARER_AUTH_DYNAMIC', 'Validating Bearer token for dynamic route');
      
      // Development bypass check (same as above)
      if (options.allowDevBypass && 
          EnvironmentHelpers.isDevelopment() && 
          request.headers.get(APP_CONSTANTS.HEADERS.DEV_BYPASS) === 'true') {
        
        const mockUser: AzureADUserInfo = {
          id: 'dev-user-123',
          email: config.TEST_USER_EMAIL,
          name: 'Development User',
          tenantId: config.AZURE_AD_TENANT_ID,
          appId: config.AZURE_AD_CLIENT_ID
        };
        
        const response = await handler(request, mockUser, context);
        
        if (options.trackTiming !== false) {
          response.headers.set('X-Processing-Time', `${Date.now() - startTime}ms`);
        }
        
        return response;
      }

      // Validate Bearer token (same validation logic as above)
      const authHeader = request.headers.get('Authorization');
      const validationResult = await validateAzureADToken(authHeader);

      if (!validationResult.valid || !validationResult.user) {
        return ApiErrors.unauthorized(validationResult.error || 'Invalid token');
      }

      // Call the actual handler with context
      const response = await handler(request, validationResult.user, context);

      if (options.trackTiming !== false) {
        response.headers.set('X-Processing-Time', `${Date.now() - startTime}ms`);
      }

      return response;
      
    } catch (error) {
      Logger.auth.error('BEARER_AUTH_DYNAMIC', 'Bearer auth dynamic wrapper error', error as Error);
      return ApiErrors.serverError('Authentication error');
    }
  };
}
```

#### **Step 2.6: Create Hybrid Auth Wrapper**
Support both session and Bearer token authentication:
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

export type HybridAuthHandler = (
  request: NextRequest,
  userInfo: { email: string; id?: string; authMethod: 'session' | 'bearer' }
) => Promise<NextResponse>;

export function withHybridAuth(
  handler: HybridAuthHandler,
  options: BearerAuthOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    
    try {
      // Try Bearer token first
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const validationResult = await validateAzureADToken(authHeader);
        
        if (validationResult.valid && validationResult.user) {
          return await handler(request, {
            email: validationResult.user.email,
            id: validationResult.user.id,
            authMethod: 'bearer'
          });
        }
      }
      
      // Fallback to session authentication
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        return await handler(request, {
          email: session.user.email,
          id: session.user.id,
          authMethod: 'session'
        });
      }
      
      // Neither authentication method worked
      return ApiErrors.unauthorized('Authentication required');
      
    } catch (error) {
      Logger.auth.error('HYBRID_AUTH', 'Hybrid auth wrapper error', error as Error);
      return ApiErrors.serverError('Authentication error');
    }
  };
}
```

#### **Step 2.7: Export All Functions**
Add exports at the end of the file:
```typescript
export {
  withBearerAuth,
  withBearerAuthDynamic,
  withHybridAuth
};
```

---

### 📋 **Task 3: Update API Routes (5-10 routes)**

#### **Step 3.1: Identify Routes Needing Bearer Auth**
List the routes that should support Bearer token authentication:
- `/api/documents` - Document listing and management
- `/api/upload` - File upload functionality  
- `/api/compare` - Document comparison
- `/api/dashboard/stats` - Dashboard statistics
- `/api/documents/[id]/*` - Individual document operations

#### **Step 3.2: Update Documents API Route**
**File**: `app/api/documents/route.ts`

**Step 3.2.1**: Update imports:
```typescript
import { withBearerAuth } from '@/lib/auth/bearer-auth-utils';
// Remove any existing hardcoded auth logic imports
```

**Step 3.2.2**: Replace the GET handler:
```typescript
export const GET = withBearerAuth(
  async (request: NextRequest, userInfo) => {
    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Use existing DocumentService logic
    const { DocumentService } = await import('@/lib/services/document-service');
    const documents = await DocumentService.getUserDocuments(userInfo.email);
    
    return ResponseBuilder.success({
      data: documents.slice((page - 1) * limit, page * limit),
      metadata: {
        pagination: { page, limit, total: documents.length },
        userEmail: userInfo.email
      }
    });
  },
  { allowDevBypass: true, trackTiming: true, includeHeaders: true }
);
```

**Step 3.2.3**: Update POST handler if it exists:
```typescript
export const POST = withBearerAuth(
  async (request: NextRequest, userInfo) => {
    // Your existing POST logic here, but use userInfo.email instead of session
    return ResponseBuilder.created({ message: 'Document created' });
  },
  { allowDevBypass: true }
);
```

#### **Step 3.3: Update Upload API Route**
**File**: `app/api/upload/route.ts`

**Step 3.3.1**: Update imports:
```typescript
import { withBearerAuth } from '@/lib/auth/bearer-auth-utils';
import { ResponseBuilder } from '@/lib/utils';
```

**Step 3.3.2**: Replace existing handler:
```typescript
export const POST = withBearerAuth(
  async (request: NextRequest, userInfo) => {
    try {
      // Parse multipart form data
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return ResponseBuilder.validationError('No file provided', ['file is required']);
      }
      
      // Process upload (use your existing upload logic)
      // Replace any session.user.email references with userInfo.email
      
      return ResponseBuilder.created({ 
        message: 'File uploaded successfully',
        fileName: file.name 
      });
      
    } catch (error) {
      return ResponseBuilder.serverError('Upload failed');
    }
  },
  { allowDevBypass: true, trackTiming: true }
);
```

#### **Step 3.4: Update Compare API Route**
**File**: `app/api/compare/route.ts`

**Step 3.4.1**: Update imports (the route already uses withRateLimit):
```typescript
// Replace the existing withRateLimit import
import { withBearerAuth } from '@/lib/auth/bearer-auth-utils';
import { compareRateLimiter } from '@/lib/rate-limiter';
```

**Step 3.4.2**: Create a Bearer + Rate Limited wrapper:
```typescript
// Create a composed wrapper that includes both Bearer auth and rate limiting
function withBearerAuthAndRateLimit(
  handler: (request: NextRequest, userInfo: AzureADUserInfo) => Promise<NextResponse>
) {
  return withBearerAuth(async (request: NextRequest, userInfo) => {
    // Check rate limit manually since we're not using the session-based wrapper
    const rateLimitKey = userInfo.email;
    
    if (!compareRateLimiter.checkLimit(rateLimitKey)) {
      const resetTime = compareRateLimiter.getResetTime(rateLimitKey);
      return ApiErrors.rateLimitExceeded(resetTime ? new Date(resetTime) : undefined);
    }
    
    const response = await handler(request, userInfo);
    
    // Add rate limit headers
    const remaining = compareRateLimiter.getRemainingRequests(rateLimitKey);
    const resetTime = compareRateLimiter.getResetTime(rateLimitKey);
    
    response.headers.set(APP_CONSTANTS.HEADERS.RATE_LIMIT.REMAINING, remaining.toString());
    if (resetTime) {
      response.headers.set(APP_CONSTANTS.HEADERS.RATE_LIMIT.RESET, new Date(resetTime).toISOString());
    }
    
    return response;
  }, { allowDevBypass: true, includeHeaders: true });
}
```

**Step 3.4.3**: Update the POST export:
```typescript
export const POST = withBearerAuthAndRateLimit(
  async (request: NextRequest, userInfo) => {
    // Use existing compare logic but replace userEmail parameter
    // The existing logic should work with userInfo.email instead of session email
    
    // Your existing comparison logic here...
    // Replace any references to userEmail with userInfo.email
    
    return ResponseBuilder.operation('comparison.create', {
      data: { /* comparison result */ },
      metadata: { userEmail: userInfo.email }
    });
  }
);
```

#### **Step 3.5: Update Dashboard Stats Route**
**File**: `app/api/dashboard/stats/route.ts`

Replace the hardcoded 401 with actual Bearer auth:
```typescript
import { withBearerAuth } from '@/lib/auth/bearer-auth-utils';
import { ResponseBuilder } from '@/lib/utils';

export const GET = withBearerAuth(
  async (request: NextRequest, userInfo) => {
    // Implement actual dashboard stats logic
    const stats = {
      documentsCount: 0, // Get from DocumentService
      comparisonsCount: 0, // Get from database
      lastActivity: new Date().toISOString(),
      userEmail: userInfo.email
    };
    
    return ResponseBuilder.success({
      data: stats,
      metadata: { generatedAt: new Date().toISOString() }
    });
  },
  { allowDevBypass: true, trackTiming: true }
);
```

#### **Step 3.6: Update Dynamic Document Routes**
**File**: `app/api/documents/[id]/route.ts`

Use the dynamic Bearer auth wrapper:
```typescript
import { withBearerAuthDynamic } from '@/lib/auth/bearer-auth-utils';

export const GET = withBearerAuthDynamic(
  async (request: NextRequest, userInfo, { params }) => {
    const { id } = await params;
    const documentId = parseInt(id);
    
    // Use existing DocumentService with userInfo.email
    const { DocumentService } = await import('@/lib/services/document-service');
    const result = await DocumentService.getUserDocumentById(userInfo.email, documentId);
    
    if (!result.isValid || !result.document) {
      return ResponseBuilder.notFound('Document');
    }
    
    return ResponseBuilder.success({ data: result.document });
  },
  { allowDevBypass: true }
);
```

#### **Step 3.7: Test Each Updated Route**
For each route updated, test with both Bearer token and dev bypass:

**Test Bearer token authentication:**
```bash
# Get token
ACCESS_TOKEN=$(curl -s -X POST "https://login.microsoftonline.com/your-azure-ad-tenant-id-here/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=your-azure-ad-client-id-here" \
  -d "client_secret=your-azure-ad-client-secret-here" \
  -d "scope=https://graph.microsoft.com/.default" \
  -d "grant_type=client_credentials" | jq -r '.access_token')

# Test each route
curl -H "Authorization: Bearer $ACCESS_TOKEN" "http://localhost:3000/template-app/api/documents"
curl -H "Authorization: Bearer $ACCESS_TOKEN" "http://localhost:3000/template-app/api/dashboard/stats"
```

**Test dev bypass (should still work):**
```bash
curl -H "X-Dev-Bypass: true" "http://localhost:3000/template-app/api/documents"
```

#### **Step 3.8: Update Error Handling**
Ensure all routes return consistent error formats:
```typescript
// In each route, wrap the handler logic in try-catch:
try {
  // Main route logic
  return ResponseBuilder.success({ data: result });
} catch (error) {
  Logger.api.error('ROUTE_NAME', 'Route error', error as Error);
  return ResponseBuilder.serverError(
    error instanceof Error ? error.message : 'Unexpected error'
  );
}
```

#### **Step 3.9: Verify Backwards Compatibility**
Test that existing session-based authentication still works for web interface:
- Browser sign-in should continue working
- Session cookies should still be valid for web pages
- Only API routes should require Bearer tokens

---

## 🧪 **Testing Checklist**

### **Unit Tests**
- [ ] JWT validation utility tests
- [ ] Bearer auth wrapper tests
- [ ] Error handling tests

### **Integration Tests**  
- [ ] Each API route with valid Bearer token
- [ ] Each API route with invalid token (should return 401)
- [ ] Each API route with dev bypass header
- [ ] Rate limiting with Bearer tokens
- [ ] Timing headers are included

### **End-to-End Tests**
- [ ] Full token flow: Get token from Azure AD → API call → Success
- [ ] Web interface still works with session auth
- [ ] Mixed usage: API with Bearer tokens, web with sessions

## 🚀 **Deployment Steps**

1. **Environment Variables**: Ensure production has all required Azure AD variables
2. **Build Test**: Run `npm run build` to ensure no TypeScript errors  
3. **Integration Test**: Test in staging environment with real Azure AD tokens
4. **Rollout**: Deploy with monitoring for authentication errors
5. **Documentation**: Update API documentation with Bearer token requirements

---

## 🧪 **Testing with curl**

### Azure AD Configuration
- **App ID**: your-azure-ad-client-id-here
- **Tenant ID**: your-azure-ad-tenant-id-here
- **Client Secret**: your-azure-ad-client-secret-here

### Method 1: Direct Azure AD Token Exchange

#### Get Azure AD Access Token
```bash
CLIENT_ID="your-azure-ad-client-id-here"
CLIENT_SECRET="your-azure-ad-client-secret-here"
TENANT_ID="your-azure-ad-tenant-id-here"

ACCESS_TOKEN=$(curl -s -X POST "https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "scope=openid profile email" \
  -d "grant_type=client_credentials" | jq -r '.access_token')
```

#### Test API Endpoints
```bash
BASE_URL="http://localhost:3000"

# Test documents endpoint
curl -X GET "${BASE_URL}/api/documents" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

# Test dashboard stats
curl -X GET "${BASE_URL}/api/dashboard/stats" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"
```

### Method 2: Session Cookie Method

1. Sign in through browser at your app
2. Copy `next-auth.session-token` from Developer Tools > Cookies
3. Use session cookie:
```bash
SESSION_COOKIE="your-copied-session-token-value"
curl -X GET "${BASE_URL}/api/documents" \
  -H "Cookie: next-auth.session-token=${SESSION_COOKIE}"
```

### Automated Test Script
Create `test-api-auth.sh`:
```bash
#!/bin/bash
CLIENT_ID="your-azure-ad-client-id-here"
CLIENT_SECRET="your-azure-ad-client-secret-here"
TENANT_ID="your-azure-ad-tenant-id-here"
BASE_URL="${1:-http://localhost:3000}"

echo "🔐 Getting Azure AD access token..."
ACCESS_TOKEN=$(curl -s -X POST "https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "scope=openid profile email" \
  -d "grant_type=client_credentials" | jq -r '.access_token')

if [ "$ACCESS_TOKEN" = "null" ]; then
  echo "❌ Failed to get access token"
  exit 1
fi

echo "✅ Testing API endpoints..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "${BASE_URL}/api/documents" | jq .
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "${BASE_URL}/api/dashboard/stats" | jq .
```

### Common Issues and Solutions

#### "Invalid JWT token"
```bash
# Check token expiry
echo $ACCESS_TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq .
```

#### CORS issues when testing locally
```bash
curl -X GET "${BASE_URL}/api/documents" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Origin: http://localhost:3000"
```

---

## 🔧 **OAuth Configuration & Security Fixes**

### Current Security Issue
The OAuth callback at `/app/callback/azure-ad/route.ts` dynamically constructs URLs from headers, creating a security vulnerability.

### Root Cause
- Azure AD redirects to `/callback/azure-ad` instead of `/{basePath}/api/auth/callback/azure-ad`
- Current workaround reads `host` header (can be spoofed)
- Need static configuration instead

### Solution: Static Configuration

#### Environment Variables
```bash
# Development
NEXTAUTH_URL=http://localhost:3000
AZURE_AD_REDIRECT_URI=http://localhost:3000/api/auth/callback/azure-ad

# Production
NEXTAUTH_URL=https://your-domain.com/template
AZURE_AD_REDIRECT_URI=https://your-domain.com/template/api/auth/callback/azure-ad
```

#### Auth Configuration Update
Update `lib/auth-options.ts`:
```typescript
providers: [
  AzureADProvider({
    clientId: process.env.AZURE_AD_CLIENT_ID!,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    tenantId: process.env.AZURE_AD_TENANT_ID!,
    // Use static redirect URI instead of dynamic construction
    redirectUri: process.env.AZURE_AD_REDIRECT_URI
  })
]
```

#### Azure AD App Registration
Add these redirect URIs to Azure AD:
- `http://localhost:3000/api/auth/callback/azure-ad` (development)
- `https://your-domain.com/template/api/auth/callback/azure-ad` (production)

#### Remove Vulnerable Handler
Delete `/app/callback/azure-ad/route.ts` after configuration is updated.

### Testing OAuth Fix
```bash
# Test OAuth flow in each environment
# Development: http://localhost:3000
# Production: https://your-domain.com/template

# Verify redirect URIs work correctly
# Check that no dynamic URL construction remains
```

---

## 📚 **Additional Resources**

- [Azure AD OAuth 2.0 Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)
- [Jose JWT Library Documentation](https://github.com/panva/jose)
- [Next.js API Routes Authentication](https://nextjs.org/docs/pages/building-your-application/routing/authenticating)

## 🎯 **Success Criteria**

✅ Bearer tokens authenticate successfully against Azure AD  
✅ API routes return proper responses with valid tokens  
✅ Invalid tokens return 401 Unauthorized  
✅ Development bypass continues to work  
✅ Existing session-based web auth is unaffected  
✅ Rate limiting works with Bearer tokens  
✅ Proper error handling and logging throughout  
✅ OAuth security vulnerability fixed with static configuration  
✅ All authentication procedures documented in single location  

---

**Estimated Implementation Time**: 1-2 days for experienced developer  
**Complexity**: Medium (standard JWT implementation)  
**Risk Level**: Low-Medium (follows industry standards)