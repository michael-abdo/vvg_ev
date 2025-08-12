# Deployment Troubleshooting Guide

Common issues and solutions for deploying the Document Processing Template.

## 🔧 Quick Diagnostics

### Health Check Commands
```bash
# Application health
curl https://your-domain.com/template/api/health

# Database connectivity
curl https://your-domain.com/template/api/db-health

# Storage connectivity
curl https://your-domain.com/template/api/storage-health

# System resources
htop
df -h
free -m
```

### Log Locations
```bash
# Application logs
pm2 logs vvg-template
tail -f logs/combined.log

# System logs
sudo journalctl -u nginx -f
sudo tail -f /var/log/nginx/error.log

# Docker logs
docker-compose logs -f app
```

## 🚨 Application Issues

### Application Won't Start

#### Symptoms
- PM2 shows app as "errored" or "stopped"
- Cannot access application URL
- 502 Bad Gateway from NGINX

#### Diagnosis
```bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs vvg-template --lines 50 --raw

# Check environment variables
pm2 show vvg-template | grep -A 20 "env:"
```

#### Solutions

**Missing Environment Variables**
```bash
# Verify required variables are set
grep -E "(NEXTAUTH_SECRET|AZURE_AD|MYSQL)" .env.local

# Generate missing NEXTAUTH_SECRET
openssl rand -base64 32

# Update environment
pm2 restart vvg-template --update-env
```

**Port Already in Use**
```bash
# Check what's using port 3000
sudo netstat -tlnp | grep :3000

# Kill conflicting process
sudo kill -9 <PID>

# Or change port in ecosystem.config.js
```

**Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /opt/vvg_template
chmod +x /opt/vvg_template/scripts/*.sh

# Fix upload directory
mkdir -p /tmp/uploads
chmod 755 /tmp/uploads
```

### Build Failures

#### Symptoms
- `npm run build` fails
- TypeScript compilation errors
- Missing dependencies

#### Solutions

**Clear Cache and Reinstall**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

**TypeScript Errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update types
npm install --save-dev @types/node@latest

# Skip type checking in emergency
npm run build -- --typescript.ignoreBuildErrors=true
```

**Memory Issues During Build**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or build with limited concurrency
npm run build -- --max-memory=2048
```

## 🗄️ Database Issues

### Connection Failures

#### Symptoms
- "ECONNREFUSED" errors
- "Access denied" errors
- Timeout errors

#### Diagnosis
```bash
# Test direct connection
mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1"

# Check database status
curl https://your-domain.com/template/api/db-health

# Verify connection string
node -e "console.log(process.env.MYSQL_HOST)"
```

#### Solutions

**Network/Firewall Issues**
```bash
# Check security groups (AWS)
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# Test port connectivity
telnet $MYSQL_HOST 3306

# Check local firewall
sudo ufw status
```

**Authentication Issues**
```bash
# Verify credentials
mysql -h $MYSQL_HOST -u $MYSQL_USER -p

# Check user permissions
mysql -e "SHOW GRANTS FOR '$MYSQL_USER'@'%';"

# Reset password if needed
mysql -e "ALTER USER '$MYSQL_USER'@'%' IDENTIFIED BY 'new_password';"
```

**SSL Connection Issues**
```bash
# Force SSL connection
export MYSQL_SSL_REJECT_UNAUTHORIZED=true

# Or disable SSL for troubleshooting
export MYSQL_SSL=false
```

### Migration Issues

#### Symptoms
- Migration scripts fail
- Table doesn't exist errors
- Foreign key constraint errors

#### Solutions

**Check Migration Status**
```bash
# See migration history
npm run db:migrate:status

# See pending migrations
npm run db:migrate:pending
```

**Manual Migration Recovery**
```bash
# Mark migration as run (if manually executed)
npm run db:migrate:up -- --migration migration-name.js

# Rollback last migration
npm run db:migrate:down

# Force migration (danger!)
npm run db:migrate:up -- --force
```

**Schema Conflicts**
```sql
-- Check existing tables
SHOW TABLES;

-- Check table structure
DESCRIBE table_name;

-- Drop and recreate problematic table
DROP TABLE IF EXISTS table_name;
-- Then run migration again
```

## 🔐 Authentication Issues

### Azure AD Login Failures

#### Symptoms
- Redirect loops
- "Invalid redirect URI" errors
- "Application not found" errors

#### Diagnosis
```bash
# Check Azure AD configuration
grep -E "AZURE_AD_|NEXTAUTH_" .env.local

# Test auth endpoint
curl -I https://your-domain.com/template/api/auth/signin

# Check redirect URI construction
node -e "console.log(process.env.NEXTAUTH_URL + '/api/auth/callback/azure-ad')"
```

#### Solutions

**Redirect URI Mismatch**
```bash
# Verify Azure AD app registration has correct URIs:
# https://your-domain.com/template/api/auth/callback/azure-ad

# Check basePath configuration
grep BASE_PATH .env*

# Verify NEXTAUTH_URL matches deployment URL
export NEXTAUTH_URL=https://your-domain.com/template
```

**Tenant Configuration**
```bash
# Use common endpoint for multi-tenant
export AZURE_AD_TENANT_ID=common

# Or use specific tenant ID
export AZURE_AD_TENANT_ID=your-tenant-id

# Test tenant endpoint
curl "https://login.microsoftonline.com/$AZURE_AD_TENANT_ID/v2.0/.well-known/openid_configuration"
```

**Token Issues**
```bash
# Clear browser cookies and localStorage
# In browser console:
localStorage.clear();
# Reload page

# Regenerate NEXTAUTH_SECRET
openssl rand -base64 32

# Restart application
pm2 restart vvg-template
```

### Session/JWT Issues

#### Symptoms
- Random logouts
- "JWT malformed" errors
- Session not persisting

#### Solutions

**JWT Secret Issues**
```bash
# Ensure NEXTAUTH_SECRET is set and stable
grep NEXTAUTH_SECRET .env.local

# Generate new secret if needed
openssl rand -base64 32

# Restart app after changing secret
pm2 restart vvg-template --update-env
```

**Clock Skew Issues**
```bash
# Sync system time
sudo ntpdate -s time.nist.gov

# Or use systemd-timesyncd
sudo systemctl restart systemd-timesyncd

# Check system time
date
```

## 📁 File Storage Issues

### Upload Failures

#### Symptoms
- "File too large" errors
- "Permission denied" errors
- S3 access errors

#### Solutions

**File Size Limits**
```bash
# Check NGINX client_max_body_size
grep client_max_body_size /etc/nginx/sites-available/vvg-template

# Update NGINX configuration
sudo sed -i 's/client_max_body_size.*/client_max_body_size 20M;/' /etc/nginx/sites-available/vvg-template
sudo systemctl reload nginx

