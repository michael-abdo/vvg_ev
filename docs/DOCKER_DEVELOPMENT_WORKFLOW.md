# 🐳 Docker Development & Production Deployment Workflow

## Overview

This guide outlines the complete Docker-based development and deployment workflow for the VVG Template system, from localhost:3000 development to live production at legal.vtc.systems/app. Follow these patterns for consistent, professional development practices.

---

## 🔄 **Daily Development Workflow**

### **Morning Setup (5 minutes)**
```bash
# 1. Start your development day
git checkout docker
git pull origin docker

# 2. Start Docker environment with one command
./docker-startup.sh
# Or manually: docker-compose up -d

# 3. Your app is now running at http://localhost:3000
# ✅ Ready for development!
```

### **Active Development Loop**
```bash
# Code changes are automatically reflected because of volume mounts:
# - Edit files in VS Code/your IDE
# - Changes appear instantly in the running container
# - No need to rebuild for most code changes

# View live logs while developing:
docker-compose logs -f

# If you need to restart after major changes:
docker-compose restart
```

### **Testing & Validation**
```bash
# Run tests inside the container:
docker-compose exec app npm test

# Run specific commands:
docker-compose exec app npm run lint
docker-compose exec app npm run type-check

# Access container shell for debugging:
docker-compose exec app /bin/sh
```

### **End of Day Commit**
```bash
# Commit your changes:
git add -A
git commit -m "feat: add new document processing feature"
git push origin docker

# Stop containers to save resources:
docker-compose down
```

---

## 🚀 **Deployment Workflow**

### **Development to Staging**
```bash
# 1. Prepare for staging deployment
git checkout docker
git pull origin docker

# 2. Build production image
docker-compose -f docker-compose.production.yml build

# 3. Test production build locally
docker-compose -f docker-compose.production.yml up -d

# 4. Verify everything works at http://localhost:3000

# 5. Push to staging server (example with EC2)
docker save vvg-template:latest | gzip > vvg-template.tar.gz
scp vvg-template.tar.gz user@staging-server:~/
```

### **Staging Server Deployment**
```bash
# On staging server:
cd ~/
gunzip -c vvg-template.tar.gz | docker load

# Create production environment file:
cp .env.docker.production.example .env.docker.production
# Edit with real credentials, database URLs, etc.

# Deploy to staging:
docker-compose -f docker-compose.production.yml up -d

# Monitor deployment:
docker-compose logs -f
```

### **Production Deployment**
```bash
# 1. After staging approval, tag production release:
git tag v1.0.0
git push origin v1.0.0

# 2. Deploy to production server (same process as staging)
# 3. Use proper production secrets and database
# 4. Monitor with health checks and logging
```

---

## 📋 **Typical Development Day Example**

### **9:00 AM - Start Development**
```bash
# Start Docker environment
./docker-startup.sh
# ✅ App running at localhost:3000

# Check current work status
git status
git log --oneline -5
```

### **9:15 AM - 12:00 PM - Feature Development**
```bash
# Example: Adding PDF preview functionality
# Work in VS Code - edit these files:
# - app/documents/preview/page.tsx
# - lib/services/pdf-service.ts  
# - components/pdf-viewer.tsx

# Changes are live immediately due to Docker volume mounting
# Test at http://localhost:3000/documents/preview

# Monitor logs for any issues:
docker-compose logs -f app
```

### **12:00 PM - Test & Commit**
```bash
# Run comprehensive tests
docker-compose exec app npm test
docker-compose exec app npm run lint
docker-compose exec app npm run type-check

# Check logs for any errors
docker-compose logs --tail=50

# Commit your morning's work
git add -A
git commit -m "feat: add PDF preview functionality"
```

### **1:00 PM - 5:00 PM - Continue Development**
```bash
# Afternoon development session
# Example: Adding bulk document upload
# Edit relevant files, test immediately

# Changes continue to be live-reloaded
# No need to rebuild Docker unless you change:
# - package.json (new dependencies)
# - Dockerfile (container changes)
# - Environment variables requiring restart
```

### **5:00 PM - End of Day**
```bash
# Final commit and cleanup
git add -A
git commit -m "feat: implement bulk document upload with progress tracking"
git push origin docker

# Stop Docker to save system resources
docker-compose down

# ✅ Development day complete!
```

---

## 🔧 **Essential Commands Reference**

### **Daily Development Commands**
```bash
# Start development environment
./docker-startup.sh

# View application logs  
docker-compose logs -f

# Restart services after major changes
docker-compose restart

# Stop all services
docker-compose down

# Rebuild after package.json changes
docker-compose build && docker-compose up -d
```

