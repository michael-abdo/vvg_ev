# NDA Analyzer

AI-powered legal document analysis tool for comparing Non-Disclosure Agreements.

## 📍 Project Documentation

- **Architecture & Tech Stack**: See [`MASTER.md`](MASTER.md)
- **Current Status & Blockers**: See [`STATUS.md`](STATUS.md)
- **Deployment Guide**: See [`deployment/README.md`](deployment/README.md)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development server
npm run dev
```

## Environment Setup

```bash
# 1. Start SSM tunnel (required for database)
aws ssm start-session --target i-07fba3edeb2e54729 \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters host="vtcawsinnovationmysql01-cluster.cluster-c1hfshlb6czo.us-west-2.rds.amazonaws.com",portNumber="3306",localPortNumber="10003" \
  --profile vvg

# 2. Open new terminal for development
npm run dev
```

### Key Environment Variables
- `MYSQL_PASSWORD="Ei#qs9T!px@Wso"` (must be quoted!)
- `S3_BUCKET_NAME=vvg-cloud-storage`
- `S3_FOLDER_PREFIX=nda-analyzer/`

### Local Development URLs
- Application: http://localhost:3000
- Health Check: http://localhost:3000/api/db-health
- Storage Check: http://localhost:3000/api/storage-health

## License

Proprietary - VVG Internal Use Only