# Check application limits in .env
grep MAX_FILE_SIZE .env*
```

**Local Storage Issues**
```bash
# Check upload directory permissions
ls -la /tmp/uploads/

# Create directory if missing
mkdir -p /tmp/uploads
chmod 755 /tmp/uploads

# Check disk space
df -h /tmp
```

**S3 Access Issues**
```bash
# Test S3 connectivity
aws s3 ls s3://your-bucket-name/

# Check IAM permissions
aws iam get-role-policy --role-name EC2-S3-Access-Role --policy-name S3-Access-Policy

# Test S3 upload manually
aws s3 cp test.txt s3://your-bucket-name/test.txt
```

## 🌐 NGINX/Proxy Issues

### 502 Bad Gateway

#### Symptoms
- NGINX returns 502 error
- Cannot reach application

#### Diagnosis
```bash
# Check NGINX error logs
sudo tail -f /var/log/nginx/error.log

# Check upstream application
curl http://localhost:3000/template/api/health

# Check NGINX configuration
sudo nginx -t
```

#### Solutions

**Application Not Running**
```bash
# Check application status
pm2 status

# Start application if stopped
pm2 start ecosystem.config.js --env production

# Check application logs
pm2 logs vvg-template
```

**NGINX Configuration Issues**
```bash
# Verify upstream configuration
grep -A 10 "upstream" /etc/nginx/sites-available/vvg-template

# Check proxy settings
grep -A 5 "proxy_pass" /etc/nginx/sites-available/vvg-template

# Test configuration
sudo nginx -t

# Reload if valid
sudo systemctl reload nginx
```

### SSL/HTTPS Issues

#### Symptoms
- SSL certificate errors
- Mixed content warnings
- HTTPS redirects failing

#### Solutions

**Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

**Mixed Content Issues**
```bash
# Ensure all URLs use HTTPS in .env
grep -E "URL=" .env*

# Check for hardcoded HTTP URLs in code
grep -r "http://" app/ lib/ components/

# Update Content Security Policy
grep -A 5 "Content-Security-Policy" /etc/nginx/sites-available/vvg-template
```

## 🐳 Docker Issues

### Container Won't Start

#### Symptoms
- Container exits immediately
- Build failures
- Permission errors

#### Solutions

**Container Logs**
```bash
# Check container logs
docker-compose logs app

# Inspect failed container
docker-compose ps
docker logs container-id

# Check container health
docker-compose exec app sh
```

**Build Issues**
```bash
# Clean build
docker-compose down --volumes --remove-orphans
docker system prune -f
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -t test .
```

**Permission Issues**
```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Check Docker permissions
sudo usermod -aG docker $USER
newgrp docker

# Restart Docker service
sudo systemctl restart docker
```

## 📊 Performance Issues

### Slow Response Times

#### Diagnosis
```bash
# Check system resources
htop
iostat 1
sar -u 1 10

# Check application performance
curl -w "@curl-format.txt" -s -o /dev/null https://your-domain.com/template/api/health

# Database performance
mysql -e "SHOW PROCESSLIST;"
mysql -e "SHOW STATUS LIKE 'Threads_connected';"
```

#### Solutions

**Resource Constraints**
```bash
# Increase instance size (AWS)
# Scale vertically or horizontally

# Optimize Node.js memory
export NODE_OPTIONS="--max-old-space-size=2048"

# Enable PM2 cluster mode
pm2 start ecosystem.config.js --env production -i max
```

**Database Optimization**
```sql
-- Check slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Analyze query performance
EXPLAIN SELECT * FROM documents WHERE user_email = 'user@example.com';

-- Add indexes if needed
CREATE INDEX idx_user_email ON documents(user_email);
```

## 🆘 Emergency Procedures

### Quick Rollback
```bash
# Rollback application
git checkout previous-stable-tag
npm run build
pm2 restart vvg-template

# Rollback database (if needed)
npm run db:migrate:down

# Rollback with Docker
docker-compose down
docker-compose -f docker-compose.previous.yml up -d
```

### Emergency Restart
```bash
# Restart all services
sudo systemctl restart nginx
pm2 restart all

# Or with Docker
docker-compose restart

# Restart system if needed
sudo reboot
```

### Emergency Contacts
- **Technical Lead**: [contact-info]
- **Infrastructure Team**: [contact-info]
- **24/7 Support**: [contact-info]

---

**Need more help?** Check the [deployment overview](overview.md) or create an issue on GitHub.