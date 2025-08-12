**⚠️ CRITICAL FILE PROTECTION: NEVER write to this file unless explicitly told to. This file contains core development principles that must remain stable. ⚠️**

You are an LLM-based coding assistant. You must NEVER EVER DEVIATE from these four CORE PRINCIPLES—they are inviolable and apply to every feature, bug fix, and code change:

**1. Smallest Possible Feature**

* Identify exactly one user-visible behavior.
* Implement only the minimal code change to satisfy it.
* Write a single, focused test that passes only if this behavior works.
* STOP—do not scaffold or plan additional features.

**2. Fail FAST**

* Declare your input schema (types, ranges, required fields).
* Validate **real** inputs against that schema—no mock data ever.
* On the first failing check, immediately abort code generation.
* Return a structured error (code, message, failing field) and HALT.

**3. Determine Root Cause**

* Wrap risky blocks in try/catch (or equivalent).
* On exception, capture inputs, state, and full stack trace.
* Compare the error location to the latest diff.
* Extract and REPORT the underlying cause BEFORE any remediation.

**4. DRY (Don't Repeat Yourself)**

* Search the existing codebase for matching logic or utilities.
* If found, import or extend; never write new duplicate code.
* If duplicates exist, refactor them into a shared utility.
* Centralize common patterns into a well-named abstraction used everywhere.

---

# Azure AD Configuration - Industry Standard Setup

## 🔗 Reply URLs (Redirect URIs) Configuration

Following 2024 industry standards, this template uses NextAuth.js automatic redirect URI handling.

### **Format Pattern:**
```
{NEXTAUTH_URL}/api/auth/callback/azure-ad
```

### **URLs to Add in Azure AD App Registration:**

#### **✅ Development**
```
http://localhost:3000/api/auth/callback/azure-ad
```

#### **✅ Production** 
```
https://your-domain.com/template/api/auth/callback/azure-ad
```

#### **✅ Staging**
```
https://your-domain.com/template-staging/api/auth/callback/azure-ad
```

### **Azure AD Portal Configuration:**
1. Navigate to **Azure Active Directory** → **App registrations**
2. Select your app registration
3. Go to **Authentication** → **Platform configurations** → **Web**
4. Add the URLs above as Redirect URIs
5. **Disable** Implicit grant (not needed for NextAuth.js)

### **Environment Variables:**
```bash
# .env.local (Development)
NEXTAUTH_URL=http://localhost:3000

# .env.production  
NEXTAUTH_URL=https://your-domain.com/template

# .env.staging
NEXTAUTH_URL=https://your-domain.com/template-staging
```

### **Key Principles:**
- ✅ **Automatic**: NextAuth.js constructs redirect URIs automatically
- ✅ **No Manual Override**: Never add `redirect_uri` parameter in code
- ✅ **Exact Match**: Azure AD URLs must exactly match NextAuth.js construction
- ✅ **Enhanced Scopes**: Uses `openid profile email offline_access User.Read`

This follows 2024 industry standards and eliminates manual redirect URI configuration issues.

---

# Comprehensive Logging Strategy

## 🔍 Complete Transparency with PM2 Logging

This template implements industry-standard comprehensive logging with complete transparency for all operations.

### **Logging Architecture**

#### **✅ Winston-Based Structured Logging**
- **JSON Format**: Structured logs for production environments
- **Colored Console**: Human-readable development logging
- **File Rotation**: Automatic log file management (10MB max, 5 files retained)
- **Multiple Levels**: error, warn, info, http, debug

#### **✅ PM2 Integration**
```javascript
// ecosystem.config.js - Comprehensive PM2 logging
log_type: 'json',
log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
rotate_logs: true,
max_log_file_size: '10M',
retain_logs: 30
```

### **What Gets Logged**

#### **🚀 Application Startup**
- Environment configuration (masked sensitive values)
- Database connection status
- Authentication provider setup
- Memory usage and system information
- Platform and Node.js version details

#### **🔐 Authentication Flow**
- User sign-ins and sign-outs
- JWT token creation and session management
- Account linking events
- Authentication failures with context

#### **🌐 Request/Response Tracking**
- All HTTP requests with method, path, status, and duration
- Unique request IDs for tracing
- Response times and performance metrics
- Middleware execution logging

#### **💾 Database Operations**
- SQL query execution times and row counts
- Connection pool status and health
- Database errors with full context
- Query performance monitoring

#### **📁 File Operations**
- Upload attempts and completions
- File processing stages and results
- Storage operations (local/S3)
- Document extraction and analysis

#### **❌ Error Handling**
- Full stack traces with context
- Error categorization and classification
- Request correlation for debugging
- Global error handlers for unhandled exceptions

### **Log Files Structure**

#### **Development**
```bash
logs/
├── error.log          # Error-level logs only
├── combined.log       # All log levels
└── console output     # Real-time colored logging
```

#### **Production**
```bash
logs/
├── app-error.log      # Application errors
├── app-out.log        # Standard output
├── error.log          # Winston error logs
└── combined.log       # Winston combined logs
```

### **Environment Variables**

```bash
# Logging Configuration
LOG_LEVEL=info              # debug, info, warn, error
NODE_ENV=production         # Affects log format and detail

# PM2 automatically handles:
# - Log rotation (10MB max files)
# - Timestamp formatting
# - JSON structured output
# - Log retention (30 days)
```

### **Key Features**

#### **🔒 Security-First**
- **No Sensitive Data**: Passwords, secrets, and API keys are masked
- **Request Sanitization**: User input is sanitized in logs
- **Error Context**: Errors include context without exposing sensitive information

#### **📊 Performance Monitoring**
- **Response Times**: Every request tracked with duration
- **Database Performance**: Query execution times logged
- **Memory Usage**: Startup memory footprint recorded
- **Request Tracing**: Unique IDs for request correlation

#### **🛠️ Developer Experience**
- **Colored Console**: Easy-to-read development logs
- **Stack Traces**: Full error context in development
- **Request Flow**: Complete request lifecycle visibility
- **Component Tracing**: Every major operation logged

### **Usage Examples**

#### **Application Monitoring**
```bash
# View real-time logs
pm2 logs vvg-template

# View specific log types
pm2 logs vvg-template --lines 100
tail -f logs/combined.log | grep ERROR
```

#### **Request Tracing**
Each request gets a unique ID for end-to-end tracking:
```
→ POST /api/upload [abc-123-def]
DB: INSERT documents 15ms [abc-123-def]
File: upload-completed document.pdf [abc-123-def]
← POST /api/upload 201 1.2s [abc-123-def]
```

### **Benefits**

✅ **Complete Transparency**: Every operation is logged  
✅ **Production Ready**: Structured JSON logs for monitoring  
✅ **Performance Insights**: Response times and bottlenecks tracked  
✅ **Error Debugging**: Full context for troubleshooting  
✅ **Security Compliant**: No sensitive data in logs  
✅ **Scalable**: Log rotation and retention policies  

This comprehensive logging strategy provides complete visibility into application behavior while maintaining security and performance standards.

---

# NGINX Reverse Proxy Configuration

## 🌐 Production-Ready Reverse Proxy Setup

This template includes a complete, production-ready NGINX reverse proxy configuration that properly handles Next.js basePath routing.

### **Configuration File**

**File**: `/deployment/nginx.vvg-template-enhanced.conf`

This is the **ONLY** nginx configuration you need. All other nginx configs have been removed to avoid confusion.

### **Key Features**

#### **✅ BasePath Routing**
- **Production**: Routes `https://your-domain.com/template/*` → `http://localhost:3000/template/`
- **Staging**: Routes `https://your-domain.com/template-staging/*` → `http://localhost:3001/template-staging/`
- **Correct trailing slash handling**: Both `/template` and `/template/` work properly

#### **✅ SSL/HTTPS Support**
- **Production**: Port 443 with Let's Encrypt certificates
- **Staging**: Port 8443 with same certificates
- **HTTP → HTTPS redirect**: Automatic redirect from port 80

#### **✅ Azure AD Authentication Optimized**
- **Large Buffer Sizes**: Prevents auth failures with 5+ users
- **Proxy Buffer Configuration**: `128k` buffer size, `4 256k` buffers
- **Upload Limits**: 10MB production, 20MB staging

#### **✅ Security Headers**
- Content Security Policy (CSP)
- X-Frame-Options, X-XSS-Protection
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

#### **✅ Performance Optimization**
- **Gzip Compression**: Enabled for all text/JS/CSS assets
- **Static Asset Caching**: 1-year cache for images, fonts, etc.
- **Proper Timeouts**: 60s connect/send/read timeouts

### **URL Structure Explained**

#### **Why `/template/` URLs?**

This is **NORMAL Next.js behavior** with basePath configuration:

- ✅ `http://localhost:3000/template/dashboard` → **200 OK**
- ❌ `http://localhost:3000/dashboard` → **404 Not Found (Expected)**

The 404 on root paths is **intentional design** that enables:
- **Multi-app deployments** on same domain
- **Path isolation** between different services
- **Corporate architecture** compliance
- **No URL conflicts** with other applications

### **Production URLs**

In production, users will access:
```
https://your-domain.com/template/dashboard
https://your-domain.com/template/documents
https://your-domain.com/template/api/auth/session
```

### **Staging URLs**

In staging environment:
```
https://your-domain.com:8443/template-staging/dashboard  
https://your-domain.com:8443/template-staging/documents
```

### **Port Configuration**

- **Development**: localhost:3000
- **Production**: localhost:3000 (via nginx proxy)
- **Staging**: localhost:3001 (via nginx proxy)

### **Deployment Instructions**

1. **Copy config file**:
   ```bash
   sudo cp deployment/nginx.vvg-template-enhanced.conf /etc/nginx/sites-available/vvg-template
   ```

2. **Enable site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/vvg-template /etc/nginx/sites-enabled/
   ```

3. **Test and reload**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### **Key Benefits**

✅ **Enterprise-Grade**: Handles multiple environments  
✅ **Security-First**: Complete security headers and CSP  
✅ **Performance**: Optimized caching and compression  
✅ **Azure AD Ready**: Large buffers prevent auth issues  
✅ **Maintenance**: Single config file, no redundancy  

This nginx configuration is designed for **enterprise production environments** and follows 2024 industry best practices for Next.js applications with basePath routing.

---

# BasePath Configuration - Complete Implementation Guide

## 🌐 Comprehensive BasePath Support

This template implements industry-standard basePath configuration for subdirectory deployments, enabling deployment at any URL path (e.g., `domain.com/your-app`).

### **Environment Variable Configuration**

#### **✅ Development (.env)**
```bash
BASE_PATH=/template
NEXT_PUBLIC_BASE_PATH=/template
PORT=3000
```

#### **✅ Production (.env.production)**
```bash
BASE_PATH=/template
NEXT_PUBLIC_BASE_PATH=/template
NEXTAUTH_URL=https://your-domain.com/template
APP_URL=https://your-domain.com/template
```

#### **✅ Staging (.env.staging)**
```bash
BASE_PATH=/template-staging
NEXT_PUBLIC_BASE_PATH=/template-staging
NEXTAUTH_URL=https://your-domain.com/template-staging
APP_URL=https://your-domain.com/template-staging
```

### **Next.js Configuration (next.config.mjs)**

```javascript
const nextConfig = {
  basePath: process.env.BASE_PATH || '',
  assetPrefix: process.env.BASE_PATH || '',
  // ... other config
};
```

### **Path Utilities (lib/utils/path-utils.ts)**

The template provides comprehensive path utilities for consistent basePath handling:

```typescript
import { pagePath, apiPath, assetPath } from '@/lib/utils/path-utils';

// Navigation
router.push(pagePath('/dashboard'));

// API calls
fetch(apiPath('/documents'));

// Assets
<img src={assetPath('/logo.svg')} />
```

### **Client-Side Hook (lib/hooks/use-basepath.ts)**

For React components:

```typescript
import { useBasePath } from '@/lib/hooks';

const { pagePath, apiPath, assetPath } = useBasePath();
```

### **NextAuth.js Integration**

Authentication automatically handles basePath through:

1. **Automatic NEXTAUTH_URL**: Constructed from BASE_PATH + domain
2. **Redirect Logic**: `lib/auth-options.ts` handles basePath in redirects
3. **Provider Configuration**: SessionProvider uses `getAuthBasePath()`

### **URL Structure**

#### **Development**
- Base: `http://localhost:3000/template`
- Pages: `http://localhost:3000/template/dashboard`
- API: `http://localhost:3000/template/api/auth/session`
- Assets: `http://localhost:3000/template/logo.svg`

#### **Production**
- Base: `https://your-domain.com/template`
- Pages: `https://your-domain.com/template/dashboard`
- API: `https://your-domain.com/template/api/auth/session`
- Assets: `https://your-domain.com/template/logo.svg`

### **Verification Checklist**

✅ **Environment Variables**: BASE_PATH and NEXT_PUBLIC_BASE_PATH match  
✅ **Navigation**: All `<Link>` components use `pagePath()`  
✅ **API Calls**: All fetch() calls use `apiPath()`  
✅ **Assets**: All images/icons use `assetPath()`  
✅ **Authentication**: NextAuth redirects include basePath  
✅ **Nginx**: Proxy configuration handles basePath routing  
✅ **Static Assets**: All public files accessible via basePath  

### **Common Patterns**

#### **Component Navigation**
```tsx
import { useBasePath } from '@/lib/hooks';

const { pagePath } = useBasePath();
<Link href={pagePath('/dashboard')}>Dashboard</Link>
```

#### **API Integration**
```tsx
import { apiPath } from '@/lib/utils/path-utils';

const response = await fetch(apiPath('/documents'));
```

#### **Asset References**
```tsx
import { useBasePath } from '@/lib/hooks';

const { assetPath } = useBasePath();
<img src={assetPath('/logo.svg')} alt="Logo" />
```

#### **Router Navigation**
```tsx
import { useRouter } from 'next/navigation';
import { useBasePath } from '@/lib/hooks';

const router = useRouter();
const { pagePath } = useBasePath();
router.push(pagePath('/documents'));
```

### **Deployment Scenarios**

#### **Root Deployment** (`domain.com`)
```bash
BASE_PATH=
NEXT_PUBLIC_BASE_PATH=
```

#### **Subdirectory Deployment** (`domain.com/app`)
```bash
BASE_PATH=/app
NEXT_PUBLIC_BASE_PATH=/app
```

#### **Multi-Environment** (`domain.com/app-staging`)
```bash
BASE_PATH=/app-staging
NEXT_PUBLIC_BASE_PATH=/app-staging
```

### **Key Benefits**

✅ **Universal Compatibility**: Works in any deployment context  
✅ **Zero Hardcoding**: No hardcoded URLs anywhere in codebase  
✅ **Environment Aware**: Automatically adapts to deployment environment  
✅ **Authentication Ready**: Full NextAuth.js basePath support  
✅ **Asset Optimization**: Correct CDN and static asset handling  
✅ **SEO Friendly**: Proper canonical URLs and metadata  

This basePath implementation follows **Next.js 14+ best practices** and supports enterprise deployment scenarios including subdirectories, reverse proxies, and multi-tenant environments.

---

# Environment Resource Sharing - Rapid Shipping Configuration

## ⚡ Shared Resources Strategy

**IMPORTANT**: For rapid shipping and development velocity, this template is configured to share database and storage resources between staging and production environments.

### **⚠️ Production Consideration**
This configuration prioritizes **speed of deployment** over environment isolation. While not recommended for enterprise production applications, it enables:
- **Faster deployment cycles**
- **Reduced infrastructure complexity** 
- **Shared resource costs**
- **Simplified data management**

### **Shared Resource Configuration**

#### **✅ Database Sharing**
Both staging and production use the same database with table prefixes for isolation:

```bash
# Both .env.staging and .env.production
DATABASE_URL=mysql://user:password@shared-db-host:3306/template_shared_db
MYSQL_HOST=shared-db-host
MYSQL_PORT=3306
MYSQL_USER=template_user
MYSQL_PASSWORD=shared-mysql-password
MYSQL_DATABASE=template_shared
```

**Table Isolation Strategy**:
- Production tables: `documents`, `users`, `comparisons`
- Staging tables: `staging_documents`, `staging_users`, `staging_comparisons`

#### **✅ S3 Storage Sharing**
Both environments use the same S3 bucket with different folder prefixes:

```bash
# Both .env.staging and .env.production  
S3_BUCKET_NAME=shared-template-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=shared-aws-access-key-id
AWS_SECRET_ACCESS_KEY=shared-aws-secret-access-key

# Different folder prefixes for isolation
# .env.production
S3_FOLDER_PREFIX=template-production/

# .env.staging  
S3_FOLDER_PREFIX=template-staging/
```

**File Isolation**:
- Production files: `s3://shared-bucket/template-production/documents/`
- Staging files: `s3://shared-bucket/template-staging/documents/`

#### **✅ Shared AWS Credentials**
Both environments use the same AWS IAM credentials with permissions for:
- S3 bucket read/write access
- CloudWatch logging (if enabled)
- SES email sending (if configured)

### **Benefits for Rapid Shipping**

✅ **Single Infrastructure**: One database, one S3 bucket to manage  
✅ **Cost Effective**: Shared resources reduce AWS billing  
✅ **Simple Deployment**: Same connection strings, minimal config differences  
✅ **Fast Iteration**: No environment provisioning delays  
✅ **Shared Monitoring**: Unified logging and metrics  

### **Risk Mitigation**

While sharing resources, we maintain isolation through:

1. **Folder/Table Prefixes**: Data segregation at application level
2. **Different Base Paths**: `/template` vs `/template-staging`
3. **Separate Application Instances**: Different ports and processes
4. **Environment Variables**: Staging vs production configuration flags

### **Future Migration Path**

When ready to separate environments:

1. **Database**: Export staging tables → new staging database
2. **Storage**: Copy `template-staging/` folder → new staging bucket  
3. **Credentials**: Create separate AWS IAM users
4. **Update Environment Files**: Point to separate resources

### **Environment File Configuration**

Update your `.env.staging` and `.env.production` files to use shared resources:

```bash
# .env.staging
DATABASE_URL=mysql://user:password@your-shared-db-host:3306/template_shared
S3_BUCKET_NAME=your-shared-s3-bucket
S3_FOLDER_PREFIX=template-staging/
AWS_ACCESS_KEY_ID=your-shared-aws-key
AWS_SECRET_ACCESS_KEY=your-shared-aws-secret

# .env.production  
DATABASE_URL=mysql://user:password@your-shared-db-host:3306/template_shared
S3_BUCKET_NAME=your-shared-s3-bucket  
S3_FOLDER_PREFIX=template-production/
AWS_ACCESS_KEY_ID=your-shared-aws-key
AWS_SECRET_ACCESS_KEY=your-shared-aws-secret
```

This configuration enables **rapid shipping** while maintaining basic data isolation through application-level prefixes.