# Staging & Production Deployment Architecture Guide

**Enterprise-Grade Zero-Downtime Deployment System**  
*Version 2024 - For Same-Server Staging/Production Environments*

## 🎯 Executive Summary

This guide implements a production-ready deployment architecture that enables:
- **Zero-downtime deployments** using PM2 cluster mode
- **Atomic deployments** via symlink switching
- **One-step promotion** from staging to production
- **Instant rollbacks** to previous versions
- **Complete isolation** between environments

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Directory Structure](#directory-structure)
- [PM2 Configuration](#pm2-configuration)
- [Nginx Reverse Proxy](#nginx-reverse-proxy)
- [Deployment Scripts](#deployment-scripts)
- [Setup Instructions](#setup-instructions)
- [Usage Workflows](#usage-workflows)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

### Core Components

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│     Nginx       │────│       PM2        │────│   Node.js Apps     │
│  (Port 80/443)  │    │  Process Manager │    │ Staging: Port 4000 │
│                 │    │                  │    │    Prod: Port 3000 │
└─────────────────┘    └──────────────────┘    └────────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│  SSL Termination│    │   Zero Downtime  │    │   Cluster Mode     │
│  Load Balancing │    │   Deployments    │    │   Error Recovery   │
│  Static Files   │    │   Process Health │    │   Auto Restart     │
└─────────────────┘    └──────────────────┘    └────────────────────┘
```

### Deployment Flow

```
Developer → Git Push → Staging Deploy → Test → One-Click Promote → Production
     │           │            │          │           │               │
     ▼           ▼            ▼          ▼           ▼               ▼
   Code      Automated    Symlink    Manual      Symlink        Live
  Changes     Deploy      Switch      QA         Switch         Site
```

## 📁 Directory Structure

### Complete File System Layout

```
/var/www/
├── {PROJECT_NAME}/                           # Production Environment
│   ├── releases/                           # All production releases
│   │   ├── 20240810-001/                  # Previous release (rollback ready)
│   │   ├── 20240810-002/                  # Current release
│   │   └── 20240810-003/                  # Latest deployment
│   ├── shared/                             # Persistent shared resources
│   │   ├── logs/                          # Application logs
│   │   │   ├── combined.log
│   │   │   ├── error.log
│   │   │   └── out.log
│   │   ├── uploads/                       # User uploaded files
│   │   ├── storage/                       # Persistent storage
│   │   └── .env.production                # Production config
│   └── current → releases/20240810-003/   # Symlink to active release
│
├── {PROJECT_NAME}-staging/                   # Staging Environment  
│   ├── releases/                           # All staging releases
│   │   ├── 20240810-dev-001/              # Previous staging
│   │   └── 20240810-dev-002/              # Current staging
│   ├── shared/                             # Staging shared resources
│   │   ├── logs/
│   │   ├── uploads/
│   │   ├── storage/
│   │   └── .env.staging                   # Staging config
│   └── current → releases/20240810-dev-002/
│
└── deployment/                             # Deployment automation
    ├── scripts/
    │   ├── deploy-staging.sh              # Deploy to staging
    │   ├── promote-to-production.sh       # Staging → Production
    │   ├── rollback-production.sh         # Emergency rollback
    │   └── rollback-staging.sh            # Staging rollback
    ├── configs/
    │   ├── ecosystem.config.js            # PM2 configuration
    │   └── nginx-sites.conf               # Nginx configuration
    └── logs/
        └── deployment.log                 # Deployment history
```

### Key Benefits of This Structure

✅ **Atomic Deployments**: Symlinks enable instant, zero-downtime switches  
✅ **Easy Rollbacks**: Previous releases remain ready for instant activation  
✅ **Shared Resources**: Uploads and logs persist across deployments  
✅ **Environment Isolation**: Complete separation between staging and production  
✅ **Version History**: Full audit trail of all deployments  

## ⚙️ PM2 Configuration

### Complete Ecosystem Configuration

```javascript
// /var/www/deployment/configs/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: '{PROJECT_NAME}-prod',
      script: '/var/www/{PROJECT_NAME}/current/server.js',
      instances: 4,                        // Scale across CPU cores
      exec_mode: 'cluster',                // Enable cluster mode
      port: 3000,                          // Internal port
      watch: false,                        // Disable file watching in prod
      max_memory_restart: '1G',            // Auto-restart on memory limit
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXTAUTH_URL: 'https://department.vtc.systems/{PROJECT_NAME}'
      },
      // Comprehensive Logging
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      log_file: '/var/www/{PROJECT_NAME}/shared/logs/combined.log',
      error_file: '/var/www/{PROJECT_NAME}/shared/logs/error.log',  
      out_file: '/var/www/{PROJECT_NAME}/shared/logs/out.log',
      
      // Log Rotation
      rotate_logs: true,
      max_log_file_size: '10M',
      retain_logs: 5,
      
      // Health Monitoring
      min_uptime: '10s',
      max_restarts: 3,
      
      // Graceful Shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000
    },
    {
      name: '{PROJECT_NAME}-staging',
      script: '/var/www/{PROJECT_NAME}-staging/current/server.js',
      instances: 2,                        // Fewer instances for staging
      exec_mode: 'cluster',
      port: 4000,                          // Different port from production
      watch: true,                         // Enable file watching for development
      ignore_watch: ['logs', 'uploads'],   // Ignore non-critical files
      max_memory_restart: '512M',          // Lower memory limit for staging
      env: {
        NODE_ENV: 'staging', 
        PORT: 4000,
        NEXTAUTH_URL: 'https://department.vtc.systems/{PROJECT_NAME}-staging'
      },
      // Staging Logging
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      log_file: '/var/www/{PROJECT_NAME}-staging/shared/logs/combined.log',
      error_file: '/var/www/{PROJECT_NAME}-staging/shared/logs/error.log',
      out_file: '/var/www/{PROJECT_NAME}-staging/shared/logs/out.log',
      
      // Staging Log Rotation
      rotate_logs: true,
      max_log_file_size: '5M',
      retain_logs: 3,
      
      // Development-friendly settings
      min_uptime: '5s',
      max_restarts: 10,    // More lenient restart policy
      
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 3000
    }
  ]
};
```

### PM2 Process Management Commands

```bash
# Start all applications
pm2 start ecosystem.config.js

# Zero-downtime reload (production)
pm2 reload {PROJECT_NAME}-prod

# Restart specific application
pm2 restart {PROJECT_NAME}-staging

# View real-time logs
pm2 logs

# Monitor process health
pm2 monit

# Process status
pm2 status

# Save PM2 configuration
pm2 save

# Setup auto-startup on reboot
pm2 startup
```

## 🌐 Nginx Reverse Proxy

### Complete Nginx Configuration

```nginx
# /etc/nginx/sites-available/department.vtc.systems
server {
    # HTTP to HTTPS redirect
    listen 80;
    server_name department.vtc.systems;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name department.vtc.systems;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/department.vtc.systems/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/department.vtc.systems/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Production Application
    location /{PROJECT_NAME}/ {
        # Remove trailing slash from location and add to proxy_pass
        proxy_pass http://localhost:3000/;
        
        # WebSocket Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        
        # Proxy Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer Settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # Staging Application  
    location /{PROJECT_NAME}-staging/ {
        proxy_pass http://localhost:4000/;
        
        # WebSocket Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        
        # Proxy Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Staging-specific: Add staging indicator
        add_header X-Environment "staging" always;
        
        # More relaxed timeouts for staging
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Static file handling for both environments
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # Health check endpoints
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Nginx Management Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Enable site
sudo ln -s /etc/nginx/sites-available/department.vtc.systems /etc/nginx/sites-enabled/

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🚀 Deployment Scripts

### 1. Deploy to Staging Script

```bash
#!/bin/bash
# /var/www/deployment/scripts/deploy-staging.sh

set -e  # Exit on any error

# Configuration
APP_NAME="{PROJECT_NAME}-staging"
DEPLOY_DIR="/var/www/$APP_NAME"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RELEASE_DIR="$DEPLOY_DIR/releases/$TIMESTAMP"
GIT_REPO="${GIT_REPO:-/path/to/your/repo.git}"  # Set this to your repo
BRANCH="${BRANCH:-develop}"  # Deploy from develop branch

# Logging
LOG_FILE="/var/www/deployment/logs/deployment.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

echo "🚀 Starting staging deployment: $TIMESTAMP"
echo "📁 Deploying to: $RELEASE_DIR"
echo "🌿 Branch: $BRANCH"

# Pre-deployment checks
echo "🔍 Pre-deployment checks..."
if ! pm2 status > /dev/null 2>&1; then
    echo "❌ PM2 is not running"
    exit 1
fi

if ! nginx -t > /dev/null 2>&1; then
    echo "❌ Nginx configuration is invalid"
    exit 1
fi

# Create release directory
echo "📂 Creating release directory..."
mkdir -p "$RELEASE_DIR"
mkdir -p "$DEPLOY_DIR/shared/logs"
mkdir -p "$DEPLOY_DIR/shared/uploads" 
mkdir -p "$DEPLOY_DIR/shared/storage"

# Clone latest code
echo "⬇️  Cloning latest code..."
git clone --branch "$BRANCH" --depth 1 "$GIT_REPO" "$RELEASE_DIR"
cd "$RELEASE_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production --silent

# Link shared resources
echo "🔗 Linking shared resources..."
ln -nfs "$DEPLOY_DIR/shared/.env.staging" "$RELEASE_DIR/.env"
ln -nfs "$DEPLOY_DIR/shared/uploads" "$RELEASE_DIR/public/uploads"
ln -nfs "$DEPLOY_DIR/shared/storage" "$RELEASE_DIR/storage"

# Build application
echo "🏗️  Building application..."
NODE_ENV=staging npm run build

# Run tests (if available)
if npm run test:staging > /dev/null 2>&1; then
    echo "🧪 Running tests..."
    npm run test:staging
else
    echo "⚠️  No staging tests available"
fi

# Atomic symlink switch
echo "🔄 Switching to new release..."
PREVIOUS_RELEASE=$(readlink "$DEPLOY_DIR/current" 2>/dev/null || echo "none")
ln -nfs "$RELEASE_DIR" "$DEPLOY_DIR/current"

# Zero-downtime PM2 reload
echo "♻️  Reloading PM2 application..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    pm2 reload "$APP_NAME" --wait-ready
else
    echo "⚠️  PM2 app not found, starting fresh..."
    pm2 start ecosystem.config.js --only "$APP_NAME"
fi

# Health check
echo "🩺 Performing health check..."
sleep 5  # Give app time to start

HEALTH_URL="https://department.vtc.systems/{PROJECT_NAME}-staging/api/health"
if curl -f -s "$HEALTH_URL" > /dev/null; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed, rolling back..."
    if [ "$PREVIOUS_RELEASE" != "none" ]; then
        ln -nfs "$PREVIOUS_RELEASE" "$DEPLOY_DIR/current"
        pm2 reload "$APP_NAME" --wait-ready
    fi
    exit 1
fi

# Cleanup old releases (keep last 5)
echo "🧹 Cleaning up old releases..."
cd "$DEPLOY_DIR/releases" && ls -t | tail -n +6 | xargs -r rm -rf

echo "✅ Staging deployment complete!"
echo "🌐 Staging URL: https://department.vtc.systems/{PROJECT_NAME}-staging"
echo "📊 Current release: $TIMESTAMP"
echo "📝 Previous release: ${PREVIOUS_RELEASE##*/}"
```

### 2. Promote to Production Script

```bash
#!/bin/bash
# /var/www/deployment/scripts/promote-to-production.sh

set -e  # Exit on any error

# Configuration
STAGING_DIR="/var/www/{PROJECT_NAME}-staging"
PROD_DIR="/var/www/{PROJECT_NAME}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RELEASE_DIR="$PROD_DIR/releases/$TIMESTAMP"
STAGING_APP="{PROJECT_NAME}-staging"
PROD_APP="{PROJECT_NAME}-prod"

# Logging
LOG_FILE="/var/www/deployment/logs/deployment.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

echo "🚀 Starting production promotion: $TIMESTAMP"

# Confirmation prompt (comment out for automated deployments)
read -p "🔴 This will deploy to PRODUCTION. Are you sure? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Pre-promotion checks
echo "🔍 Pre-promotion checks..."
if [ ! -d "$STAGING_DIR/current" ]; then
    echo "❌ Staging deployment not found"
    exit 1
fi

# Verify staging is healthy
STAGING_HEALTH_URL="https://department.vtc.systems/{PROJECT_NAME}-staging/api/health"
if ! curl -f -s "$STAGING_HEALTH_URL" > /dev/null; then
    echo "❌ Staging health check failed"
    exit 1
fi

if ! pm2 status > /dev/null 2>&1; then
    echo "❌ PM2 is not running"
    exit 1
fi

# Create production directories
echo "📂 Preparing production directories..."
mkdir -p "$PROD_DIR/releases"
mkdir -p "$PROD_DIR/shared/logs"
mkdir -p "$PROD_DIR/shared/uploads"
mkdir -p "$PROD_DIR/shared/storage"

# Copy staging release to production
echo "📋 Copying staging release to production..."
cp -r "$STAGING_DIR/current" "$RELEASE_DIR"
cd "$RELEASE_DIR"

# Update environment configurations for production
echo "🔧 Configuring production environment..."
ln -nfs "$PROD_DIR/shared/.env.production" "$RELEASE_DIR/.env"
ln -nfs "$PROD_DIR/shared/uploads" "$RELEASE_DIR/public/uploads" 
ln -nfs "$PROD_DIR/shared/storage" "$RELEASE_DIR/storage"

# Production build (if different from staging)
echo "🏗️  Building for production..."
NODE_ENV=production npm run build

# Run production tests (if available)
if npm run test:production > /dev/null 2>&1; then
    echo "🧪 Running production tests..."
    npm run test:production
else
    echo "⚠️  No production tests available"
fi

# Atomic symlink switch
echo "🔄 Switching production to new release..."
PREVIOUS_PROD_RELEASE=$(readlink "$PROD_DIR/current" 2>/dev/null || echo "none")
ln -nfs "$RELEASE_DIR" "$PROD_DIR/current"

# Zero-downtime PM2 reload
echo "♻️  Reloading production PM2 application..."
if pm2 describe "$PROD_APP" > /dev/null 2>&1; then
    pm2 reload "$PROD_APP" --wait-ready
else
    echo "⚠️  Production PM2 app not found, starting fresh..."
    pm2 start ecosystem.config.js --only "$PROD_APP"
fi

# Production health check
echo "🩺 Performing production health check..."
sleep 10  # Give production more time to start

PROD_HEALTH_URL="https://department.vtc.systems/{PROJECT_NAME}/api/health"
for i in {1..5}; do
    if curl -f -s "$PROD_HEALTH_URL" > /dev/null; then
        echo "✅ Production health check passed"
        break
    else
        echo "⚠️  Health check attempt $i failed, retrying..."
        if [ $i -eq 5 ]; then
            echo "❌ Production health check failed, rolling back..."
            if [ "$PREVIOUS_PROD_RELEASE" != "none" ]; then
                ln -nfs "$PREVIOUS_PROD_RELEASE" "$PROD_DIR/current"
                pm2 reload "$PROD_APP" --wait-ready
            fi
            exit 1
        fi
        sleep 5
    fi
done

# Cleanup old production releases (keep last 5)
echo "🧹 Cleaning up old production releases..."
cd "$PROD_DIR/releases" && ls -t | tail -n +6 | xargs -r rm -rf

# Send deployment notification (customize as needed)
echo "📧 Sending deployment notification..."
# curl -X POST -H 'Content-type: application/json' \
#     --data '{"text":"🚀 Production deployment successful: '"$TIMESTAMP"'"}' \
#     YOUR_SLACK_WEBHOOK_URL

echo "✅ Production promotion complete!"
echo "🌐 Production URL: https://department.vtc.systems/{PROJECT_NAME}"
echo "📊 Current release: $TIMESTAMP"
echo "📝 Previous release: ${PREVIOUS_PROD_RELEASE##*/}"
echo "🎯 Deployed from staging at: $(date)"
```

### 3. Emergency Rollback Script

```bash
#!/bin/bash
# /var/www/deployment/scripts/rollback-production.sh

set -e

# Configuration
PROD_DIR="/var/www/{PROJECT_NAME}" 
PROD_APP="{PROJECT_NAME}-prod"

# Logging
LOG_FILE="/var/www/deployment/logs/deployment.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

echo "🔴 EMERGENCY ROLLBACK INITIATED: $(date)"

# Find previous release
cd "$PROD_DIR/releases"
CURRENT_RELEASE=$(readlink "$PROD_DIR/current" 2>/dev/null || echo "")
RELEASES=($(ls -t))

PREVIOUS_RELEASE=""
for release in "${RELEASES[@]}"; do
    if [ "$PROD_DIR/releases/$release" != "$CURRENT_RELEASE" ]; then
        PREVIOUS_RELEASE="$release"
        break
    fi
done

if [ -z "$PREVIOUS_RELEASE" ]; then
    echo "❌ No previous release found for rollback"
    exit 1
fi

echo "🔄 Rolling back from: ${CURRENT_RELEASE##*/}"  
echo "🔄 Rolling back to: $PREVIOUS_RELEASE"

# Confirmation
read -p "🔴 Confirm PRODUCTION rollback? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

# Atomic rollback
echo "⚡ Performing atomic rollback..."
ln -nfs "$PROD_DIR/releases/$PREVIOUS_RELEASE" "$PROD_DIR/current"

# Reload PM2
echo "♻️  Reloading PM2..."
pm2 reload "$PROD_APP" --wait-ready

# Health check
echo "🩺 Performing health check..."
sleep 10

PROD_HEALTH_URL="https://department.vtc.systems/{PROJECT_NAME}/api/health"
if curl -f -s "$PROD_HEALTH_URL" > /dev/null; then
    echo "✅ Rollback successful - Production is healthy"
else
    echo "❌ Rollback health check failed"
    exit 1
fi

echo "🎯 ROLLBACK COMPLETE"
echo "📊 Active release: $PREVIOUS_RELEASE"
```

## 🛠️ Setup Instructions

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (use NodeSource repository for latest LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Create directory structure
sudo mkdir -p /var/www/{{PROJECT_NAME},{PROJECT_NAME}-staging}/{releases,shared/{logs,uploads,storage}}
sudo mkdir -p /var/www/deployment/{scripts,configs,logs}

# Set proper permissions
sudo chown -R $USER:$USER /var/www/
sudo chmod -R 755 /var/www/
```

### 2. Configure PM2

```bash
# Copy PM2 configuration
sudo cp ecosystem.config.js /var/www/deployment/configs/

# Start PM2 applications
cd /var/www/deployment/configs
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup auto-startup
pm2 startup
# Run the command that PM2 outputs
```

### 3. Configure Nginx

```bash
# Copy Nginx site configuration
sudo cp nginx-sites.conf /etc/nginx/sites-available/department.vtc.systems

# Enable site
sudo ln -s /etc/nginx/sites-available/department.vtc.systems /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d department.vtc.systems

# Test auto-renewal
sudo certbot renew --dry-run
```

### 5. Setup Deployment Scripts

```bash
# Copy deployment scripts
cp deploy-staging.sh /var/www/deployment/scripts/
cp promote-to-production.sh /var/www/deployment/scripts/
cp rollback-production.sh /var/www/deployment/scripts/

# Make scripts executable
chmod +x /var/www/deployment/scripts/*.sh

# Create environment files
touch /var/www/{PROJECT_NAME}/shared/.env.production
touch /var/www/{PROJECT_NAME}-staging/shared/.env.staging
```

### 6. Environment Configuration

```bash
# Production environment variables
cat > /var/www/{PROJECT_NAME}/shared/.env.production << EOF
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://department.vtc.systems/{PROJECT_NAME}

# Add your production-specific variables here
DATABASE_URL=your_production_database_url
AZURE_AD_CLIENT_ID=your_production_client_id
AZURE_AD_CLIENT_SECRET=your_production_client_secret
AZURE_AD_TENANT_ID=your_tenant_id
# ... other production variables
EOF

# Staging environment variables  
cat > /var/www/{PROJECT_NAME}-staging/shared/.env.staging << EOF
NODE_ENV=staging
PORT=4000
NEXTAUTH_URL=https://department.vtc.systems/{PROJECT_NAME}-staging

# Add your staging-specific variables here
DATABASE_URL=your_staging_database_url
AZURE_AD_CLIENT_ID=your_staging_client_id
AZURE_AD_CLIENT_SECRET=your_staging_client_secret
AZURE_AD_TENANT_ID=your_tenant_id
# ... other staging variables
EOF
```

## 📋 Usage Workflows

### Daily Development Workflow

```bash
# 1. Deploy latest changes to staging
cd /var/www/deployment/scripts
./deploy-staging.sh

# 2. Test staging environment
curl https://department.vtc.systems/{PROJECT_NAME}-staging/api/health

# 3. Run manual testing on staging
# (UI testing, API testing, etc.)

# 4. When ready, promote to production
./promote-to-production.sh
```

### Emergency Procedures

```bash
# Emergency rollback production
./rollback-production.sh

# Emergency rollback staging  
./rollback-staging.sh

# Check application health
pm2 status
pm2 logs
curl https://department.vtc.systems/{PROJECT_NAME}/api/health
```

### Maintenance Operations

```bash
# View deployment history
tail -f /var/www/deployment/logs/deployment.log

# Monitor applications
pm2 monit

# Check disk usage
df -h
du -sh /var/www/*/releases/*

# Manual cleanup (if needed)
cd /var/www/{PROJECT_NAME}/releases && ls -t | tail -n +3 | xargs rm -rf
```

## 📊 Monitoring & Maintenance

### Application Monitoring

```bash
# Real-time PM2 monitoring
pm2 monit

# View logs
pm2 logs {PROJECT_NAME}-prod
pm2 logs {PROJECT_NAME}-staging

# System resources
htop
df -h
free -h
```

### Health Checks

```bash
# Application health
curl https://department.vtc.systems/{PROJECT_NAME}/api/health
curl https://department.vtc.systems/{PROJECT_NAME}-staging/api/health

# PM2 process status
pm2 jlist

# Nginx status
sudo systemctl status nginx
sudo nginx -t
```

### Log Management

```bash
# View application logs
tail -f /var/www/{PROJECT_NAME}/shared/logs/combined.log
tail -f /var/www/{PROJECT_NAME}/shared/logs/error.log

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View deployment logs
tail -f /var/www/deployment/logs/deployment.log
```

### Automated Monitoring Script

```bash
#!/bin/bash
# /var/www/deployment/scripts/health-monitor.sh

# Check PM2 processes
pm2 jlist | jq -r '.[] | select(.pm2_env.status != "online") | .name' | while read app; do
    echo "⚠️  Alert: $app is not online"
    # Add notification logic here
done

# Check disk space
DISK_USAGE=$(df /var/www | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  Alert: Disk usage is ${DISK_USAGE}%"
fi

# Check application health
for url in "https://department.vtc.systems/{PROJECT_NAME}/api/health" "https://department.vtc.systems/{PROJECT_NAME}-staging/api/health"; do
    if ! curl -f -s "$url" > /dev/null; then
        echo "⚠️  Alert: $url health check failed"
    fi
done
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### PM2 Application Won't Start

```bash
# Check PM2 logs
pm2 logs app-name

# Check if port is in use
sudo netstat -tulpn | grep :3000

# Restart PM2 daemon
pm2 kill
pm2 start ecosystem.config.js
```

#### Nginx Configuration Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Reload configuration
sudo systemctl reload nginx
```

#### Symlink Issues

```bash
# Check current symlink
ls -la /var/www/{PROJECT_NAME}/current

# Manually fix symlink
ln -nfs /var/www/{PROJECT_NAME}/releases/latest /var/www/{PROJECT_NAME}/current
```

#### Database Connection Issues

```bash
# Check environment variables
cat /var/www/{PROJECT_NAME}/shared/.env.production

# Test database connection
cd /var/www/{PROJECT_NAME}/current
node -e "require('./lib/db').testConnection()"
```

#### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test SSL configuration
curl -I https://department.vtc.systems/{PROJECT_NAME}
```

### Debugging Commands

```bash
# Check all services status
systemctl status nginx pm2-$USER

# View system resources
htop
df -h
free -h

# Check network connectivity
netstat -tulpn
ss -tulpn

# Test application endpoints
curl -v https://department.vtc.systems/{PROJECT_NAME}/api/health
curl -v https://department.vtc.systems/{PROJECT_NAME}-staging/api/health
```

### Recovery Procedures

#### Complete System Recovery

```bash
# 1. Restart all services
sudo systemctl restart nginx
pm2 restart all

# 2. If PM2 issues persist
pm2 kill
pm2 resurrect

# 3. If database issues
# Check database server status
# Restore from backup if necessary

# 4. If file system issues
# Check disk space: df -h  
# Check file permissions: ls -la /var/www/
# Restore from backup if necessary
```

---

## 📋 Summary

This deployment architecture provides:

✅ **Zero-Downtime Deployments** - PM2 cluster mode ensures continuous service  
✅ **Atomic Deployments** - Symlink switching enables instant, safe deployments  
✅ **Easy Rollbacks** - Previous releases ready for instant activation  
✅ **Environment Isolation** - Complete separation between staging and production  
✅ **Comprehensive Logging** - Full visibility into application behavior  
✅ **Health Monitoring** - Automated checks ensure system reliability  
✅ **Security Best Practices** - SSL, security headers, and access controls  
✅ **Scalability** - Horizontal scaling through PM2 cluster mode  

**Next Steps:**
1. Follow setup instructions to implement this architecture
2. Customize environment variables for your specific application
3. Set up monitoring and alerting according to your needs
4. Test deployment procedures in a safe environment first
5. Document any application-specific deployment requirements

This system provides enterprise-grade deployment capabilities while maintaining simplicity and reliability for your staging/production workflow.