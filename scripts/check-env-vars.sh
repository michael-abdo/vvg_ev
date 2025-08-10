#!/bin/bash
# Check and display all required environment variables for Docker deployment

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to check if variable is set
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    local is_secret=$2
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}✗ ${var_name}${NC} - Not set"
        return 1
    else
        if [ "$is_secret" = "true" ]; then
            # Mask secrets, showing only first and last 3 characters
            if [ ${#var_value} -gt 6 ]; then
                masked="${var_value:0:3}***${var_value: -3}"
            else
                masked="***"
            fi
            echo -e "${GREEN}✓ ${var_name}${NC} = ${masked}"
        else
            echo -e "${GREEN}✓ ${var_name}${NC} = ${var_value}"
        fi
        return 0
    fi
}

# Function to display section header
section() {
    echo -e "\n${BLUE}${BOLD}$1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Main script
echo -e "${BOLD}VVG Template Docker Deployment - Environment Variables Check${NC}"
echo -e "${YELLOW}Checking all required environment variables...${NC}\n"

# Track missing variables
MISSING_VARS=0

# Deployment Script Variables
section "🚀 DEPLOYMENT SCRIPT VARIABLES"
check_var "EC2_INSTANCE_ID" || ((MISSING_VARS++))
check_var "S3_DEPLOYMENT_BUCKET" || ((MISSING_VARS++))

# Load .env.production if it exists
if [ -f ".env.production" ]; then
    echo -e "\n${YELLOW}Loading .env.production...${NC}"
    set -a
    source .env.production
    set +a
else
    echo -e "\n${YELLOW}Warning: .env.production not found. Checking current environment only.${NC}"
fi

# Authentication
section "🔐 AUTHENTICATION - Azure AD"
check_var "AZURE_AD_CLIENT_ID" || ((MISSING_VARS++))
check_var "AZURE_AD_CLIENT_SECRET" true || ((MISSING_VARS++))
check_var "AZURE_AD_TENANT_ID" || ((MISSING_VARS++))
check_var "NEXTAUTH_URL" || ((MISSING_VARS++))
check_var "NEXTAUTH_SECRET" true || ((MISSING_VARS++))

# Application Configuration
section "⚙️ APPLICATION CONFIGURATION"
check_var "BASE_PATH" || echo -e "${YELLOW}ℹ BASE_PATH${NC} - Optional (defaults to empty)"
check_var "NODE_ENV" || ((MISSING_VARS++))
check_var "PORT" || ((MISSING_VARS++))
check_var "PROJECT_NAME" || ((MISSING_VARS++))
check_var "PROJECT_DISPLAY_NAME" || ((MISSING_VARS++))

# Database Configuration
section "💾 DATABASE CONFIGURATION"
check_var "DATABASE_URL" true || ((MISSING_VARS++))
check_var "MYSQL_HOST" || ((MISSING_VARS++))
check_var "MYSQL_PORT" || ((MISSING_VARS++))
check_var "MYSQL_USER" || ((MISSING_VARS++))
check_var "MYSQL_PASSWORD" true || ((MISSING_VARS++))
check_var "MYSQL_DATABASE" || ((MISSING_VARS++))

# Storage Configuration
section "📁 STORAGE CONFIGURATION"
check_var "STORAGE_PROVIDER" || ((MISSING_VARS++))
check_var "LOCAL_STORAGE_PATH" || ((MISSING_VARS++))

# S3 Configuration (if STORAGE_PROVIDER is s3)
if [ "$STORAGE_PROVIDER" = "s3" ] || [ "$S3_ACCESS" = "true" ]; then
    echo -e "\n${YELLOW}S3 Storage is enabled, checking S3 variables...${NC}"
    check_var "S3_ACCESS" || ((MISSING_VARS++))
    check_var "S3_BUCKET_NAME" || ((MISSING_VARS++))
    check_var "S3_FOLDER_PREFIX" || ((MISSING_VARS++))
    check_var "AWS_REGION" || ((MISSING_VARS++))
    check_var "AWS_ACCESS_KEY_ID" true || ((MISSING_VARS++))
    check_var "AWS_SECRET_ACCESS_KEY" true || ((MISSING_VARS++))
    check_var "S3_ENDPOINT" || echo -e "${YELLOW}ℹ S3_ENDPOINT${NC} - Optional (for custom S3)"
fi

# Email Configuration
section "📧 EMAIL CONFIGURATION (AWS SES)"
check_var "AWS_SES_SMTP_HOST" || ((MISSING_VARS++))
check_var "AWS_SES_SMTP_PORT" || ((MISSING_VARS++))
check_var "AWS_SES_SMTP_USERNAME" true || ((MISSING_VARS++))
check_var "AWS_SES_SMTP_PASSWORD" true || ((MISSING_VARS++))
check_var "SES_FROM_EMAIL" || ((MISSING_VARS++))
check_var "TEST_EMAIL_RECIPIENT" || echo -e "${YELLOW}ℹ TEST_EMAIL_RECIPIENT${NC} - Optional"
check_var "ENABLE_EMAIL_IN_DEV" || echo -e "${YELLOW}ℹ ENABLE_EMAIL_IN_DEV${NC} - Optional"

# AI Services
section "🤖 AI SERVICES"
check_var "OPENAI_API_KEY" true || ((MISSING_VARS++))
check_var "OPENAI_MODEL" || ((MISSING_VARS++))

# Application Features
section "🎛️ APPLICATION FEATURES"
check_var "FEATURE_DEV_BYPASS" || ((MISSING_VARS++))
check_var "ENABLE_OCR" || ((MISSING_VARS++))
check_var "ENABLE_AUTH_IN_DEV" || echo -e "${YELLOW}ℹ ENABLE_AUTH_IN_DEV${NC} - Optional"

# Rate Limiting
section "🚦 RATE LIMITING"
check_var "RATE_LIMIT_REQUESTS" || ((MISSING_VARS++))
check_var "RATE_LIMIT_WINDOW" || ((MISSING_VARS++))

# Security
section "🔒 SECURITY"
check_var "SESSION_SECRET" true || ((MISSING_VARS++))
check_var "JWT_SECRET" true || ((MISSING_VARS++))

# Logging Configuration
section "📝 LOGGING CONFIGURATION"
check_var "LOG_LEVEL" || echo -e "${YELLOW}ℹ LOG_LEVEL${NC} - Optional (defaults to info)"
check_var "STARTUP_LOGGING" || echo -e "${YELLOW}ℹ STARTUP_LOGGING${NC} - Optional"
check_var "PM2_LOG_DETAILED" || echo -e "${YELLOW}ℹ PM2_LOG_DETAILED${NC} - Optional"
check_var "DEBUG" || echo -e "${YELLOW}ℹ DEBUG${NC} - Optional"

# Optional Advanced Configuration
section "🔧 OPTIONAL ADVANCED CONFIGURATION"
check_var "REDIS_URL" || echo -e "${YELLOW}ℹ REDIS_URL${NC} - Optional"
check_var "CDN_URL" || echo -e "${YELLOW}ℹ CDN_URL${NC} - Optional"
check_var "SENTRY_DSN" || echo -e "${YELLOW}ℹ SENTRY_DSN${NC} - Optional"
check_var "NEW_RELIC_LICENSE_KEY" || echo -e "${YELLOW}ℹ NEW_RELIC_LICENSE_KEY${NC} - Optional"

# Summary
echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $MISSING_VARS -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✅ All required environment variables are set!${NC}"
    echo -e "${GREEN}You're ready to deploy.${NC}"
else
    echo -e "${RED}${BOLD}❌ Missing ${MISSING_VARS} required environment variable(s)${NC}"
    echo -e "${RED}Please set the missing variables before deploying.${NC}"
    
    echo -e "\n${YELLOW}Quick setup guide:${NC}"
    echo "1. Copy .env.example to .env.production"
    echo "2. Fill in all required values"
    echo "3. Export deployment variables:"
    echo "   export EC2_INSTANCE_ID=\"i-your-instance-id\""
    echo "   export S3_DEPLOYMENT_BUCKET=\"your-bucket\""
    exit 1
fi

# Additional checks
echo -e "\n${BLUE}${BOLD}📋 Additional Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if running in production
if [ "$NODE_ENV" = "production" ] && [ "$FEATURE_DEV_BYPASS" = "true" ]; then
    echo -e "${RED}⚠️  Warning: FEATURE_DEV_BYPASS is true in production!${NC}"
fi

# Check Azure AD redirect URI format
if [ -n "$NEXTAUTH_URL" ] && [ -n "$BASE_PATH" ]; then
    REDIRECT_URI="${NEXTAUTH_URL}${BASE_PATH}/api/auth/callback/azure-ad"
else
    REDIRECT_URI="${NEXTAUTH_URL}/api/auth/callback/azure-ad"
fi
echo -e "${BLUE}Azure AD Redirect URI:${NC} ${REDIRECT_URI}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production file not found${NC}"
fi

echo -e "\n${GREEN}Run './scripts/deploy-to-ec2.sh' to deploy to EC2${NC}"