# First Deployment Guide

Deploy your Document Processing Template to production for the first time.

## 🎯 Pre-Deployment Checklist

### Required Resources
- [ ] **Server/Cloud Instance** (AWS EC2, Azure VM, or Docker host)
- [ ] **Domain Name** with DNS access
- [ ] **SSL Certificate** (Let's Encrypt or commercial)
- [ ] **Database** (MySQL 8.0+ instance)
- [ ] **Storage** (S3 bucket or local storage)
- [ ] **Azure AD App** registration configured

### Environment Preparation
- [ ] All environment variables configured
- [ ] Database accessible from application server
- [ ] Storage bucket created and accessible
- [ ] Firewall rules configured (ports 80, 443, 22)
- [ ] SSL certificate installed

## 🚀 Deployment Options

### Option 1: Docker Deployment (Recommended)

#### 1. Prepare Server
```bash
# Connect to your server
ssh user@your-server-ip

# Install Docker and Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Clone and Configure
```bash
# Clone repository
cd /opt
sudo git clone https://github.com/your-org/vvg_template.git
sudo chown -R $USER:$USER vvg_template
cd vvg_template

# Create production environment file
cp .env.example .env.local
```

#### 3. Configure Environment
```bash
# Edit .env.local with production values
nano .env.local
```

```bash
# Production Environment Variables
NODE_ENV=production
BASE_PATH=/template
NEXT_PUBLIC_BASE_PATH=/template

# URLs
NEXTAUTH_URL=https://your-domain.com/template
APP_URL=https://your-domain.com/template

# Authentication
NEXTAUTH_SECRET=your-strong-secret-here
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-tenant-id

# Database
MYSQL_HOST=your-database-host
MYSQL_PORT=3306
MYSQL_DATABASE=vvg_template
MYSQL_USER=your-db-user
MYSQL_PASSWORD=your-db-password

# Storage
STORAGE_PROVIDER=s3
S3_BUCKET_NAME=your-bucket-name
S3_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret

# Optional: OpenAI
OPENAI_API_KEY=your-openai-key
```

#### 4. Deploy with Docker
```bash
# Build and start services
docker-compose -f docker-compose.production.yml up -d --build

# Check deployment status
docker-compose -f docker-compose.production.yml ps
docker-compose logs -f app
```

### Option 2: Traditional Server Deployment

#### 1. Prepare Server
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 and NGINX
sudo npm install -g pm2
sudo apt install -y nginx certbot python3-certbot-nginx
```

#### 2. Deploy Application
```bash
# Clone and setup
cd /opt
sudo git clone https://github.com/your-org/vvg_template.git
sudo chown -R $USER:$USER vvg_template
cd vvg_template

# Install dependencies and build
npm install
npm run build

# Configure environment
cp .env.example .env.local
# Edit .env.local with production values

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save
```

## 🗄️ Database Setup

### 1. Database Creation
```sql
-- Connect to your MySQL instance
mysql -h your-database-host -u root -p

-- Create database and user
CREATE DATABASE vvg_template CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vvg_user'@'%' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON vvg_template.* TO 'vvg_user'@'%';
FLUSH PRIVILEGES;
```

### 2. Run Migrations
```bash
# Run database migrations
npm run db:migrate

# Verify migration status
npm run db:migrate:status

# Seed initial data (optional)
npm run db:seed
```

## 🔒 SSL/HTTPS Configuration

### Option 1: Let's Encrypt (Free)
```bash
# Configure NGINX first
sudo cp deployment/nginx.vvg-template-enhanced.conf /etc/nginx/sites-available/vvg-template

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Enable our site
sudo ln -s /etc/nginx/sites-available/vvg-template /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### Option 2: Commercial Certificate
```bash
# Copy your certificate files
sudo cp your-certificate.crt /etc/nginx/ssl/
sudo cp your-private-key.key /etc/nginx/ssl/
sudo chown root:root /etc/nginx/ssl/*
sudo chmod 600 /etc/nginx/ssl/*

# Update NGINX configuration with certificate paths
sudo nano /etc/nginx/sites-available/vvg-template
```

## 🌐 NGINX Configuration

### Production NGINX Setup
```nginx
# /etc/nginx/sites-available/vvg-template
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Application proxy
    location /template/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Large buffer for authentication
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # File upload size
        client_max_body_size 20M;
    }
}
```

### Start NGINX
```bash
# Start and enable NGINX
sudo systemctl enable nginx
sudo systemctl start nginx

# Check status
sudo systemctl status nginx
```

## 🔍 Verification & Testing

### 1. Health Checks
```bash
# Application health
curl https://your-domain.com/template/api/health

# Database connectivity
curl https://your-domain.com/template/api/db-health

# Storage connectivity
curl https://your-domain.com/template/api/storage-health
```

### 2. Functional Testing
```bash
# Test authentication endpoint
curl -I https://your-domain.com/template/api/auth/signin

# Test upload endpoint (requires authentication)
curl -I https://your-domain.com/template/api/upload

# Test main application
curl -I https://your-domain.com/template/
```

### 3. SSL/Security Testing
```bash
# Test SSL configuration
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Test security headers
curl -I https://your-domain.com/template/

# Check SSL rating (online)
# Visit: https://www.ssllabs.com/ssltest/
```

## 📊 Monitoring Setup

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs vvg-template

# Application metrics
curl https://your-domain.com/template/api/metrics
```

### 2. Server Monitoring
```bash
# System resources
htop
df -h
free -m

# Service status
sudo systemctl status nginx
sudo systemctl status mysql  # if local
```

### 3. Log Management
```bash
# Application logs
tail -f logs/combined.log
tail -f logs/error.log

# NGINX logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -f
```

## 🔐 Security Hardening

### 1. Firewall Configuration
```bash
# Configure UFW (Ubuntu Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Fail2Ban (Optional)
```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure for NGINX
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Add NGINX jail
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
```

### 3. System Updates
```bash
# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Manual update
sudo apt update && sudo apt upgrade -y
```

## 🔄 Backup Strategy

### 1. Database Backup
```bash
# Create backup script
cat > /opt/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > backup_${DATE}.sql
aws s3 cp backup_${DATE}.sql s3://your-backup-bucket/database/
rm backup_${DATE}.sql
EOF

chmod +x /opt/backup-db.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /opt/backup-db.sh
```

### 2. Application Backup
```bash
# Create application backup
tar -czf vvg-template-$(date +%Y%m%d).tar.gz /opt/vvg_template
aws s3 cp vvg-template-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/app/
```

## 🚨 Troubleshooting First Deployment

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs vvg-template --lines 50
# or
docker-compose logs app

# Check environment variables
pm2 show vvg-template | grep env
# or
docker-compose exec app env | grep NODE_ENV
```

#### Database Connection Issues
```bash
# Test connection
mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1"

# Check firewall/security groups
# Ensure port 3306 is open from application server
```

#### NGINX Issues
```bash
# Check configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Test upstream
curl http://localhost:3000/template/api/health
```

#### SSL Issues
```bash
# Check certificate
sudo certbot certificates

# Test SSL
openssl s_client -connect your-domain.com:443

# Check Let's Encrypt logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## 🎉 Post-Deployment

### 1. Verify Everything Works
- [ ] Application loads at https://your-domain.com/template
- [ ] Authentication works with Azure AD
- [ ] File upload and processing works
- [ ] Document comparison works (if OpenAI configured)
- [ ] All health checks pass

### 2. Configure Monitoring
- [ ] Set up log monitoring
- [ ] Configure alerts for downtime
- [ ] Set up backup verification
- [ ] Monitor resource usage

### 3. Documentation
- [ ] Document the deployment process
- [ ] Share credentials securely with team
- [ ] Update DNS records if needed
- [ ] Inform stakeholders of new URL

## 📚 Next Steps

1. **[Development Guide](../development/setup.md)** - Set up development environment
2. **[API Reference](../api/reference.md)** - Explore the API
3. **[Troubleshooting](../deployment/troubleshooting.md)** - Common issues and solutions

---

**Congratulations!** 🎉 Your Document Processing Template is now deployed and ready for use.