# Team Training: New Environment Configuration

## 🎯 Training Objectives

By the end of this training, you will:
1. Understand the new 3-file environment structure
2. Know how to set up your local development environment
3. Understand security best practices
4. Be able to troubleshoot common issues

## 📚 Overview: What's Changed?

### Old Structure (9 files) ❌
```
.env.example
.env.local
.env.development
.env.staging.example
.env.production.example
.env.docker
.env.docker.example
.env.test
.env.test.staging
```

### New Structure (3 files) ✅
```
.env                # Base defaults (committed)
.env.production     # Production overrides (committed)
.env.local         # Secrets & local overrides (gitignored)
```

## 🚀 Quick Start Guide

### Step 1: Clone Repository
```bash
git clone [repository-url]
cd vvg-template
npm install
```

### Step 2: Set Up Environment
```bash
# Copy example to create your local environment
cp .env.example .env.local

# Generate a secure NextAuth secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
```

### Step 3: Edit .env.local
Open `.env.local` and add your secrets:
```env
# Your Azure AD credentials
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-secret
AZURE_AD_TENANT_ID=your-tenant

# Database credentials
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password

# Other API keys
OPENAI_API_KEY=your-key
```

### Step 4: Start Development
```bash
npm run dev
```

## 📖 Understanding the Files

### 1. `.env` - Base Configuration
**What it contains**: Non-sensitive defaults that work for everyone  
**Who manages it**: DevOps team  
**When to edit**: Rarely - only for new features  

Example:
```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
```

### 2. `.env.production` - Production Overrides
**What it contains**: Production-specific settings (no secrets!)  
**Who manages it**: DevOps team  
**When to edit**: When production config changes  

Example:
```env
NODE_ENV=production
LOG_LEVEL=error
APP_DOMAIN=legal.vtc.systems
```

### 3. `.env.local` - Your Secrets
**What it contains**: All passwords, API keys, secrets  
**Who manages it**: You!  
**When to edit**: During initial setup or credential updates  

⚠️ **NEVER COMMIT THIS FILE!**

## 🔒 Security Best Practices

### DO ✅
- Keep all secrets in `.env.local`
- Use strong, unique passwords
- Run `chmod 600 .env.local` to secure file permissions
- Use different credentials for each environment
- Rotate credentials regularly

### DON'T ❌
- Commit `.env.local` to git
- Share `.env.local` files via Slack/email
- Use production credentials locally
- Log environment variables
- Use example values as real credentials

## 🔍 How It Works

### Loading Order
```
1. .env (always loaded)
   ↓
2. .env.production (if NODE_ENV=production)
   ↓
3. .env.local (always loaded last - highest priority)
```

### Example
If `.env` has `PORT=3000` and `.env.local` has `PORT=3001`, the app uses `PORT=3001`.

## 🛠️ Common Scenarios

### Scenario 1: Adding a New Secret
```bash
# Edit .env.local
echo "NEW_API_KEY=your-secret-key" >> .env.local

# Restart your dev server
npm run dev
```

### Scenario 2: Testing Production Build Locally
```bash
# Build with production settings
NODE_ENV=production npm run build

# Start production server
npm start
```

### Scenario 3: Debugging Environment Issues
```bash
# Check what's loaded
node scripts/test-env-loading.js

# Validate security
./scripts/validate-env-security.sh
```

## ❓ Troubleshooting

### Problem: "Missing required environment variable"
**Solution**: Check if the variable is in `.env.local`

### Problem: "Cannot find module dotenv"
**Solution**: Run `npm install`

### Problem: Changes not taking effect
**Solution**: Restart your dev server - env vars load at startup

### Problem: Production build failing locally
**Solution**: Some features may require actual credentials - check `.env.local`

## 📝 Cheat Sheet

| Task | Command |
|------|---------|
| Set up local env | `cp .env.example .env.local` |
| Check env security | `./scripts/validate-env-security.sh` |
| Test env loading | `node scripts/test-env-loading.js` |
| Run migration | `./scripts/migrate-env.sh` |
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |

## 🚨 Getting Help

### If you're stuck:
1. Check the documentation: `docs/deployment/ENVIRONMENT_CONFIGURATION_GUIDE.md`
2. Run the validation scripts
3. Ask in #dev-help channel
4. Contact DevOps team for production issues

### Useful Resources:
- [Environment Configuration Guide](./ENVIRONMENT_CONFIGURATION_GUIDE.md)
- [Security Checklist](./ENVIRONMENT_SECURITY_CHECKLIST.md)
- [Migration Plan](./ENVIRONMENT_MIGRATION_PLAN.md)

## 🎓 Quiz: Test Your Knowledge

1. **Where do secrets go?**
   - Answer: Only in `.env.local`

2. **Which file has highest priority?**
   - Answer: `.env.local`

3. **Should you commit .env.local?**
   - Answer: NEVER!

4. **How do you secure .env.local?**
   - Answer: `chmod 600 .env.local`

5. **Where do non-sensitive defaults go?**
   - Answer: `.env`

## 🎉 You're Ready!

You now understand the new environment configuration. Remember:
- 🔐 Keep secrets in `.env.local`
- 📁 Use 3-file structure
- 🚫 Never commit secrets
- 🆘 Ask for help when needed

Happy coding! 🚀

---

**Training Version**: 1.0  
**Last Updated**: [Date]  
**Next Review**: [Date + 6 months]