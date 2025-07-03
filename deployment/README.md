# NDA Analyzer Deployment Configuration

This directory contains all the configuration files needed to deploy the NDA Analyzer to EC2 instance `i-035db647b0a1eb2e7` (legal.vtc.systems).

## 📁 Files Created

| File | Purpose | Status |
|------|---------|--------|
| `.env.production` | Production environment variables | ✅ Ready |
| `nginx-site.conf` | NGINX server configuration | ✅ Ready |
| `ecosystem.config.js` | PM2 process management | ✅ Ready |
| `deploy.sh` | Automated deployment script | ✅ Ready |

## 🚫 Current Blocker

**Cannot access EC2 instance**: SSM session fails with EOF error
- Instance ID: `i-035db647b0a1eb2e7`
- Domain: `legal.vtc.systems`
- Need SSH key or SSM permissions from AWS admin

## 🚀 When EC2 Access is Granted

### Option 1: Automated Deployment (Recommended)

```bash
# 1. Copy deployment files to EC2
scp -r deployment/ ubuntu@legal.vtc.systems:~/

# 2. SSH into EC2 instance
ssh ubuntu@legal.vtc.systems

# 3. Run deployment script
cd ~/deployment
./deploy.sh
```

### Option 2: Manual Step-by-Step

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Install NGINX
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 5. Clone repository
git clone <repo-url> /home/ubuntu/nda-analyzer

# 6. Install dependencies and build
cd /home/ubuntu/nda-analyzer
cp deployment/.env.production .env.production
npm ci
npm run build

# 7. Configure NGINX
sudo cp deployment/nginx-site.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx

# 8. Start with PM2
cp deployment/ecosystem.config.js .
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🔧 Configuration Details

### Environment Variables (`.env.production`)
- **Azure AD**: Pre-configured for legal.vtc.systems
- **Database**: Points to existing MySQL cluster
- **Storage**: Configured for S3 (vvg-cloud-storage)
- **URLs**: Production domain setup

### NGINX Configuration (`nginx-site.conf`)
- **Domain**: legal.vtc.systems
- **Path**: /nda-analyzer
- **Proxy**: localhost:3000
- **Buffers**: Increased for Azure AD auth
- **SSL**: Ready for Let's Encrypt

### PM2 Configuration (`ecosystem.config.js`)
- **Process**: Single instance (can scale later)
- **Auto-restart**: Enabled with memory limits
- **Logging**: Structured logs in /home/ubuntu/logs/
- **Health checks**: Built-in monitoring

## 🔍 Post-Deployment Testing

```bash
# Test local application
curl http://localhost:3000/health

# Test NGINX proxy
curl http://localhost/nda-analyzer

# Check PM2 status
pm2 status

# View logs
pm2 logs nda-analyzer

# Test domain access
curl http://legal.vtc.systems/nda-analyzer
```

## 🔒 SSL Certificate Setup

After basic deployment works:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d legal.vtc.systems

# Or use deployment script
./deploy.sh ssl
```

## 🎯 Success Criteria

1. ✅ Application accessible at http://legal.vtc.systems/nda-analyzer
2. ✅ Azure AD authentication works
3. ✅ File uploads work (using local storage fallback)
4. ✅ Database connections work (using in-memory fallback)
5. ✅ PM2 monitoring shows healthy status
6. ✅ NGINX buffers handle Azure AD auth properly

## 🚨 Known Issues & Workarounds

| Issue | Impact | Workaround | Fix Required |
|-------|---------|------------|--------------|
| S3 Access Denied | File uploads | Local storage fallback | AWS permissions |
| No CREATE TABLE | Data persistence | In-memory DB fallback | DB permissions from Satyen |
| EC2 SSH/SSM Access | Cannot deploy | None - blocked | SSH key or SSM permissions |

## 📊 Monitoring Commands

```bash
# Application health
./deploy.sh status
./deploy.sh test
./deploy.sh logs

# System resources
htop
df -h
free -h

# NGINX status
sudo systemctl status nginx
sudo nginx -t
```

## 🔄 Deployment Updates

For future updates:

```bash
# Quick restart
./deploy.sh restart

# Full redeployment
cd /home/ubuntu/nda-analyzer
git pull origin main
npm ci
npm run build
pm2 restart nda-analyzer
```

---

**Last Updated**: 2025-07-03