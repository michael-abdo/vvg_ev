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