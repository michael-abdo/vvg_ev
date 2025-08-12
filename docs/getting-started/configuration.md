# Configuration Guide

Comprehensive configuration options for the Document Processing Template.

## 🔧 Environment Configuration

The template uses a three-tier environment configuration system:

### Configuration Files
- **`.env`** - Base configuration with defaults (committed to repo)
- **`.env.production`** - Production-specific overrides (committed to repo)
- **`.env.local`** - Secrets and local overrides (gitignored)

### Loading Order
1. `.env` (base configuration)
2. `.env.production` (if NODE_ENV=production)
3. `.env.local` (local overrides and secrets)

## 🌐 Application Settings

### Basic Configuration
```bash
# Application
NODE_ENV=development              # development, production, test
PORT=3000                        # Application port
BASE_PATH=/template              # URL base path for deployment
NEXT_PUBLIC_BASE_PATH=/template  # Client-side base path

# URLs
NEXTAUTH_URL=http://localhost:3000/template  # Full application URL
APP_URL=http://localhost:3000/template       # Used for API calls
```

### Logging Configuration
```bash
LOG_LEVEL=info                   # error, warn, info, http, debug
LOG_FORMAT=combined              # combined, json, simple
LOG_FILE_ENABLED=true           # Enable file logging
LOG_MAX_SIZE=10m                # Max log file size
LOG_MAX_FILES=5                 # Number of log files to retain
```

## 🔐 Authentication Settings

### NextAuth.js Configuration
```bash
# Authentication Secret (Required)
NEXTAUTH_SECRET=your-32-char-secret  # Generate with: openssl rand -base64 32

# Session Configuration
NEXTAUTH_URL=https://your-domain.com/template  # Must match deployment URL
NEXTAUTH_SESSION_STRATEGY=jwt                  # jwt or database
NEXTAUTH_SESSION_MAX_AGE=86400                # Session duration (seconds)
```

### Azure AD Integration
```bash
# Azure AD App Registration (Required)
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id             # Or 'common' for multi-tenant

# Optional: Custom scopes
AZURE_AD_SCOPE=openid profile email offline_access User.Read

# Advanced: Well-known URL override
AZURE_AD_WELL_KNOWN=https://login.microsoftonline.com/common/v2.0/.well-known/openid_configuration
```

### Setting Up Azure AD

1. **Create App Registration**
   ```bash
   # Required redirect URIs:
   # Development: http://localhost:3000/template/api/auth/callback/azure-ad
   # Production: https://your-domain.com/template/api/auth/callback/azure-ad
   ```

2. **Configure App Registration**
   - **Authentication** → **Platform configurations** → **Web**
   - Add redirect URIs
   - **Implicit grant**: Disabled (not needed)
   - **Allow public client flows**: No

3. **API Permissions**
   - Microsoft Graph → Delegated permissions
   - Add: `openid`, `profile`, `email`, `User.Read`

## 🗄️ Database Configuration

### MySQL Connection
```bash
# Database Connection (Required)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=vvg_template

# SSL Configuration
MYSQL_SSL=true                   # Enable SSL connection
MYSQL_SSL_REJECT_UNAUTHORIZED=true  # Reject unauthorized certificates

# Connection Pool
MYSQL_CONNECTION_LIMIT=10        # Maximum connections
MYSQL_ACQUIRE_TIMEOUT=60000      # Connection acquisition timeout (ms)
MYSQL_TIMEOUT=60000             # Query timeout (ms)
```

### Advanced Database Settings
```bash
# Connection Options
MYSQL_CHARSET=utf8mb4           # Character set
MYSQL_TIMEZONE=Z                # Timezone (Z for UTC)
MYSQL_DATE_STRINGS=false        # Return dates as strings

# Debug Options
MYSQL_DEBUG=false               # Enable SQL query logging
MYSQL_MULTIPLE_STATEMENTS=false # Allow multiple statements
```

### Database Migration
```bash
# Migration Settings
DB_MIGRATE_DIR=database/migrations
DB_MIGRATE_TABLE=schema_migrations
DB_MIGRATE_SCHEMA=vvg_template
```

## 📁 Storage Configuration

### Local Storage (Development)
```bash
STORAGE_PROVIDER=local
LOCAL_UPLOAD_DIR=/tmp/uploads    # Local storage directory
LOCAL_MAX_FILE_SIZE=10485760    # 10MB in bytes
```

### AWS S3 Storage (Production)
```bash
STORAGE_PROVIDER=s3

# S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-2
S3_BUCKET_NAME=your-bucket-name
S3_FOLDER_PREFIX=documents/      # Optional: folder prefix

# S3 Advanced Options
S3_FORCE_PATH_STYLE=false       # Use path-style URLs
S3_ENDPOINT=                     # Custom endpoint (for S3-compatible services)
S3_SIGNATURE_VERSION=v4         # Signature version
```

### File Upload Settings
```bash
# File Upload Limits
MAX_FILE_SIZE=10485760          # 10MB in bytes
ALLOWED_FILE_TYPES=pdf,docx,doc,txt  # Comma-separated list
MAX_FILES_PER_UPLOAD=5          # Maximum files per upload

# File Processing
FILE_PROCESSING_TIMEOUT=300000   # 5 minutes in milliseconds
EXTRACT_TEXT_ON_UPLOAD=true     # Auto-extract text
GENERATE_THUMBNAILS=false       # Generate file thumbnails
```

## 🤖 AI Integration

