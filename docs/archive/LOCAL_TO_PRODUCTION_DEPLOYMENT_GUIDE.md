# Local-to-Production Deployment Guide: Industry Best Practices

## Overview

This guide analyzes the VVG template's local-to-production deployment challenges and provides industry-standard solutions based on 12-Factor App principles, Next.js 2024 best practices, and real-world deployment patterns.

## Table of Contents

1. [Problem Analysis](#problem-analysis)
2. [Industry Standards](#industry-standards)  
3. [Second & Third-Order Effects](#second--third-order-effects)
4. [Recommended Solutions](#recommended-solutions)
5. [Implementation Guide](#implementation-guide)
6. [Best Practices](#best-practices)

## Problem Analysis

### Current VVG Template Issues

1. **Base Path Configuration Problem**
   ```javascript
   // Current in next.config.mjs
   basePath: process.env.BASE_PATH || '',
   ```
   - Even with `BASE_PATH=` (empty), falls back to `/{PROJECT_NAME}`
   - Forces different `NEXTAUTH_URL` values between environments
   - Creates local vs production URL inconsistencies

2. **No Environment Validation at Startup**
   - App can start with incomplete configuration
   - Runtime errors instead of build-time failures
   - No clear indication of missing required variables

3. **Configuration Complexity**
   - 50+ environment variables across different files
   - Unclear precedence between `.env.*`, `ecosystem.config.js`, `docker-compose.yml`
   - No single source of truth for configuration

4. **Development Friction**
   - Difficult transition from production to local development
   - Multiple configuration files need manual updates
   - OAuth callback issues with base path mismatches

## Industry Standards

### 12-Factor App Configuration Principles

Based on [The Twelve-Factor App](https://12factor.net/config) methodology:

1. **Strict Separation of Config from Code**
   - Configuration varies between deployments, code does not
   - Code should be open-sourceable without exposing credentials

2. **Environment Variables Over Files**
   - Use environment variables for all configuration
   - Easy to change between deploys without code changes
   - Language and OS agnostic

3. **No Environment Grouping**
   - Avoid "development", "staging", "production" config groups
   - Each variable is independent and orthogonal
   - Granular control per deployment

4. **Fail Fast on Missing Config**
   - Validate configuration at startup
   - Prevent runtime errors with early validation

### Next.js 2024 Best Practices

According to industry research and Next.js documentation:

1. **Dynamic Base Path Configuration**
   ```javascript
   // Industry standard approach
   const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
   
   module.exports = (phase) => {
     if (phase === PHASE_DEVELOPMENT_SERVER) {
       return {
         basePath: '', // No basePath in development
       }
     }
     
     return {
       basePath: process.env.BASE_PATH || '/app',
     }
   }
   ```

2. **Schema Validation with Zod**
   ```javascript
   import { z } from 'zod'
   
   const envSchema = z.object({
     DATABASE_URL: z.string().url(),
     NEXTAUTH_SECRET: z.string().min(32),
     // Only validate truly required vars
   })
   
   const env = envSchema.parse(process.env)
   ```

3. **Instrumentation for Startup Validation**
   ```javascript
   // instrumentation.ts (Next.js 14+)
   export async function register() {
     if (!process.env.SKIP_ENV_VALIDATION) {
       validateEnvironment()
     }
   }
   ```

## Second & Third-Order Effects

### 1. Base Path Logic Fix

**Second-order effects:**
- Existing `dev:no-basepath` script becomes redundant
- OAuth redirect URLs work differently
- Client-side path utilities may break
- CORS headers mismatch with hardcoded localhost:3000

**Third-order effects:**
- Reverse proxy configurations fail (NGINX expects `/{PROJECT_NAME}`)
- Monitoring/logging paths change (APM tools won't match)
- Developer muscle memory disruption
- Documentation drift (all guides reference basePath URL)

### 2. Environment Validation Addition

**Second-order effects:**
- Docker builds fail (Dockerfile has `SKIP_ENV_VALIDATION=true`)
- GitHub Actions need env var updates
- Development friction increases
- Test scripts break without full environment

**Third-order effects:**
- Onboarding becomes two-step process
- Secret management complexity increases
- Error message proliferation needed
- Deployment rollbacks become harder

### 3. Development Scripts Creation

**Second-order effects:**
- Script precedence confusion (.env.local vs script ENV vars)
- Port conflicts between developers
- npm script proliferation (already have 4+ dev scripts)
- Cross-platform issues (Windows ENV var handling)

**Third-order effects:**
- IDE integration breaks (VS Code launch configs)
- Debugging becomes harder (ENV vars not visible)
- Team fragmentation ("works on my machine")
- CI/CD divergence from local scripts

### Configuration Cascade Problem

The combination creates a **configuration cascade**:

1. Base path fix → Changes all URLs → Breaks existing deployments
2. Validation → Requires all vars → Conflicts with simplified dev scripts  
3. Dev scripts → Override validation → Defeats validation purpose

## Recommended Solutions

### 1. Fix Base Path with Phase Detection

```javascript
// next.config.mjs
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
  // Development: No base path for easier local development
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...defaultConfig,
      basePath: process.env.BASE_PATH || '',
      assetPrefix: process.env.BASE_PATH || '',
    }
  }
  
  // Production: Use base path with sensible default
  return {
    ...defaultConfig,
    basePath: process.env.BASE_PATH || '/{PROJECT_NAME}',
    assetPrefix: process.env.BASE_PATH || '/{PROJECT_NAME}',
  }
}
```

### 2. Minimal Environment Validation

```javascript
// lib/env-validation.ts
import { z } from 'zod'

// Only validate what actually breaks the app
const requiredEnvSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL').optional(),
})

const optionalEnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  // ... other optional vars
})

export function validateEnvironment() {
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    console.log('⚠️  Environment validation skipped')
    return
  }

  try {
    requiredEnvSchema.parse(process.env)
    console.log('✅ Environment validation passed')
  } catch (error) {
    console.error('❌ Environment validation failed:')
    console.error(error.errors)
    console.error('\nSet SKIP_ENV_VALIDATION=true to bypass validation')
    process.exit(1)
  }
}
```

### 3. Improved Development Experience

```javascript
// package.json - Update existing script
{
  "scripts": {
    "dev:local": "SKIP_ENV_VALIDATION=true BASE_PATH='' next dev --port 3000",
    "dev:production-like": "next dev --port 3000",
    // Keep existing scripts as-is to avoid breaking changes
  }
}
```

### 4. Configuration File Structure

```
├── .env                    # Shared defaults (committed)
├── .env.local             # Local overrides (gitignored)
├── .env.local.example     # Developer template
├── .env.development       # Dev-specific (committed)
├── .env.production        # Prod-specific (committed)
└── instrumentation.ts     # Startup validation
```

## Implementation Guide

### Phase 1: Safe Base Path Fix

1. **Update next.config.mjs with phase detection**
   ```bash
   # Test locally
   BASE_PATH='' npm run dev  # Should work at localhost:3000
   BASE_PATH='/test' npm run dev  # Should work at localhost:3000/test
   ```

2. **Update OAuth configuration**
   ```javascript
   // lib/auth-options.ts
   const getBaseUrl = () => {
     if (process.env.NODE_ENV === 'development') {
       return process.env.NEXTAUTH_URL || 'http://localhost:3000'
     }
     return process.env.NEXTAUTH_URL || 'https://department.vtc.systems/{PROJECT_NAME}'
   }
   ```

### Phase 2: Add Minimal Validation

1. **Create validation module**
   ```bash
   # Create lib/env-validation.ts with minimal required vars
   ```

2. **Add instrumentation.ts**
   ```javascript
   export async function register() {
     const { validateEnvironment } = await import('./lib/env-validation')
     validateEnvironment()
   }
   ```

### Phase 3: Documentation and Developer Experience

1. **Update .env.local.example**
   - Clear comments on required vs optional
   - Local development defaults
   - Instructions for getting started

2. **Add development scripts**
   - Simple local development command
   - Production-like testing command

### Testing Strategy

1. **Local Development Test**
   ```bash
   # Should work without any configuration
   cp .env.local.example .env.local
   npm run dev:local
   ```

2. **Production-like Test**
   ```bash
   # Should require proper configuration
   npm run build
   npm start
   ```

3. **Deployment Test**
   ```bash
   # Should fail fast with clear error messages
   unset NEXTAUTH_SECRET
   npm run build  # Should fail with helpful message
   ```

## Best Practices

### Configuration Management

1. **Minimize Required Variables**
   - Only require variables that break core functionality
   - Provide sensible defaults for everything else
   - Use feature flags for optional functionality

2. **Clear Error Messages**
   ```javascript
   if (!process.env.DATABASE_URL) {
     console.error('❌ DATABASE_URL is required for database functionality')
     console.error('💡 For local development, you can use SQLite: DATABASE_URL=file:./dev.db')
   }
   ```

3. **Environment-Specific Defaults**
   ```javascript
   const config = {
     port: process.env.PORT || (process.env.NODE_ENV === 'development' ? 3000 : 8080),
     logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
   }
   ```

### Development Experience

1. **One-Command Setup**
   ```bash
   # Developer should be able to run this and start coding
   cp .env.local.example .env.local
   npm install
   npm run dev
   ```

2. **Fail Fast with Helpful Messages**
   - Validate at startup, not runtime
   - Provide copy-pasteable solutions
   - Link to documentation

3. **Environment Parity**
   - Use same tools in dev and prod where possible
   - Docker for complex dependencies
   - Same base configuration with environment overrides

### Deployment Strategy

1. **Single Artifact Deployment**
   - Build once, deploy everywhere
   - Runtime configuration injection
   - No environment-specific builds

2. **Configuration Validation**
   - CI/CD should validate configuration
   - Staging environment for integration testing
   - Canary deployments with config validation

3. **Rollback Strategy**
   - Keep previous configuration versions
   - Quick rollback without full rebuild
   - Configuration change audit trail

## Conclusion

The VVG template's deployment configuration challenges stem from violating 12-Factor App principles and Next.js best practices. The recommended solutions focus on:

1. **Minimal required configuration** for local development
2. **Clear separation** between development and production needs
3. **Fail-fast validation** with helpful error messages
4. **Single artifact deployment** with runtime configuration

These changes will provide a smooth transition from local to production deployment while maintaining the flexibility needed for different deployment scenarios.

## References

- [The Twelve-Factor App - Config](https://12factor.net/config)
- [Next.js Environment Variables Guide](https://nextjs.org/docs/pages/guides/environment-variables)
- [Next.js basePath Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath)
- [Environment Variables Validation Best Practices](https://jenssegers.com/simple-next-js-environment-variable-validation)

---

**Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**