# Docker Deployment Guide

This guide covers containerized deployment using Docker and Docker Compose.

## 🐳 Quick Start

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production
```bash
# Production deployment
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

## 📁 Docker Configuration Files

### Development: `docker-compose.yml`
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
      - ./uploads:/tmp/uploads
```

### Production: `docker-compose.production.yml`
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
      - .env.local
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deployment/nginx.vvg-template-enhanced.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### Application: `Dockerfile`
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Create uploads directory
RUN mkdir -p /tmp/uploads

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

## ⚙️ Environment Configuration

### Required Environment Files

Create these files before deployment:

#### `.env.local` (secrets - not committed)
```bash
# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-tenant-id

# Database
MYSQL_USER=your-db-user
MYSQL_PASSWORD=your-db-password

# OpenAI (optional)
OPENAI_API_KEY=your-openai-key

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

#### `.env.production` (production overrides - committed)
```bash
# Production URLs
NEXTAUTH_URL=https://your-domain.com/template
APP_URL=https://your-domain.com/template

# Database
MYSQL_HOST=your-production-db-host
MYSQL_PORT=3306
MYSQL_DATABASE=your-production-db

# Storage
STORAGE_PROVIDER=s3
S3_BUCKET_NAME=your-production-bucket
S3_REGION=us-west-2

# Logging
LOG_LEVEL=info
NODE_ENV=production
```

## 🚀 Deployment Steps

### 1. Prepare Environment
```bash
# Clone repository
git clone https://github.com/your-org/vvg_template.git
cd vvg_template

# Copy environment files
cp .env.example .env.local
# Edit .env.local with your secrets

# Ensure production config exists
cat .env.production
```

### 2. Database Setup
```bash
# Run database migrations
docker-compose exec app npm run db:migrate

# Seed initial data (optional)
docker-compose exec app npm run db:seed
```

### 3. Deploy Application
```bash
# Build and start services
docker-compose -f docker-compose.production.yml up -d --build

# Verify deployment
docker-compose -f docker-compose.production.yml ps
```

### 4. Configure NGINX (if using external NGINX)
```bash
# Copy configuration
sudo cp deployment/nginx.vvg-template-enhanced.conf /etc/nginx/sites-available/vvg-template

# Enable site
sudo ln -s /etc/nginx/sites-available/vvg-template /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## 🔍 Monitoring & Maintenance

### View Logs
```bash
# Application logs
docker-compose logs -f app

# NGINX logs
docker-compose logs -f nginx

# All services
docker-compose logs -f
```

### Health Checks
```bash
# Application health
curl http://localhost:3000/template/api/health

# Database health
curl http://localhost:3000/template/api/db-health

# Storage health
curl http://localhost:3000/template/api/storage-health
```

### Container Management
```bash
# Restart application only
docker-compose restart app

# Update application
docker-compose pull
docker-compose up -d --build

# Clean up old images
docker image prune -f
```

## 🛠️ Customization

### Custom Dockerfile
```dockerfile
# Multi-stage build for smaller production image
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### Docker Compose Override
```yaml
# docker-compose.override.yml for local development
version: '3.8'
services:
  app:
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - LOG_LEVEL=debug
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug port
```

## 🚨 Troubleshooting

### Container Won't Start
```bash
# Check container logs
docker-compose logs app

# Inspect container
docker-compose exec app sh

# Check environment variables
docker-compose exec app env | grep NODE_ENV
```

### Port Conflicts
```bash
# Check port usage
netstat -tlnp | grep :3000

# Use different ports
docker-compose -f docker-compose.yml -f docker-compose.ports.yml up -d
```

### Build Issues
```bash
# Clean build
docker-compose down --volumes --remove-orphans
docker-compose build --no-cache
docker-compose up -d
```

### Permission Issues
```bash
# Check file ownership
ls -la uploads/

# Fix permissions
sudo chown -R 1001:1001 uploads/
```

## 🔒 Security Considerations

### Container Security
- Use non-root user in containers
- Scan images for vulnerabilities
- Keep base images updated
- Limit container resources

### Network Security
- Use internal networks for container communication
- Expose only necessary ports
- Implement proper firewall rules
- Use secrets management for sensitive data

### Data Security
- Use named volumes for persistent data
- Regular backup of volumes
- Encrypt data at rest
- Secure database connections

## 📈 Performance Optimization

### Resource Limits
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Caching
```dockerfile
# Multi-stage build with caching
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
```

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} "
            cd /opt/vvg_template &&
            git pull &&
            docker-compose -f docker-compose.production.yml up -d --build
          "
```

---

**Next**: [AWS EC2 Deployment](aws-ec2.md) | [Troubleshooting](troubleshooting.md)