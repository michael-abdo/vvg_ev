# Environment Security Checklist

## Pre-Deployment Security Audit

### 🔐 File Security

- [ ] **`.env.local` is gitignored**
  ```bash
  grep -E "^\.env\.local$" .gitignore
  ```

- [ ] **No `.env.local` in repository**
  ```bash
  git ls-files | grep -E "\.env\.local"  # Should return nothing
  ```

- [ ] **No secrets in committed files**
  ```bash
  # Check for common secret patterns
  grep -r "sk-[a-zA-Z0-9]" .env .env.production
  grep -r "password.*=.*[a-zA-Z0-9]" .env .env.production
  grep -r "secret.*=.*[a-zA-Z0-9]" .env .env.production
  ```

### 🔑 Secret Management

- [ ] **Unique secrets per environment**
  - Development uses different API keys than production
  - Staging has separate database credentials
  - Each environment has its own `NEXTAUTH_SECRET`

- [ ] **Strong secret generation**
  ```bash
  # Generate NEXTAUTH_SECRET
  openssl rand -base64 32
  
  # Generate API tokens
  openssl rand -hex 32
  ```

- [ ] **No default/example secrets in production**
  - No "your-secret-here" values
  - No "test" or "demo" passwords
  - No placeholder API keys

### 📁 File Permissions

- [ ] **Secure `.env.local` permissions**
  ```bash
  # On production server
  chmod 600 .env.local
  ls -la .env.local  # Should show -rw-------
  ```

- [ ] **Ownership verification**
  ```bash
  # Files owned by application user
  chown appuser:appuser .env*
  ```

### 🏗️ Build Security

- [ ] **Environment variables not exposed in build**
  ```bash
  # Check build output for secrets
  npm run build 2>&1 | grep -i "secret\|password\|key"
  ```

- [ ] **Client-side bundle inspection**
  ```bash
  # Check for leaked secrets in client bundle
  grep -r "NEXTAUTH_SECRET" .next/static
  grep -r "DATABASE" .next/static
  ```

### 🔍 Code Security

- [ ] **No console.log of sensitive variables**
  ```bash
  # Search for environment variable logging
  grep -r "console.log.*process.env" --include="*.ts" --include="*.js"
  ```

- [ ] **No hardcoded secrets**
  ```bash
  # Check for hardcoded credentials
  grep -r "password.*=.*['\"]" --include="*.ts" --include="*.js"
  ```

### 🚀 Deployment Security

- [ ] **CI/CD doesn't expose secrets**
  - GitHub Actions uses secrets, not plain text
  - Build logs don't show environment values
  - Deployment scripts don't echo secrets

- [ ] **Secure secret injection**
  ```yaml
  # Good - GitHub Actions example
  env:
    NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
  
  # Bad - Never do this
  run: echo "NEXTAUTH_SECRET=abc123" >> .env.local
  ```

### 🔄 Rotation & Maintenance

- [ ] **Secret rotation schedule**
  - [ ] API keys rotated quarterly
  - [ ] Database passwords changed semi-annually
  - [ ] OAuth secrets refreshed annually

- [ ] **Audit trail**
  - [ ] Document when secrets were last changed
  - [ ] Track who has access to production secrets
  - [ ] Log secret rotation events

### 🛡️ Runtime Security

- [ ] **Environment validation on startup**
  ```javascript
  // Add to app initialization
  const required = ['NEXTAUTH_SECRET', 'DATABASE_URL'];
  required.forEach(key => {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  });
  ```

- [ ] **No sensitive data in error messages**
  - Error pages don't reveal configuration
  - API errors don't expose internal details
  - Logs sanitize sensitive information

### 📊 Monitoring

- [ ] **Alert on suspicious access**
  - Monitor failed authentication attempts
  - Alert on configuration file access
  - Track environment variable reads

- [ ] **Regular security scans**
  ```bash
  # Use tools like git-secrets
  git secrets --scan
  
  # Or truffleHog for deep scanning
  trufflehog filesystem ./
  ```

## Quick Validation Script

Create `scripts/validate-env-security.sh`:

```bash
#!/bin/bash

echo "🔐 Environment Security Validation"
echo "=================================="

# Check for .env.local in git
if git ls-files | grep -q "\.env\.local"; then
  echo "❌ CRITICAL: .env.local is tracked in git!"
  exit 1
else
  echo "✅ .env.local is properly gitignored"
fi

# Check for secrets in committed files
if grep -r "secret.*=.*[a-zA-Z0-9]" .env .env.production 2>/dev/null | grep -v "your-\|generate-\|example"; then
  echo "❌ WARNING: Possible secrets in committed files"
else
  echo "✅ No obvious secrets in committed files"
fi

# Check file permissions (if on Unix)
if [ -f .env.local ]; then
  perms=$(stat -c %a .env.local 2>/dev/null || stat -f %A .env.local)
  if [ "$perms" != "600" ]; then
    echo "⚠️  WARNING: .env.local permissions are $perms (should be 600)"
  else
    echo "✅ .env.local has secure permissions"
  fi
fi

# Check for required files
for file in .env .env.production .env.example; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ Missing $file"
  fi
done

echo ""
echo "Security validation complete!"
```

## Emergency Response

### If Secrets Are Exposed:

1. **Immediately rotate affected credentials**
2. **Revoke compromised API keys**
3. **Reset database passwords**
4. **Generate new NEXTAUTH_SECRET**
5. **Audit access logs for suspicious activity**
6. **Notify security team**
7. **Document incident**

### Prevention:

1. **Use pre-commit hooks**:
   ```bash
   # .git/hooks/pre-commit
   #!/bin/bash
   # Prevent committing .env.local
   if git diff --cached --name-only | grep -q "\.env\.local"; then
     echo "ERROR: Attempting to commit .env.local"
     exit 1
   fi
   ```

2. **Regular security training**
3. **Automated secret scanning**
4. **Principle of least privilege**

## Compliance Notes

- Store audit logs for environment access
- Document secret rotation procedures
- Maintain access control lists
- Regular security assessments
- Incident response procedures

Remember: **When in doubt, regenerate the secret!**