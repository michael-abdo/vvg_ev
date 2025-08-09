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