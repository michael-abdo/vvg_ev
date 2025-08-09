#!/bin/bash

# Environment Migration Script
# Helps migrate from old 9-file structure to new 3-file structure

echo "======================================"
echo "Environment Configuration Migration"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backup existing files
echo "📁 Creating backup of existing environment files..."
mkdir -p .env-backup
cp .env* .env-backup/ 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup created in .env-backup/${NC}"
    echo "  Files backed up:"
    ls -la .env-backup/*.env* 2>/dev/null | awk '{print "    " $9}' | grep -v "^    $"
else
    echo -e "${YELLOW}⚠ No environment files to backup${NC}"
fi

echo ""

# Check if .env.local exists
echo "🔍 Checking .env.local..."
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠ .env.local not found${NC}"
    echo "  Creating .env.local from .env.example..."
    cp .env.example .env.local
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Created .env.local - Please add your secrets${NC}"
    else
        echo -e "${RED}✗ Failed to create .env.local${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

echo ""

# Verify base files exist
echo "🔍 Verifying required files..."

# Check .env
if [ -f .env ]; then
    echo -e "${GREEN}✓ Base .env file exists${NC}"
else
    echo -e "${RED}✗ Missing .env file${NC}"
    echo "  This file should contain non-sensitive defaults"
    EXIT_CODE=1
fi

# Check .env.production
if [ -f .env.production ]; then
    echo -e "${GREEN}✓ Production .env.production file exists${NC}"
else
    echo -e "${RED}✗ Missing .env.production file${NC}"
    echo "  This file should contain production overrides (non-sensitive)"
    EXIT_CODE=1
fi

# Check .env.example
if [ -f .env.example ]; then
    echo -e "${GREEN}✓ Template .env.example file exists${NC}"
else
    echo -e "${RED}✗ Missing .env.example file${NC}"
    echo "  This file should show the template for .env.local"
    EXIT_CODE=1
fi

echo ""

# Check for legacy files
echo "🔍 Checking for legacy files to remove..."
LEGACY_FILES=".env.staging.example .env.production.example .env.docker .env.docker.example .env.docker.production .env.test.staging"
FOUND_LEGACY=false

for file in $LEGACY_FILES; do
    if [ -f "$file" ]; then
        echo -e "${YELLOW}⚠ Found legacy file: $file${NC}"
        FOUND_LEGACY=true
    fi
done

if [ "$FOUND_LEGACY" = false ]; then
    echo -e "${GREEN}✓ No legacy files found${NC}"
fi

echo ""

# Security check
echo "🔒 Running security checks..."

# Check if .env.local is in git
if git ls-files --error-unmatch .env.local 2>/dev/null; then
    echo -e "${RED}✗ CRITICAL: .env.local is tracked by git!${NC}"
    echo "  Run: git rm --cached .env.local"
    EXIT_CODE=1
else
    echo -e "${GREEN}✓ .env.local is not tracked by git${NC}"
fi

# Check for secrets in committed files
echo -n "  Checking for secrets in .env and .env.production... "
if grep -E "(SECRET|PASSWORD|KEY)=.+" .env .env.production 2>/dev/null | grep -vE "(your-|generate-|example|=\s*$)" | grep -q "."; then
    echo -e "${RED}✗ Found potential secrets in committed files${NC}"
    EXIT_CODE=1
else
    echo -e "${GREEN}✓ No secrets found${NC}"
fi

echo ""

# Summary
echo "======================================"
echo "Migration Summary"
echo "======================================"

if [ -z "$EXIT_CODE" ]; then
    echo -e "${GREEN}✅ Environment configuration is ready!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Add your secrets to .env.local"
    echo "2. Test with: npm run dev"
    echo "3. Build with: npm run build"
    echo "4. Validate with: ./scripts/validate-env-security.sh"
    if [ "$FOUND_LEGACY" = true ]; then
        echo "5. Remove legacy files after testing"
    fi
else
    echo -e "${RED}❌ Issues found - please fix before proceeding${NC}"
    exit 1
fi

echo ""
echo "For more information, see:"
echo "  docs/deployment/ENVIRONMENT_CONFIGURATION_GUIDE.md"
echo "  docs/deployment/ENVIRONMENT_MIGRATION_PLAN.md"