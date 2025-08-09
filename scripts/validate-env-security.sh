#!/bin/bash

echo "🔐 Environment Security Validation"
echo "=================================="

# Check for .env.local in git
echo -n "Checking if .env.local is tracked in git... "
if git ls-files | grep -q "\.env\.local"; then
  echo "❌ CRITICAL: .env.local is tracked in git!"
  exit 1
else
  echo "✅ Properly gitignored"
fi

# Check for secrets in committed .env files
echo -n "Checking for secrets in .env files... "
FOUND_SECRETS=false

# Check .env file
if [ -f .env ]; then
  # Look for actual values (not placeholders) in sensitive fields
  if grep -E "(SECRET|PASSWORD|KEY)=.+" .env | grep -vE "(your-|generate-|example|=\s*$)" | grep -q "."; then
    echo ""
    echo "❌ WARNING: Possible secrets found in .env:"
    grep -E "(SECRET|PASSWORD|KEY)=.+" .env | grep -vE "(your-|generate-|example|=\s*$)"
    FOUND_SECRETS=true
  fi
fi

# Check .env.production file
if [ -f .env.production ]; then
  if grep -E "(SECRET|PASSWORD|KEY)=.+" .env.production | grep -vE "(your-|generate-|example|=\s*$)" | grep -q "."; then
    echo ""
    echo "❌ WARNING: Possible secrets found in .env.production:"
    grep -E "(SECRET|PASSWORD|KEY)=.+" .env.production | grep -vE "(your-|generate-|example|=\s*$)"
    FOUND_SECRETS=true
  fi
fi

if [ "$FOUND_SECRETS" = false ]; then
  echo "✅ No secrets in committed files"
fi

# Check .env.example only has placeholders
echo -n "Checking .env.example has only placeholders... "
if [ -f .env.example ]; then
  if grep -E "=[^=]*[a-zA-Z0-9]{10,}" .env.example | grep -vE "(your-|generate-|example|localhost|default)" | grep -q "."; then
    echo "❌ WARNING: .env.example might contain actual values"
  else
    echo "✅ Only placeholders"
  fi
fi

# Check file permissions (if on Unix)
if [ -f .env.local ]; then
  echo -n "Checking .env.local permissions... "
  if command -v stat >/dev/null 2>&1; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      perms=$(stat -f "%OLp" .env.local)
    else
      # Linux
      perms=$(stat -c "%a" .env.local)
    fi
    
    if [ "$perms" != "600" ]; then
      echo "⚠️  WARNING: permissions are $perms (should be 600)"
      echo "   Fix with: chmod 600 .env.local"
    else
      echo "✅ Secure (600)"
    fi
  else
    echo "⏭️  Skipped (stat command not available)"
  fi
fi

# Check for required files
echo ""
echo "Required files check:"
for file in .env .env.production .env.example; do
  if [ -f "$file" ]; then
    echo "  ✅ $file exists"
  else
    echo "  ❌ Missing $file"
  fi
done

# Check for legacy files that should be removed
echo ""
echo "Legacy files check (should be removed):"
LEGACY_FILES=".env.staging.example .env.production.example .env.docker .env.docker.example .env.docker.production"
for file in $LEGACY_FILES; do
  if [ -f "$file" ]; then
    echo "  ⚠️  $file should be removed"
  fi
done

# Summary
echo ""
echo "=================================="
echo "Security validation complete!"
echo ""
echo "Next steps:"
echo "1. Remove any legacy environment files"
echo "2. Ensure .env.local has proper permissions (chmod 600)"
echo "3. Verify all secrets are in .env.local only"
echo "4. Never commit .env.local to version control"