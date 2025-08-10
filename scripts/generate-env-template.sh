#!/bin/bash
# Generate a production environment template with all required variables

OUTPUT_FILE="${1:-.env.production.template}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Generating environment template: ${OUTPUT_FILE}${NC}"

cat > "$OUTPUT_FILE" << 'EOF'
# VVG Template - Production Environment Variables
# Generated on: $(date)
# 
# IMPORTANT: Fill in all required values before deployment
# Secrets should be stored securely and never committed to git

# ============================================================================
# DEPLOYMENT VARIABLES (export these in your shell)
# ============================================================================
# export EC2_INSTANCE_ID="i-your-instance-id"
# export S3_DEPLOYMENT_BUCKET="your-deployment-bucket"

# ============================================================================
# AUTHENTICATION - Azure AD Configuration
# ============================================================================
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# NextAuth.js Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=  # Generate with: openssl rand -base64 32

# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================
BASE_PATH=  # Leave empty for root domain, or set to /your-path
NODE_ENV=production
PORT=3000

# Project Configuration
PROJECT_NAME=vvg-template
PROJECT_DISPLAY_NAME="VVG Template"

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
DATABASE_URL=mysql://username:password@your-rds-endpoint.region.rds.amazonaws.com:3306/database_name
MYSQL_HOST=your-rds-endpoint.region.rds.amazonaws.com
MYSQL_PORT=3306
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=

# ============================================================================
# STORAGE CONFIGURATION
# ============================================================================
STORAGE_PROVIDER=s3  # Use 'local' for local storage, 's3' for AWS S3
LOCAL_STORAGE_PATH=./storage

# AWS S3 Configuration (required if STORAGE_PROVIDER=s3)
S3_ACCESS=true
S3_BUCKET_NAME=
S3_FOLDER_PREFIX=documents/
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_ENDPOINT=  # Leave empty for standard AWS S3

# ============================================================================
# EMAIL CONFIGURATION (AWS SES)
# ============================================================================
AWS_SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
AWS_SES_SMTP_PORT=587
AWS_SES_SMTP_USERNAME=
AWS_SES_SMTP_PASSWORD=
SES_FROM_EMAIL=noreply@your-domain.com
TEST_EMAIL_RECIPIENT=admin@your-domain.com
ENABLE_EMAIL_IN_DEV=false

# ============================================================================
# AI SERVICES
# ============================================================================
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4

# ============================================================================
# APPLICATION FEATURES
# ============================================================================
FEATURE_DEV_BYPASS=false  # MUST be false in production
ENABLE_OCR=true
ENABLE_AUTH_IN_DEV=false

# ============================================================================
# RATE LIMITING
# ============================================================================
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=1

# ============================================================================
# SECURITY
# ============================================================================
SESSION_SECRET=  # Generate a strong secret
JWT_SECRET=      # Generate a strong secret

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================
LOG_LEVEL=info
STARTUP_LOGGING=true
PM2_LOG_DETAILED=true
DEBUG=app:*,auth:*,db:*,api:*

# ============================================================================
# OPTIONAL ADVANCED CONFIGURATION
# ============================================================================
# REDIS_URL=redis://your-redis-endpoint:6379
# CDN_URL=https://cdn.your-domain.com
# SENTRY_DSN=
# NEW_RELIC_LICENSE_KEY=
EOF

# Update the date in the file
sed -i.bak "s/\$(date)/$(date)/" "$OUTPUT_FILE" && rm "${OUTPUT_FILE}.bak"

echo -e "${GREEN}✅ Template generated: ${OUTPUT_FILE}${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy this template: cp ${OUTPUT_FILE} .env.production"
echo "2. Fill in all empty values"
echo "3. Generate secrets:"
echo "   - NEXTAUTH_SECRET: openssl rand -base64 32"
echo "   - SESSION_SECRET: openssl rand -hex 32"
echo "   - JWT_SECRET: openssl rand -hex 32"
echo "4. Run ./scripts/check-env-vars.sh to validate"