### OpenAI Configuration
```bash
# OpenAI API (Optional)
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-3.5-turbo      # Default model for comparisons
OPENAI_MAX_TOKENS=1000          # Max tokens per request
OPENAI_TEMPERATURE=0.3          # Creativity level (0-1)

# Advanced OpenAI Settings
OPENAI_BASE_URL=https://api.openai.com/v1  # Custom API endpoint
OPENAI_TIMEOUT=30000            # Request timeout (ms)
OPENAI_MAX_RETRIES=3           # Number of retries on failure
```

### AI Feature Toggles
```bash
# Feature Flags
ENABLE_AI_COMPARISON=true       # Enable document comparison
ENABLE_TEXT_EXTRACTION=true     # Enable text extraction
ENABLE_CONTENT_ANALYSIS=false   # Enable content analysis (premium)
```

## 🔧 Performance Settings

### Application Performance
```bash
# Node.js Settings
NODE_OPTIONS=--max-old-space-size=2048  # Memory limit (MB)
UV_THREADPOOL_SIZE=4                    # UV thread pool size

# Next.js Settings
NEXT_TELEMETRY_DISABLED=1              # Disable Next.js telemetry
```

### Caching Configuration
```bash
# Redis Cache (Optional)
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=vvg_template:
REDIS_TTL=3600                 # Default TTL in seconds

# Memory Cache
CACHE_MAX_SIZE=100             # Max items in memory cache
CACHE_TTL=300                  # Memory cache TTL (seconds)
```

### Rate Limiting
```bash
# API Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window
RATE_LIMIT_SKIP_FAILED=true    # Skip failed requests
```

## 🔒 Security Configuration

### Security Headers
```bash
# Security Settings
CORS_ENABLED=true
CORS_ORIGIN=https://your-domain.com
CSRF_PROTECTION=true
HELMET_ENABLED=true            # Enable security headers

# Content Security Policy
CSP_ENABLED=true
CSP_REPORT_ONLY=false
CSP_REPORT_URI=/api/csp-report
```

### Encryption Settings
```bash
# Data Encryption
ENCRYPTION_KEY=your-32-byte-key        # For sensitive data encryption
HASH_SALT_ROUNDS=12                   # bcrypt salt rounds

# File Security
SCAN_UPLOADS_FOR_MALWARE=false        # Enable malware scanning
QUARANTINE_SUSPICIOUS_FILES=true      # Quarantine flagged files
```

## 📊 Monitoring & Analytics

### Application Monitoring
```bash
# Health Checks
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30000    # Health check interval (ms)

# Metrics Collection
METRICS_ENABLED=true
METRICS_ENDPOINT=/metrics
PROMETHEUS_ENABLED=false       # Prometheus metrics format
```

### Error Tracking
```bash
# Error Reporting
SENTRY_DSN=                    # Sentry error tracking
SENTRY_ENVIRONMENT=production
SENTRY_TRACE_SAMPLE_RATE=0.1

# Error Logging
ERROR_WEBHOOK_URL=             # Webhook for critical errors
SLACK_WEBHOOK_URL=             # Slack notifications
```

## 🌍 Internationalization

### Locale Settings
```bash
# Internationalization
DEFAULT_LOCALE=en-US
SUPPORTED_LOCALES=en-US,es-ES,fr-FR
TIMEZONE=UTC
DATE_FORMAT=YYYY-MM-DD
TIME_FORMAT=HH:mm:ss
```

## 🚀 Deployment-Specific Settings

### Development
```bash
# Development Only
DEBUG=true
HOT_RELOAD=true
SOURCE_MAPS=true
MOCK_EXTERNAL_APIS=false
SEED_DATABASE=true
```

### Staging
```bash
# Staging Environment
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=500
MOCK_EXTERNAL_APIS=false
```

### Production
```bash
# Production Environment
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn
METRICS_ENABLED=true
ERROR_REPORTING_ENABLED=true
HEALTH_CHECK_ENABLED=true
```

## 🔍 Configuration Validation

### Validate Configuration
```bash
# Check required environment variables
npm run validate:env

# Test configuration
npm run config:test

# View current configuration (sanitized)
npm run config:show
```

### Configuration Scripts
```bash
# Generate environment template
npm run env:generate-template

# Migrate old configuration
npm run env:migrate

# Check for missing variables
npm run env:check
```

## 📚 Environment Templates

### `.env.example` (Template)
```bash
# Copy this file to .env.local and fill in your values

# Authentication
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-tenant-id

# Database
MYSQL_HOST=localhost
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password

# Optional: OpenAI
OPENAI_API_KEY=your-openai-key

# Optional: AWS S3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=your-bucket
```

### Docker Environment
```bash
# docker-compose.override.yml environment
environment:
  - NODE_ENV=development
  - LOG_LEVEL=debug
  - DEBUG=true
  - MYSQL_HOST=mysql
  - STORAGE_PROVIDER=local
```

## 🆘 Troubleshooting Configuration

### Common Issues

#### Environment Variables Not Loading
```bash
# Check file permissions
ls -la .env*

# Verify syntax (no spaces around =)
cat .env.local | grep -E "^[A-Z_]+=.*"

# Check for BOM or encoding issues
file .env.local
```

#### Azure AD Configuration
```bash
# Test Azure AD endpoint
curl "https://login.microsoftonline.com/$AZURE_AD_TENANT_ID/v2.0/.well-known/openid_configuration"

# Verify redirect URI construction
node -e "console.log(process.env.NEXTAUTH_URL + '/api/auth/callback/azure-ad')"
```

#### Database Connection
```bash
# Test database connectivity
mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1"

# Check connection pool
curl http://localhost:3000/template/api/db-health
```

---

**Next**: [First Deployment](first-deployment.md) | [Development Setup](../development/setup.md)