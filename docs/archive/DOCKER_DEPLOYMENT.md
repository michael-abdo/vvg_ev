# Docker Deployment Guide with PM2 & Nginx

This guide covers deploying the VVG Template using Docker with PM2 process management inside containers and Nginx as a reverse proxy.

## Related Guides

- **Manual EC2 Deployment**: See [EC2_SSM_DEPLOYMENT.md](deployment/EC2_SSM_DEPLOYMENT.md) for step-by-step manual deployment via SSM sessions

## Architecture

```
Internet → Nginx (80/443) → Docker Container (PM2 → Next.js App)
```

## Local Development

### Running with Docker Compose

```bash
# Standard development
docker-compose up

# Production mode locally
docker-compose -f docker-compose.prod.yml up
```

### Running Multiple Instances

```bash
# Instance 1 on port 3000
PORT=3000 docker-compose up

# Instance 2 on port 3001  
PORT=3001 docker-compose -p project2 up
```

## Production Deployment to EC2

### Prerequisites

1. EC2 instance with SSM Agent installed
2. S3 bucket for deployment artifacts
3. AWS CLI configured locally
4. IAM permissions for SSM and S3

### Initial EC2 Setup

1. Copy setup script to EC2:
```bash
aws ssm send-command \
  --instance-ids i-1234567890abcdef0 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["curl -o /tmp/setup.sh https://raw.githubusercontent.com/yourrepo/scripts/setup-ec2-docker.sh && chmod +x /tmp/setup.sh && /tmp/setup.sh"]'
```

2. Or manually via SSM Session:
```bash
aws ssm start-session --target i-1234567890abcdef0
# Then run the setup script
```

### Deployment Process

1. Create production environment file:
```bash
cp .env.example .env.production
# Edit .env.production with your production values
```

2. Deploy with required environment variables:
```bash
EC2_INSTANCE_ID="i-your-instance-id" \
S3_DEPLOYMENT_BUCKET="your-deployment-bucket" \
./scripts/deploy-to-ec2.sh
```

Or export them first:
```bash
export EC2_INSTANCE_ID="i-your-instance-id"
export S3_DEPLOYMENT_BUCKET="your-deployment-bucket"
./scripts/deploy-to-ec2.sh
```

## Docker Configuration Details

### PM2 Inside Docker

The Dockerfile includes PM2 for:
- Process management
- Auto-restart on crashes
- Memory limit monitoring
- JSON logging
- Health checks

PM2 configuration (`ecosystem.docker.config.js`):
- Max memory: 1GB
- Auto-restart: Yes
- Log rotation: Built-in
- Health endpoint monitoring

### Nginx Features

- Rate limiting (10 req/s for API, 30 req/s general)
- Static asset caching
- Gzip compression
- Security headers
- Health check endpoint
- SSL/TLS ready

## Monitoring

### View Logs via SSM

```bash
# Connect to instance
aws ssm start-session --target ${INSTANCE_ID}

# View Docker logs
docker-compose -f docker-compose.prod.yml logs -f

# View PM2 logs inside container
docker exec vvg-app pm2 logs

# View Nginx logs
docker logs vvg-nginx
```

### Health Checks

- App health: `http://your-domain/api/health`
- Nginx health: `http://your-domain/nginx-health`

## Troubleshooting

### Container Issues

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Restart containers
docker-compose -f docker-compose.prod.yml restart

# View PM2 status inside container
docker exec vvg-app pm2 status
```

### Memory Issues

```bash
# Check memory usage
docker stats

# Increase PM2 memory limit in ecosystem.docker.config.js
max_memory_restart: '2G'  # Increase from 1G to 2G
```

## SSL Configuration

1. Obtain SSL certificates
2. Place in `nginx/ssl/` directory
3. Uncomment HTTPS section in `nginx/conf.d/vvg-template.conf`
4. Redeploy with `./scripts/deploy-to-ec2.sh`

## Backup and Recovery

### Backup Application Data

```bash
# On EC2
cd /home/ubuntu/vvg-template
tar -czf backup-$(date +%Y%m%d).tar.gz storage/ logs/
aws s3 cp backup-*.tar.gz s3://your-backup-bucket/
```

### Restore from Backup

```bash
# Download backup
aws s3 cp s3://your-backup-bucket/backup-20240115.tar.gz .

# Stop containers
docker-compose -f docker-compose.prod.yml down

# Restore data
tar -xzf backup-20240115.tar.gz

# Start containers
docker-compose -f docker-compose.prod.yml up -d
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.production`
2. **Firewall**: Only ports 80/443 open to public
3. **SSM Access**: Use IAM roles, not SSH keys
4. **Updates**: Regularly update base images
5. **Secrets**: Use AWS Secrets Manager for sensitive data

## Performance Tuning

### Nginx Optimization

- Adjust worker_connections based on load
- Enable HTTP/2 for better performance
- Configure caching headers appropriately

### PM2 Optimization

- Set instances based on CPU cores
- Configure cluster mode for multi-core
- Adjust memory limits based on instance type

### Docker Optimization

- Use multi-stage builds (already implemented)
- Minimize image layers
- Use .dockerignore to exclude unnecessary files