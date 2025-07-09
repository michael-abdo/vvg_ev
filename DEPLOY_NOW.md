# URGENT: Deploy the API Fix to EC2

The application on EC2 is still running the OLD code that tries to call `/api/upload`. 
You need to deploy the NEW code that calls `/nda-analyzer/api/upload`.

## Quick Deploy Command (Run this on EC2):

```bash
cd /home/ubuntu/nda-analyzer && \
git fetch origin && \
git checkout main-frontend-debug && \
git pull origin main-frontend-debug && \
docker build -t nda-analyzer:latest . && \
docker stop nda-analyzer && \
docker rm nda-analyzer && \
docker run -d \
  --name nda-analyzer \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  nda-analyzer:latest
```

## Or Step by Step:

1. **Connect to EC2:**
   ```bash
   ssh ubuntu@legal.vtc.systems
   # OR use AWS SSM Session Manager
   ```

2. **Navigate to project:**
   ```bash
   cd /home/ubuntu/nda-analyzer
   ```

3. **Pull latest fixes:**
   ```bash
   git fetch origin
   git checkout main-frontend-debug
   git pull origin main-frontend-debug
   ```

4. **Build and deploy:**
   ```bash
   docker build -t nda-analyzer:latest .
   docker stop nda-analyzer
   docker rm nda-analyzer
   docker run -d --name nda-analyzer -p 3000:3000 --env-file .env.production --restart unless-stopped nda-analyzer:latest
   ```

## What This Fixes:
- Changes `/api/upload` → `/nda-analyzer/api/upload` in the frontend
- Fixes all other API calls to use the correct basePath
- Resolves the 404 errors you're seeing

The fix is ready in the `main-frontend-debug` branch - it just needs to be deployed!