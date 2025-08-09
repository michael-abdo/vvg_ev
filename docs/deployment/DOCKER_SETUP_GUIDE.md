# 🐳 Docker Setup Guide - VVG Template

## Quick Start

1. **Install Docker Desktop**:
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop
   - Wait for the green "Docker Desktop is running" status

2. **Run the setup script**:
   ```bash
   ./docker-startup.sh
   ```

3. **Access your application**:
   - Open http://localhost:3000 in your browser
   - Use dev bypass authentication (no login required)

## What the Docker Setup Includes

✅ **Complete Docker Environment**:
- Clean, NDA-free codebase
- Next.js 15 with TypeScript
- Generic document processing template
- Local filesystem storage
- Development authentication bypass
- All necessary dependencies and runtime

✅ **Ready-to-Use Configuration**:
- Environment file (`.env.docker.local`)
- Docker Compose setup for development
- Production-ready Dockerfile
- Health checks and monitoring
- Persistent storage volume

## Manual Docker Commands

If you prefer to run Docker commands manually:

### Build the image:
```bash
docker-compose build
```

### Start the application:
```bash
docker-compose up -d
```

### View logs:
```bash
docker-compose logs -f
```

### Stop the application:
```bash
docker-compose down
```

### Rebuild and restart:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Environment Configuration

The Docker setup uses `.env.docker.local` with these key settings:

- **NODE_ENV**: `development`
- **Authentication**: Dev bypass enabled (no Azure AD required)
- **Database**: In-memory fallback (no MySQL required)
- **Storage**: Local filesystem (`./storage` directory)
- **Port**: 3000 (mapped to host port 3000)

## Customizing for Your Needs

### Enable Azure AD Authentication:
1. Edit `.env.docker.local`
2. Set `DEV_BYPASS_ENABLED=false`
3. Add your Azure AD credentials:
   ```env
   AZURE_AD_CLIENT_ID=your-client-id
   AZURE_AD_CLIENT_SECRET=your-client-secret
   AZURE_AD_TENANT_ID=your-tenant-id
   ```
4. Restart: `docker-compose restart`

### Connect to External Database:
1. Edit `.env.docker.local`
2. Set `DB_CREATE_ACCESS=true`
3. Update database credentials:
   ```env
   MYSQL_HOST=your-db-host
   MYSQL_USER=your-username
   MYSQL_PASSWORD=your-password
   MYSQL_DATABASE=your-database
   ```
4. Restart: `docker-compose restart`

### Enable S3 Storage:
1. Edit `.env.docker.local`
2. Set `STORAGE_PROVIDER=s3` and `S3_ACCESS=true`
3. Add AWS credentials:
   ```env
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET_NAME=your-bucket-name
   ```
4. Restart: `docker-compose restart`

## Troubleshooting

### Docker daemon not running:
```bash
# Start Docker Desktop app, or on Linux:
sudo systemctl start docker
```

### Build fails with out of space:
```bash
docker system prune -f
docker volume prune -f
```

### Port 3000 already in use:
```bash
# Stop any other services using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.yml:
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Container starts but app doesn't load:
```bash
# Check container logs:
docker-compose logs -f

# Check if container is running:
docker-compose ps

# Restart container:
docker-compose restart
```

### Build hangs or takes too long:
```bash
# Build with no cache:
docker-compose build --no-cache

# Check Docker Desktop resource settings:
# - Increase memory allocation (8GB+)
# - Increase CPU allocation (4 cores+)
```

## Production Deployment

For production deployment, use:
```bash
docker-compose -f docker-compose.production.yml up -d
```

Make sure to:
1. Create `.env.production.local` with production secrets
2. Configure proper authentication (disable dev bypass)
3. Set up external database and S3 storage
4. Use HTTPS and proper domain configuration

## Files Created

This Docker setup includes:
- `Dockerfile` - Multi-stage build configuration
- `docker-compose.yml` - Development compose file
- `docker-compose.production.yml` - Production compose file
- `.env.docker.local` - Docker development environment
- `docker-startup.sh` - Automated setup script
- `storage/` - Local file storage directory

## Next Steps

Once Docker is running:
1. 📄 **Upload documents** at http://localhost:3000/upload
2. 📊 **View documents** at http://localhost:3000/documents  
3. 🔍 **Compare documents** at http://localhost:3000/compare
4. 🏠 **Dashboard** at http://localhost:3000/dashboard

The template is now ready for customization to your specific document processing needs!