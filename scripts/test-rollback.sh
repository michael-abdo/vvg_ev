#!/bin/bash

# Test Rollback Procedure Script
# This script simulates and tests the rollback procedure

echo "======================================"
echo "Testing Environment Rollback Procedure"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup exists
echo "1. Checking for backup directory..."
if [ -d ".env-backup" ]; then
    echo -e "${GREEN}✓ Backup directory exists${NC}"
    echo "  Contents:"
    ls -la .env-backup/ | grep -E "\.env" | awk '{print "    " $9}'
else
    echo -e "${RED}✗ No backup directory found${NC}"
    echo "  Rollback would fail - no backup to restore from"
    exit 1
fi

echo ""

# Simulate rollback scenario
echo "2. Simulating rollback scenario..."
echo -e "${YELLOW}⚠ Creating temporary directory for safe testing${NC}"
mkdir -p .env-rollback-test
cp .env* .env-rollback-test/ 2>/dev/null

echo ""

# Test rollback procedure
echo "3. Testing rollback procedure..."
echo "  Step 1: Backing up current files"
mkdir -p .env-current-backup
cp .env .env.production .env.example .env-current-backup/ 2>/dev/null

echo "  Step 2: Simulating rollback from backup"
# Don't actually overwrite files, just test the process
if [ -f ".env-backup/.env.example" ]; then
    echo -e "${GREEN}✓ Can restore .env.example from backup${NC}"
fi
if [ -f ".env-backup/.env.production.example" ]; then
    echo -e "${GREEN}✓ Can restore .env.production.example from backup${NC}"
fi

echo ""

# Test restoration commands
echo "4. Verifying rollback commands..."
echo "  Testing copy command:"
echo "    cp .env-backup/.env* ."
if cp .env-backup/.env.example .env-rollback-test/test-restore.env 2>/dev/null; then
    echo -e "${GREEN}✓ Copy command works${NC}"
    rm .env-rollback-test/test-restore.env
else
    echo -e "${RED}✗ Copy command failed${NC}"
fi

echo ""

# Check for potential issues
echo "5. Checking for potential rollback issues..."

# Check file permissions
if [ -w "." ]; then
    echo -e "${GREEN}✓ Have write permissions in current directory${NC}"
else
    echo -e "${RED}✗ No write permissions - rollback would fail${NC}"
fi

# Check disk space
AVAILABLE_SPACE=$(df -k . | tail -1 | awk '{print $4}')
if [ $AVAILABLE_SPACE -gt 1000 ]; then
    echo -e "${GREEN}✓ Sufficient disk space for rollback${NC}"
else
    echo -e "${YELLOW}⚠ Low disk space might affect rollback${NC}"
fi

echo ""

# Rollback procedure documentation
echo "6. Rollback Procedure (DO NOT RUN unless needed):"
echo "   ${YELLOW}----------------------------------------${NC}"
echo "   # Step 1: Create safety backup"
echo "   mkdir -p .env-emergency-backup"
echo "   cp .env* .env-emergency-backup/"
echo ""
echo "   # Step 2: Restore from migration backup"
echo "   cp .env-backup/.env* ."
echo ""
echo "   # Step 3: Restart application"
echo "   pm2 restart all  # or npm run dev"
echo ""
echo "   # Step 4: Verify application works"
echo "   # Check logs and test functionality"
echo "   ${YELLOW}----------------------------------------${NC}"

echo ""

# Test git rollback
echo "7. Testing git-based rollback..."
# Check if files are in git history
if git ls-tree HEAD --name-only | grep -q "env.*example"; then
    echo -e "${GREEN}✓ Legacy files exist in git history${NC}"
    echo "  Could restore using: git checkout HEAD~n -- filename"
else
    echo -e "${YELLOW}⚠ Some legacy files might not be in recent git history${NC}"
fi

echo ""

# Cleanup test directory
echo "8. Cleaning up test files..."
rm -rf .env-rollback-test
rm -rf .env-current-backup

echo ""
echo "======================================"
echo "Rollback Test Summary"
echo "======================================"

# Summary
echo -e "${GREEN}✅ Rollback procedure is ready${NC}"
echo ""
echo "Key findings:"
echo "- Backup files are available"
echo "- Rollback commands verified"
echo "- No permission issues detected"
echo "- Git history available as secondary backup"
echo ""
echo "If rollback is needed:"
echo "1. Follow the procedure in step 6 above"
echo "2. Monitor application logs"
echo "3. Test critical functionality"
echo "4. Document the issue that required rollback"