# Installation Guide

Get the Document Processing Template up and running in minutes.

## 🎯 Prerequisites

### System Requirements
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **MySQL**: 5.7 or 8.0+
- **Git**: Latest version

### Optional Requirements
- **Docker**: For containerized development
- **AWS CLI**: For S3 storage integration
- **Azure CLI**: For Azure AD setup

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-org/vvg_template.git
cd vvg_template
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Generate authentication secret
openssl rand -base64 32
# Add the output to NEXTAUTH_SECRET in .env.local
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000/template` to see the application.

## 📝 Environment Configuration

### Required Environment Variables

Edit `.env.local` with your configuration:

```bash
# Authentication (Required)
NEXTAUTH_SECRET=your-generated-secret-here
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-tenant-id

# Database (Required)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your-db-user
MYSQL_PASSWORD=your-db-password
MYSQL_DATABASE=vvg_template

# Storage (Optional - defaults to local)
STORAGE_PROVIDER=local
# For S3:
# STORAGE_PROVIDER=s3
# AWS_ACCESS_KEY_ID=your-aws-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret
# S3_BUCKET_NAME=your-bucket
# S3_REGION=us-west-2

# AI Features (Optional)
OPENAI_API_KEY=your-openai-key
```

### Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: VVG Template
   - **Supported account types**: Accounts in your organizational directory
   - **Redirect URI**: `http://localhost:3000/template/api/auth/callback/azure-ad`
5. After creation, note the **Application (client) ID** and **Directory (tenant) ID**
6. Go to **Certificates & secrets** → **New client secret**
7. Copy the secret value immediately

## 🗄️ Database Setup

### Option 1: Local MySQL
```bash
# Install MySQL (Ubuntu/Debian)
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation

# Create database and user
mysql -u root -p
```

```sql
CREATE DATABASE vvg_template;
CREATE USER 'vvg_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON vvg_template.* TO 'vvg_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Option 2: Docker MySQL
```bash
# Start MySQL container
docker run --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=vvg_template \
  -e MYSQL_USER=vvg_user \
  -e MYSQL_PASSWORD=secure_password \
  -p 3306:3306 \
  -d mysql:8.0

# Verify connection
mysql -h 127.0.0.1 -u vvg_user -p vvg_template
```

### Option 3: Cloud Database
For production, use managed database services:
- **AWS RDS MySQL**
- **Azure Database for MySQL**
- **Google Cloud SQL**

## 🔄 Database Migration

```bash
# Run database migrations
npm run db:migrate

# Verify migration status
npm run db:migrate:status

# Seed development data (optional)
npm run db:seed
```

## 🧪 Verify Installation

### Health Checks
```bash
# Application health
curl http://localhost:3000/template/api/health

# Database connectivity
curl http://localhost:3000/template/api/db-health

# Storage health
curl http://localhost:3000/template/api/storage-health
```

### Test Data
```bash
# Start with test documents
npm run dev:seed

# Or manually seed data
npm run db:seed
```

## 🐳 Docker Installation (Alternative)

### Development with Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access application at http://localhost:3000/template
```

### Docker Environment
Create `docker-compose.override.yml`:
```yaml
version: '3.8'
services:
  app:
    environment:
      - NODE_ENV=development
      - LOG_LEVEL=debug
    volumes:
      - .:/app
      - /app/node_modules
```

## 🔧 Development Tools

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-docker"
  ]
}
```

### Git Hooks (Optional)
```bash
# Install husky for git hooks
npm install --save-dev husky
npx husky install

# Pre-commit hooks
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-commit "npm run type-check"
```

## 🚨 Troubleshooting

### Common Issues

#### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

#### Permission Errors
```bash
# Fix npm permissions
sudo chown -R $USER ~/.npm
sudo chown -R $USER node_modules/

# Fix upload directory
mkdir -p /tmp/uploads
chmod 755 /tmp/uploads
```

#### Database Connection Errors
```bash
# Test MySQL connection
mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1"

# Check MySQL service
sudo systemctl status mysql

# Reset MySQL password if needed
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'newpassword';"
```

#### Azure AD Authentication Issues
- Verify redirect URI matches exactly: `http://localhost:3000/template/api/auth/callback/azure-ad`
- Check tenant ID and client ID are correct
- Ensure client secret hasn't expired
- Try using `common` as tenant ID for multi-tenant support

## 📚 Next Steps

1. **[Configuration Guide](configuration.md)** - Detailed configuration options
2. **[First Deployment](first-deployment.md)** - Deploy to production
3. **[Development Guide](../development/setup.md)** - Development workflow

## 🆘 Getting Help

- **Documentation**: Check the [docs](../) folder
- **Issues**: Create an issue on GitHub
- **Community**: Join our Discord/Slack channel
- **Email**: [support-email]

---

**Installation complete!** 🎉 You can now start developing with the Document Processing Template.