# AWS EC2 Deployment Guide

This guide covers deploying the Document Processing Template on AWS EC2 instances.

## 🎯 Prerequisites

### AWS Resources Required
- **EC2 Instance** (t3.medium or larger recommended)
- **RDS MySQL Instance** (db.t3.micro or larger)
- **S3 Bucket** for file storage
- **Security Groups** properly configured
- **IAM Roles** for S3 access
- **Route 53** (optional) for domain management

### Local Requirements
- AWS CLI configured
- SSH key pair for EC2 access
- Domain name and SSL certificate

## 🚀 Quick Deployment

### Using Automated Script
```bash
# Run the automated deployment script
./scripts/deploy-to-ec2.sh

# Follow the prompts for:
# - EC2 instance details
# - Database configuration
# - Domain settings
```

### Manual Deployment
Continue with the step-by-step guide below.

## 🏗️ Infrastructure Setup

### 1. Launch EC2 Instance

#### Instance Configuration
- **AMI**: Ubuntu 22.04 LTS
- **Instance Type**: t3.medium (minimum), t3.large (recommended)
- **Storage**: 20GB gp3 SSD (minimum)
- **Security Group**: Allow ports 22, 80, 443

#### User Data Script
```bash
#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose nginx certbot python3-certbot-nginx
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2
```

### 2. Configure Security Groups

#### Application Security Group
```bash
# SSH access
Port 22: 0.0.0.0/0 (restrict to your IP in production)

# HTTP/HTTPS
Port 80: 0.0.0.0/0
Port 443: 0.0.0.0/0

# Application (internal)
Port 3000: Security Group ID (self-reference)
```

#### Database Security Group
```bash
# MySQL access from application
Port 3306: Application Security Group ID
```

### 3. Create RDS Database

#### Database Configuration
```bash
# Engine: MySQL 8.0
# Instance Class: db.t3.micro (minimum)
# Storage: 20GB gp2
# Multi-AZ: No (for cost savings in dev/staging)
# Backup: 7 days retention
```

#### Database Setup
```sql
-- Create database and user
CREATE DATABASE vvg_template;
CREATE USER 'vvg_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON vvg_template.* TO 'vvg_user'@'%';
FLUSH PRIVILEGES;
```

### 4. Configure S3 Bucket

#### Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VVGTemplateAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT:role/EC2-S3-Access-Role"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

#### IAM Role for EC2
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

## 📦 Application Deployment

### 1. Connect to EC2 Instance

#### SSH Connection
```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Or via AWS SSM (recommended)
aws ssm start-session --target i-1234567890abcdef0
```

### 2. Clone and Configure Application

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/your-org/vvg_template.git
sudo chown -R ubuntu:ubuntu vvg_template
cd vvg_template

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 3. Configure Environment Variables

#### `.env.local`
```bash
# Application
NODE_ENV=production
PORT=3000
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
MYSQL_HOST=your-rds-endpoint
MYSQL_PORT=3306
MYSQL_DATABASE=vvg_template
MYSQL_USER=vvg_user
MYSQL_PASSWORD=secure_password

# Storage
STORAGE_PROVIDER=s3
S3_BUCKET_NAME=your-bucket-name
S3_REGION=us-west-2
# AWS credentials automatically provided by IAM role

# OpenAI (optional)
OPENAI_API_KEY=your-openai-key

# Logging
LOG_LEVEL=info
```

### 4. Database Migration

```bash
# Run database migrations
npm run db:migrate

# Verify migration status
npm run db:migrate:status
```

### 5. Build and Start Application

#### Option A: Using PM2 (Recommended)
```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

#### Option B: Using Docker
```bash
# Build and start with Docker
docker-compose -f docker-compose.production.yml up -d

# Enable Docker to start on boot
sudo systemctl enable docker
```

### 6. Configure NGINX

#### Install SSL Certificate
```bash
# Using Certbot for Let's Encrypt
sudo certbot --nginx -d your-domain.com

# Or manually copy your SSL certificates to:
# /etc/nginx/ssl/certificate.crt
# /etc/nginx/ssl/private.key
```

#### NGINX Configuration
```bash
# Copy the enhanced configuration
sudo cp deployment/nginx.vvg-template-enhanced.conf /etc/nginx/sites-available/vvg-template

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Enable our site
sudo ln -s /etc/nginx/sites-available/vvg-template /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Start and enable NGINX
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 🔍 Verification & Testing

### Health Checks
```bash
# Application health
curl https://your-domain.com/template/api/health

# Database connectivity
curl https://your-domain.com/template/api/db-health

# Storage connectivity
curl https://your-domain.com/template/api/storage-health
```

### Functional Testing
```bash
# Run the complete test suite
./scripts/test-complete.js

# Test authentication flow
./scripts/test-oauth-flow.sh

# Test file upload
./scripts/test-e2e-simple.js
```

## 📊 Monitoring & Maintenance

### System Monitoring
```bash
# Monitor system resources
htop
df -h
free -m

# Check application logs
pm2 logs vvg-template

# Monitor NGINX logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Application status
pm2 status

# Restart application
pm2 restart vvg-template
```

### Database Monitoring
```bash
# Check RDS performance in AWS Console
# Monitor connection count, CPU, and memory usage

# Check database connectivity
mysql -h your-rds-endpoint -u vvg_user -p -e "SELECT 1"
```

## 🔧 Performance Optimization

### EC2 Instance Optimization
```bash
# Optimize for production
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'net.core.somaxconn=1024' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Application Optimization
```bash
# Enable PM2 cluster mode
pm2 start ecosystem.config.js --env production -i max

# Optimize memory usage
export NODE_OPTIONS="--max-old-space-size=1024"
```

### Database Optimization
```sql
-- Optimize MySQL settings for RDS
-- Configure these in RDS Parameter Group:
-- innodb_buffer_pool_size = 75% of available memory
-- max_connections = 100
-- query_cache_size = 16MB
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs vvg-template --lines 50

# Check environment
node -e "console.log(process.env.NODE_ENV)"

# Verify build
npm run build
```

#### Database Connection Issues
```bash
# Test database connectivity
mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1"

# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx
```

#### NGINX Issues
```bash
# Check NGINX status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

#### SSL/TLS Issues
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Check SSL configuration
openssl s_client -connect your-domain.com:443
```

## 🔄 Updates & Deployment

### Application Updates
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart PM2
pm2 restart vvg-template
```

### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js
sudo npm install -g n
sudo n stable

# Update PM2
npm install -g pm2@latest
pm2 update
```

## 💾 Backup & Recovery

### Database Backup
```bash
# Create RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier your-db-instance \
  --db-snapshot-identifier snapshot-$(date +%Y%m%d)
```

### Application Backup
```bash
# Backup application files
tar -czf vvg-template-backup-$(date +%Y%m%d).tar.gz /opt/vvg_template

# Backup to S3
aws s3 cp vvg-template-backup-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

### Recovery Procedures
```bash
# Restore from backup
aws s3 cp s3://your-backup-bucket/vvg-template-backup-20240101.tar.gz .
tar -xzf vvg-template-backup-20240101.tar.gz

# Restore database from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier your-new-instance \
  --db-snapshot-identifier snapshot-20240101
```

---

**Next**: [Troubleshooting Guide](troubleshooting.md) | [Docker Deployment](docker.md)