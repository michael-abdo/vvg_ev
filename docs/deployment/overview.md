# Deployment Overview

This guide provides a comprehensive overview of deploying the Document Processing Template across different environments.

## 🚀 Quick Deployment Options

### Option 1: Docker (Recommended)
```bash
# Production deployment with Docker
docker-compose -f docker-compose.production.yml up -d
```

### Option 2: Traditional Server
```bash
# Build and deploy to server
npm run build
pm2 start ecosystem.config.js --env production
```

### Option 3: Cloud Platforms
- AWS EC2 with Docker
- Azure Container Instances
- Google Cloud Run

## 📋 Deployment Checklist

### Pre-Deployment Requirements

- [ ] **Environment Variables**: All required secrets configured
- [ ] **Database**: MySQL instance accessible and migrated
- [ ] **Storage**: S3 bucket or local storage configured
- [ ] **Authentication**: Azure AD app registration completed
- [ ] **Domain**: SSL certificate and DNS configured
- [ ] **Resources**: Adequate server resources allocated

### Security Checklist

- [ ] **HTTPS**: SSL/TLS certificates installed
- [ ] **Firewall**: Only required ports open (80, 443, SSH)
- [ ] **Secrets**: No secrets in code or logs
- [ ] **Database**: Secure connection with limited user permissions
- [ ] **Storage**: S3 bucket policies restrict access
- [ ] **Updates**: System and dependencies up to date

## 🌍 Environment Strategy

### Development
- **URL**: `http://localhost:3000/template`
- **Database**: Local MySQL or development instance
- **Storage**: Local filesystem (`/tmp/uploads`)
- **Auth**: Development Azure AD app

### Staging
- **URL**: `https://your-domain.com:8443/template-staging`
- **Database**: Staging MySQL instance
- **Storage**: Staging S3 bucket
- **Auth**: Staging Azure AD app

### Production
- **URL**: `https://your-domain.com/template`
- **Database**: Production MySQL with backups
- **Storage**: Production S3 bucket with versioning
- **Auth**: Production Azure AD app

## 🔧 Configuration Files

### Environment Files
```
.env                    # Base configuration (committed)
.env.production        # Production overrides (committed)
.env.local            # Secrets (gitignored)
```

### Docker Configuration
```
docker-compose.yml           # Development
docker-compose.production.yml # Production
Dockerfile                   # Application container
```

### NGINX Configuration
```
deployment/nginx.vvg-template-enhanced.conf  # Complete reverse proxy setup
```

### Process Management
```
ecosystem.config.js          # PM2 configuration
ecosystem.docker.config.js   # Docker PM2 configuration
```

## 📊 Resource Requirements

### Minimum Requirements
- **CPU**: 1 vCPU
- **RAM**: 1GB
- **Storage**: 10GB
- **Bandwidth**: 100Mbps

### Recommended Production
- **CPU**: 2+ vCPUs
- **RAM**: 4GB+
- **Storage**: 50GB+ (depends on document volume)
- **Bandwidth**: 1Gbps

### Database Requirements
- **MySQL**: 5.7+ or 8.0+
- **Storage**: 20GB+ for documents metadata
- **Connections**: 100+ concurrent connections

## 🔍 Health Checks

### Application Health
```bash
# Check application status
curl https://your-domain.com/template/api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

### Database Health
```bash
# Check database connectivity
curl https://your-domain.com/template/api/db-health

# Expected response
{
  "database": "connected",
  "tablesExist": true,
  "migrationStatus": "up-to-date"
}
```

### Storage Health
```bash
# Check storage connectivity
curl https://your-domain.com/template/api/storage-health

# Expected response
{
  "storage": "s3",
  "accessible": true,
  "permissions": "read-write"
}
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs vvg-template

# Check environment variables
node -e "console.log(process.env.NODE_ENV)"

# Verify port availability
netstat -tlnp | grep :3000
```

#### Authentication Issues
```bash
# Verify Azure AD configuration
curl -X POST https://your-domain.com/template/api/auth/signin

# Check NextAuth configuration
grep NEXTAUTH_ .env.local
```

#### Database Connection Issues
```bash
# Test database connectivity
mysql -h <host> -u <user> -p<password> <database>

# Check migration status
npm run db:migrate:status
```

#### File Upload Issues
```bash
# Check storage configuration
aws s3 ls s3://your-bucket-name/

# Verify file permissions
ls -la /tmp/uploads/
```

## 📚 Next Steps

1. **[Docker Deployment](docker.md)** - Containerized deployment guide
2. **[AWS EC2 Deployment](aws-ec2.md)** - Traditional server deployment
3. **[Troubleshooting Guide](troubleshooting.md)** - Common issues and solutions

## 🆘 Emergency Procedures

### Rollback Deployment
```bash
# Quick rollback with Docker
docker-compose down
docker-compose -f docker-compose.previous.yml up -d

# PM2 rollback
pm2 reload ecosystem.config.js --env production
```

### Emergency Contacts
- **Technical Lead**: [contact-info]
- **Infrastructure Team**: [contact-info]
- **Emergency Escalation**: [contact-info]

---

**Last Updated**: [Current Date]  
**Next Review**: [Next Review Date]