### **Development Debugging**
```bash
# Access container shell for debugging
docker-compose exec app /bin/sh

# Check all container status
docker-compose ps

# View system resource usage
docker stats

# Clean up disk space
docker system prune -f
docker volume prune -f
```

### **Production Deployment Commands**
```bash
# Build production-ready image
docker-compose -f docker-compose.production.yml build

# Deploy to production environment
docker-compose -f docker-compose.production.yml up -d

# Monitor production logs
docker-compose -f docker-compose.production.yml logs -f

# Access production container (for troubleshooting)
docker-compose -f docker-compose.production.yml exec app /bin/sh
```

---

## 📁 **Project File Structure**

Your daily work will primarily focus on these directories:

```
vvg-template/
├── 🎯 ACTIVE DEVELOPMENT
│   ├── app/              # Next.js pages and API routes
│   │   ├── api/          # Backend API endpoints
│   │   ├── documents/    # Document management pages
│   │   ├── compare/      # Document comparison interface
│   │   └── upload/       # File upload interface
│   ├── components/       # Reusable React components
│   │   ├── ui/           # Base UI components (shadcn/ui)
│   │   └── upload-template.tsx # Document upload component
│   └── lib/              # Core business logic
│       ├── services/     # Document, OpenAI, email services
│       ├── storage/      # File storage abstraction
│       └── utils/        # Shared utilities
│
├── 🐳 DOCKER CONFIGURATION
│   ├── Dockerfile        # Container build instructions
│   ├── docker-compose.yml # Development setup
│   ├── docker-compose.production.yml # Production setup
│   ├── .env.docker.local # Development environment
│   └── docker-startup.sh # Quick start script
│
├── 📚 DOCUMENTATION
│   └── docs/
│       ├── DOCKER_DEVELOPMENT_WORKFLOW.md # This guide
│       ├── DOCKER_SETUP_GUIDE.md # Setup instructions
│       └── deployment/   # Deployment guides
│
└── 🗃️ DATA & STORAGE
    └── storage/          # Local file storage (Docker volume)
```

---

## ⚡ **Key Benefits of This Workflow**

### **🚀 Development Speed**
- **Instant feedback**: Live reload with volume mounts
- **One-command setup**: `./docker-startup.sh` gets you running
- **No local dependencies**: Everything runs in containers
- **Consistent environment**: Same setup for all developers

### **🔒 Production Reliability**
- **Environment parity**: Development mirrors production
- **Isolated dependencies**: No conflicts with local system
- **Reproducible builds**: Same Docker images from dev to production
- **Easy rollbacks**: Docker image versioning

### **👥 Team Collaboration**
- **Quick onboarding**: New developers run one script
- **Consistent setup**: Everyone uses identical environment
- **Easy sharing**: Docker images work anywhere
- **Documentation**: Everything is documented and scripted

---

## 🛠️ **Advanced Workflows**

### **Feature Branch Development**
```bash
# Start new feature
git checkout -b feature/advanced-search
git push -u origin feature/advanced-search

# Develop in Docker
./docker-startup.sh
# Make changes, test, commit

# Deploy feature branch to staging
docker-compose -f docker-compose.production.yml build
# Deploy to staging environment for testing
```

### **Database Schema Changes**
```bash
# 1. Create migration file
touch database/migrations/002_add_search_table.sql

# 2. Test migration in Docker
docker-compose exec app npm run db:migrate

# 3. Verify in development
# Test your schema changes

# 4. Commit migration
git add database/migrations/
git commit -m "feat: add search table migration"
```

### **Environment Customization**
```bash
# For different environments, create:
# .env.docker.staging    # Staging configuration
# .env.docker.production # Production configuration

# Use specific environment:
docker-compose --env-file .env.docker.staging up -d
```

---

## 🎯 **Development Best Practices**

### **Code Changes**
1. **Small commits**: Commit working features frequently
2. **Test immediately**: Use Docker logs to verify changes
3. **Follow DRY**: Reuse existing utilities and patterns
4. **Document changes**: Update relevant docs

### **Docker Management**  
1. **Stop when not coding**: `docker-compose down` saves resources
2. **Clean up regularly**: `docker system prune -f` frees space
3. **Monitor logs**: `docker-compose logs -f` during development
4. **Use health checks**: Built-in monitoring prevents issues

### **Deployment Safety**
1. **Test locally first**: Always test production build locally
2. **Staging validation**: Deploy to staging before production
3. **Monitor closely**: Watch logs and metrics after deployment
4. **Have rollback ready**: Keep previous Docker images available

---

## 🚨 **Troubleshooting Common Issues**

