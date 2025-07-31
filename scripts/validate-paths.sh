#!/bin/bash

# VVG Template Path Validation Script
# Validates that all environment paths and configurations are properly set

set -e

echo "==================================="
echo "VVG Template Path Validation"
echo "==================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track validation results
ERRORS=0
WARNINGS=0

# Function to check environment variable
check_env_var() {
    local var_name=$1
    local required=$2
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        if [ "$required" = "required" ]; then
            echo -e "${RED}✗ $var_name is not set (REQUIRED)${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ $var_name is not set (optional)${NC}"
            ((WARNINGS++))
        fi
    else
        echo -e "${GREEN}✓ $var_name = $var_value${NC}"
    fi
}

# Function to check file existence
check_file() {
    local file_path=$1
    local description=$2
    
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✓ $description exists: $file_path${NC}"
    else
        echo -e "${RED}✗ $description missing: $file_path${NC}"
        ((ERRORS++))
    fi
}

# Function to check directory existence
check_dir() {
    local dir_path=$1
    local description=$2
    
    if [ -d "$dir_path" ]; then
        echo -e "${GREEN}✓ $description exists: $dir_path${NC}"
    else
        echo -e "${YELLOW}⚠ $description missing: $dir_path (will be created)${NC}"
        ((WARNINGS++))
    fi
}

echo -e "\n${YELLOW}1. Checking Environment Variables${NC}"
echo "-----------------------------------"

# Check required environment variables
check_env_var "NODE_ENV" "optional"
check_env_var "ENVIRONMENT" "optional"
check_env_var "BASE_PATH" "optional"
check_env_var "NEXT_PUBLIC_BASE_PATH" "optional"
check_env_var "NEXTAUTH_URL" "required"
check_env_var "NEXTAUTH_SECRET" "required"

# Check database configuration
echo -e "\n${YELLOW}2. Checking Database Configuration${NC}"
echo "-----------------------------------"
check_env_var "DB_CREATE_ACCESS" "optional"
check_env_var "MYSQL_HOST" "optional"
check_env_var "MYSQL_PORT" "optional"
check_env_var "MYSQL_USER" "optional"
check_env_var "MYSQL_PASSWORD" "optional"
check_env_var "MYSQL_DATABASE" "optional"

# Check storage configuration
echo -e "\n${YELLOW}3. Checking Storage Configuration${NC}"
echo "-----------------------------------"
check_env_var "STORAGE_PROVIDER" "optional"
check_env_var "S3_ACCESS" "optional"
check_env_var "LOCAL_STORAGE_PATH" "optional"
check_env_var "LOCAL_UPLOAD_DIR" "optional"

# Check S3 configuration (if S3_ACCESS is true)
if [ "$S3_ACCESS" = "true" ]; then
    echo -e "\n${YELLOW}S3 Storage Configuration:${NC}"
    check_env_var "AWS_REGION" "required"
    check_env_var "AWS_ACCESS_KEY_ID" "required"
    check_env_var "AWS_SECRET_ACCESS_KEY" "required"
    check_env_var "S3_BUCKET_NAME" "required"
fi

# Check required files
echo -e "\n${YELLOW}4. Checking Required Files${NC}"
echo "-----------------------------------"
check_file ".env.local" "Environment configuration"
check_file "next.config.mjs" "Next.js configuration"
check_file "package.json" "Package configuration"
check_file "tsconfig.json" "TypeScript configuration"

# Check required directories
echo -e "\n${YELLOW}5. Checking Required Directories${NC}"
echo "-----------------------------------"
check_dir "app" "App directory"
check_dir "components" "Components directory"
check_dir "lib" "Library directory"
check_dir "public" "Public assets directory"

# Check optional directories
echo -e "\n${YELLOW}6. Checking Optional Directories${NC}"
echo "-----------------------------------"
check_dir "$LOCAL_UPLOAD_DIR" "Local upload directory"
check_dir "$LOCAL_STORAGE_PATH" "Local storage directory"
check_dir "logs" "Logs directory"

# Check BasePath configuration consistency
echo -e "\n${YELLOW}7. Checking BasePath Configuration${NC}"
echo "-----------------------------------"
if [ -n "$BASE_PATH" ] || [ -n "$NEXT_PUBLIC_BASE_PATH" ]; then
    if [ "$BASE_PATH" = "$NEXT_PUBLIC_BASE_PATH" ]; then
        echo -e "${GREEN}✓ BASE_PATH and NEXT_PUBLIC_BASE_PATH match${NC}"
    else
        echo -e "${RED}✗ BASE_PATH ($BASE_PATH) and NEXT_PUBLIC_BASE_PATH ($NEXT_PUBLIC_BASE_PATH) do not match${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${GREEN}✓ No BasePath configured (root deployment)${NC}"
fi

# Check NextAuth URL configuration
echo -e "\n${YELLOW}8. Checking NextAuth Configuration${NC}"
echo "-----------------------------------"
if [ -n "$NEXTAUTH_URL" ] && [ -n "$BASE_PATH" ]; then
    if [[ "$NEXTAUTH_URL" == *"$BASE_PATH"* ]]; then
        echo -e "${GREEN}✓ NEXTAUTH_URL includes BASE_PATH${NC}"
    else
        echo -e "${YELLOW}⚠ NEXTAUTH_URL does not include BASE_PATH (might be intentional)${NC}"
        ((WARNINGS++))
    fi
fi

# Summary
echo -e "\n${YELLOW}==================================="
echo "Validation Summary"
echo "===================================${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    exit 0
else
    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}✗ Found $ERRORS errors${NC}"
    fi
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ Found $WARNINGS warnings${NC}"
    fi
    
    if [ $ERRORS -gt 0 ]; then
        echo -e "\n${RED}Please fix the errors before proceeding.${NC}"
        exit 1
    else
        echo -e "\n${YELLOW}Warnings detected but validation passed.${NC}"
        exit 0
    fi
fi