# API Authentication Testing Plan with curl

## Overview
This document outlines the simplest method to test authenticated SSO API calls using curl with your Azure AD OAuth setup.

## Azure AD Configuration
- **App ID**: f5b4d309-f081-42b4-8735-0e721dbaaf12
- **Tenant ID**: 1a58d276-b83f-4385-b9d2-0417f6191864
- **Client Secret**: 1cQ8Q~hf0LKV-TLtjtvmfVMsOv_Kn_ARZ_CoBbTr

## Method 1: Direct Azure AD Token Exchange (Simplest)

### Step 1: Get Azure AD Access Token
```bash
# Replace with your actual credentials
CLIENT_ID="f5b4d309-f081-42b4-8735-0e721dbaaf12"
CLIENT_SECRET="1cQ8Q~hf0LKV-TLtjtvmfVMsOv_Kn_ARZ_CoBbTr"
TENANT_ID="1a58d276-b83f-4385-b9d2-0417f6191864"

# Get access token from Azure AD
curl -X POST "https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "scope=openid profile email" \
  -d "grant_type=client_credentials"
```

### Step 2: Extract Access Token
```bash
# Save the response and extract the access_token
ACCESS_TOKEN=$(curl -s -X POST "https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "scope=openid profile email" \
  -d "grant_type=client_credentials" | jq -r '.access_token')

echo "Access Token: $ACCESS_TOKEN"
```

### Step 3: Test API Endpoints
```bash
# Test authenticated endpoints with the token
BASE_URL="http://localhost:3000"  # or your deployment URL

# Test session endpoint
curl -X GET "${BASE_URL}/api/auth/session" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

# Test protected API endpoints
curl -X GET "${BASE_URL}/api/documents" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

curl -X GET "${BASE_URL}/api/dashboard/stats" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"
```

## Method 2: NextAuth.js Session Cookie Method (Alternative)

### Step 1: Get Session Cookie via Browser
1. Open browser and navigate to your app
2. Sign in through Azure AD OAuth
3. Open Developer Tools > Application > Cookies
4. Copy the `next-auth.session-token` cookie value

### Step 2: Test with Session Cookie
```bash
# Use the session cookie for API calls
SESSION_COOKIE="your-copied-session-token-value"

curl -X GET "${BASE_URL}/api/documents" \
  -H "Cookie: next-auth.session-token=${SESSION_COOKIE}" \
  -H "Content-Type: application/json"
```

## Method 3: Create Test Script (Recommended)

Create a test script for easier repeated testing:

### test-api-auth.sh
```bash
#!/bin/bash

# Configuration
CLIENT_ID="f5b4d309-f081-42b4-8735-0e721dbaaf12"
CLIENT_SECRET="1cQ8Q~hf0LKV-TLtjtvmfVMsOv_Kn_ARZ_CoBbTr"
TENANT_ID="1a58d276-b83f-4385-b9d2-0417f6191864"
BASE_URL="${1:-http://localhost:3000}"

echo "🔐 Getting Azure AD access token..."

# Get access token
TOKEN_RESPONSE=$(curl -s -X POST "https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "scope=openid profile email" \
  -d "grant_type=client_credentials")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token"
  echo "Response: $TOKEN_RESPONSE"
  exit 1
fi

echo "✅ Got access token: ${ACCESS_TOKEN:0:20}..."

# Test endpoints
echo ""
echo "🧪 Testing API endpoints..."

echo ""
echo "📊 Testing /api/auth/session"
curl -s -X GET "${BASE_URL}/api/auth/session" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "📄 Testing /api/documents"
curl -s -X GET "${BASE_URL}/api/documents" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "📈 Testing /api/dashboard/stats"
curl -s -X GET "${BASE_URL}/api/dashboard/stats" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "✅ API authentication testing completed"
```

### Usage
```bash
# Make script executable
chmod +x test-api-auth.sh

# Run tests against local development
./test-api-auth.sh

# Run tests against staging/production
./test-api-auth.sh https://your-domain.com/your-basepath
```

## Common Issues and Solutions

### Issue 1: "Invalid JWT token"
**Solution**: Ensure the Azure AD token is correctly formatted and not expired
```bash
# Decode token to check expiry
echo $ACCESS_TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq .
```

### Issue 2: "Authentication required" (401)
**Solution**: Check that your API endpoints are properly configured to accept Bearer tokens
- Verify NextAuth configuration
- Ensure middleware is correctly set up

### Issue 3: CORS issues when testing locally
**Solution**: Add CORS headers or use same-origin requests
```bash
# Add Origin header for CORS
curl -X GET "${BASE_URL}/api/documents" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json"
```

## Expected Response Formats

### Successful Authentication
```json
{
  "user": {
    "id": "user-id",
    "name": "User Name", 
    "email": "user@example.com"
  },
  "expires": "2025-01-01T00:00:00.000Z"
}
```

### Failed Authentication
```json
{
  "error": "Authentication required",
  "code": 401
}
```

## Next Steps

1. **Test the basic flow** using Method 1
2. **Create the test script** (Method 3) for repeated testing
3. **Verify API responses** match expected formats
4. **Test error scenarios** (invalid tokens, expired tokens)
5. **Document any custom authentication logic** needed for your API endpoints

## Security Notes

- Never commit credentials to version control
- Use environment variables for sensitive data
- Rotate client secrets regularly
- Consider implementing token refresh logic for long-running tests