### **Docker Won't Start**
```bash
# Check if Docker Desktop is running
docker info

# If not running:
# - Open Docker Desktop application
# - Wait for green status indicator
# - Try again
```

### **Port Conflicts**
```bash
# If port 3000 is in use:
# Option 1: Kill process using port
lsof -ti:3000 | xargs kill -9

# Option 2: Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### **Build Failures**
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### **Code Changes Not Appearing**
```bash
# Restart the container
docker-compose restart

# Or check volume mounts:
docker-compose exec app ls -la /app
```

---

## 📖 **Quick Reference**

| Task | Command | Notes |
|------|---------|-------|
| Start development | `./docker-startup.sh` | One-command setup |
| View logs | `docker-compose logs -f` | Real-time monitoring |
| Run tests | `docker-compose exec app npm test` | Inside container |
| Access shell | `docker-compose exec app /bin/sh` | For debugging |
| Stop environment | `docker-compose down` | Saves resources |
| Production build | `docker-compose -f docker-compose.production.yml build` | Production image |
| Clean up | `docker system prune -f` | Free disk space |

---

## 🎉 **Success Metrics**

You'll know the workflow is working when:

✅ **Development is fast**: Changes appear within seconds  
✅ **Setup is simple**: New developers productive in under 10 minutes  
✅ **Deployments are reliable**: Same image from dev to production  
✅ **Debugging is easy**: Clear logs and container access  
✅ **Team is aligned**: Everyone uses identical environment  

---

## 🌐 **Production Deployment Flow**

### **From localhost:3000 to Production URL**

Your application journey from development to live production:

```
Development (Your Laptop)     Production (EC2 Server)     Public Access
localhost:3000          →     localhost:3000        →     legal.vtc.systems/app
[Docker Container]            [Docker Container]           [NGINX Proxy]
```

### **Complete Journey Map**

| Stage | URL | Environment | Purpose |
|-------|-----|-------------|----------|
| **Local Dev** | `http://localhost:3000` | Your laptop | Active development |
| **Local Prod Test** | `http://localhost:3000` | Your laptop (prod build) | Pre-deployment validation |
| **EC2 Internal** | `http://localhost:3000` | EC2 server | Production app running |
| **Public Access** | `https://legal.vtc.systems/app` | Internet | End users |

### **Step-by-Step Production Deployment**

#### **1. Development (Your Laptop)**
```bash
# Start development
./docker-startup.sh
# Edit code, test at localhost:3000
# Commit changes
git commit -m "feat: new feature"
git push origin docker
```

#### **2. Production Build & Test (Your Laptop)**
```bash
# Test production build locally
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
# Verify at localhost:3000 with production settings
```

#### **3. Deploy to EC2 Server**
```bash
# SSH to EC2
aws ssm start-session --target YOUR-INSTANCE-ID

# On EC2 server:
cd /home/ubuntu/vvg-app
git pull origin docker
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
```

#### **4. Live on Internet**
```bash
# App immediately available at:
https://legal.vtc.systems/app
```

### **NGINX Reverse Proxy Magic**

**How users access your app:**
```
User types: https://legal.vtc.systems/app
     ↓
NGINX receives request on EC2 server
     ↓
NGINX proxies to localhost:3000 (your Next.js app)
     ↓
Your app responds
     ↓
NGINX sends response back to user
```

### **Environment Differences**

| Component | Development | Production |
|-----------|-------------|------------|
| **Domain** | `localhost:3000` | `legal.vtc.systems/app` |
| **Storage** | Local `./storage/` | AWS S3 |
| **Database** | Local MySQL/In-memory | AWS RDS MySQL |
| **Auth** | Dev bypass enabled | Azure AD required |
| **SSL** | None (HTTP) | Let's Encrypt (HTTPS) |
| **Proxy** | Direct access | NGINX reverse proxy |

### **Why This Architecture Works**
1. **Same Docker image** runs everywhere (consistency)
2. **Environment variables** change behavior per environment
3. **NGINX handles** SSL, routing, and load balancing
4. **Next.js app** doesn't know it's behind a proxy
5. **Subdirectory routing** (`/app`) works seamlessly

### **Key Benefits**
✅ **Simple Development**: Always work at localhost:3000  
✅ **Consistent Builds**: Same Docker image from dev to prod  
✅ **Easy Scaling**: Add more EC2 instances behind load balancer  
✅ **Professional URLs**: Clean public URLs like legal.vtc.systems/app  
✅ **Zero Downtime**: Deploy new containers alongside old ones  

This Docker workflow transforms development from setup-heavy to code-focused, letting you concentrate on building features instead of managing environments while providing a clear path to professional production deployment!