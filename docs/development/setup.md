# Development Setup

Set up your development environment for the Document Processing Template.

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/your-org/vvg_template.git
cd vvg_template
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev
```

## 🛠️ Development Tools

### Required Tools
- **Node.js**: 18.0+ ([Download](https://nodejs.org/))
- **npm**: 9.0+ (comes with Node.js)
- **Git**: Latest version
- **MySQL**: 8.0+ or Docker
- **Code Editor**: VS Code recommended

### Recommended Tools
- **Docker**: For consistent development environment
- **Postman**: For API testing
- **MySQL Workbench**: For database management
- **AWS CLI**: For S3 integration testing

## 🔧 IDE Configuration

### VS Code Setup

#### Recommended Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-docker",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "([\"'`][^\"'`]*.*?[\"'`])"]
  ]
}
```

#### Workspace Configuration
Create `.vscode/settings.json`:
```json
{
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true,
    "**/logs": true
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.next/**": true
  }
}
```

## 🐳 Docker Development

### Using Docker Compose
```bash
# Start all services including database
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up -d --build

# Stop services
docker-compose down
```

### Custom Docker Compose
Create `docker-compose.override.yml`:
```yaml
version: '3.8'
services:
  app:
    environment:
      - LOG_LEVEL=debug
      - DEBUG=true
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug port
    
  mysql:
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=devpassword
      - MYSQL_DATABASE=vvg_template_dev
```

## 📝 Environment Configuration

### Development Environment
```bash
# .env.local for development
NODE_ENV=development
BASE_PATH=/template
NEXT_PUBLIC_BASE_PATH=/template

# URLs
NEXTAUTH_URL=http://localhost:3000/template
APP_URL=http://localhost:3000/template

# Database (local)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=dev_user
MYSQL_PASSWORD=dev_password
MYSQL_DATABASE=vvg_template_dev

# Storage (local development)
STORAGE_PROVIDER=local
LOCAL_UPLOAD_DIR=/tmp/uploads

# Development features
DEBUG=true
LOG_LEVEL=debug
HOT_RELOAD=true
MOCK_EXTERNAL_APIS=false
```

### Azure AD Development App
Create a separate Azure AD app for development:
1. **Redirect URI**: `http://localhost:3000/template/api/auth/callback/azure-ad`
2. **Logout URL**: `http://localhost:3000/template`
3. **Front-channel logout URL**: `http://localhost:3000/template/auth/signout`

## 🗄️ Database Development

### Local MySQL Setup
```bash
# Install MySQL (Ubuntu/Debian)
sudo apt install mysql-server

# Secure installation
sudo mysql_secure_installation

# Create development database
mysql -u root -p
```

```sql
CREATE DATABASE vvg_template_dev;
CREATE USER 'dev_user'@'localhost' IDENTIFIED BY 'dev_password';
GRANT ALL PRIVILEGES ON vvg_template_dev.* TO 'dev_user'@'localhost';
FLUSH PRIVILEGES;
```

### Docker MySQL
```bash
# Start MySQL in Docker
docker run --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=vvg_template_dev \
  -e MYSQL_USER=dev_user \
  -e MYSQL_PASSWORD=dev_password \
  -p 3306:3306 \
  -d mysql:8.0
```

### Database Migration
```bash
# Run migrations
npm run db:migrate

# Create new migration
npm run db:create-migration -- --name add_new_feature

# Rollback migration
npm run db:migrate:down

# Reset database (development only)
npm run db:reset
```

## 🧪 Development Workflow

### Starting Development
```bash
# Clean start
npm run dev:clean

# Start with hot reload
npm run dev

# Start with test data
npm run dev:seed

# Start with debugging
npm run dev:debug
```

### Code Quality
```bash
# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Testing
npm test
npm run test:watch
npm run test:coverage

# Build verification
npm run build
```

### Development Scripts
```bash
# Available scripts
npm run dev              # Start development server
npm run dev:clean        # Clean start (kill port conflicts)
npm run dev:seed         # Start with test data
npm run dev:debug        # Start with Node.js debugger
npm run build            # Production build
npm run start            # Start production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run type-check       # TypeScript type checking
npm test                 # Run tests
npm run test:watch       # Watch mode testing
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed development data
```

## 🔍 Debugging

### Node.js Debugging
```bash
# Start with Node.js debugger
npm run dev:debug

# Or use VS Code launch configuration
# .vscode/launch.json:
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Browser Debugging
```bash
# Enable React DevTools
# Install: React Developer Tools browser extension

# Enable verbose logging
LOG_LEVEL=debug npm run dev

# Network debugging
# Use browser DevTools Network tab
```

### Database Debugging
```bash
# Enable SQL query logging
MYSQL_DEBUG=true npm run dev

# Direct database access
mysql -h localhost -u dev_user -p vvg_template_dev

# Monitor database queries
sudo tail -f /var/log/mysql/mysql.log
```

## 🧪 Testing Setup

### Test Configuration
```bash
# Install testing dependencies (already included)
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Create test database
mysql -u root -p -e "CREATE DATABASE vvg_template_test;"
```

### Environment for Testing
```bash
# .env.test
NODE_ENV=test
MYSQL_DATABASE=vvg_template_test
STORAGE_PROVIDER=local
MOCK_EXTERNAL_APIS=true
```

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📁 Project Structure Understanding

### Key Directories
```
vvg_template/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Auth pages
│   └── (dashboard)/       # Protected pages
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── [feature]/        # Feature-specific components
├── lib/                   # Utility libraries
│   ├── auth-utils.ts     # Authentication utilities
│   ├── config.ts         # Configuration management
│   ├── db.ts             # Database connection
│   └── utils.ts          # General utilities
├── types/                 # TypeScript type definitions
├── public/                # Static assets
├── scripts/               # Build and utility scripts
└── docs/                  # Documentation
```

### Important Files
- **`app/layout.tsx`**: Root layout with providers
- **`lib/auth-options.ts`**: NextAuth.js configuration
- **`middleware.ts`**: Route protection middleware
- **`next.config.mjs`**: Next.js configuration
- **`tailwind.config.ts`**: Tailwind CSS configuration

## 🔄 Git Workflow

### Branch Strategy
```bash
# Main branches
main                    # Production-ready code
develop                 # Development integration

# Feature branches
feature/document-upload
feature/ai-comparison
feature/user-management

# Hotfix branches
hotfix/security-patch
hotfix/critical-bug
```

### Commit Convention
```bash
# Use Conventional Commits
feat: add document comparison feature
fix: resolve authentication token issue
docs: update API documentation
style: format code with prettier
refactor: consolidate error handling
test: add unit tests for upload
chore: update dependencies
```

### Pre-commit Hooks
```bash
# Install husky (optional)
npm install --save-dev husky lint-staged

# Setup pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npm run lint-staged"

# Configure lint-staged in package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{md,json}": ["prettier --write"]
  }
}
```

## 🚀 Performance Optimization

### Development Performance
```bash
# Enable Fast Refresh
# (Enabled by default in Next.js)

# Optimize bundle analysis
npm run build:analyze

# Memory usage optimization
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Database Performance
```sql
-- Add indexes for development queries
CREATE INDEX idx_documents_user_email ON documents(user_email);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_comparisons_status ON comparisons(status);
```

## 🔧 Troubleshooting Development

### Common Issues

#### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use the clean script
npm run dev:clean
```

#### Module Resolution Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
```

#### TypeScript Errors
```bash
# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Check TypeScript configuration
npx tsc --noEmit

# Update TypeScript
npm install --save-dev typescript@latest
```

#### Database Connection Issues
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -h localhost -u dev_user -p

# Check environment variables
echo $MYSQL_HOST $MYSQL_USER $MYSQL_DATABASE
```

### Development Tips

1. **Hot Reload**: Changes to components and pages reload automatically
2. **API Routes**: Changes to API routes require manual refresh
3. **Environment Variables**: Restart server after changing .env files
4. **Database Schema**: Run migrations after pulling schema changes
5. **Dependencies**: Run `npm install` after pulling package.json changes

## 📚 Next Steps

1. **[Testing Guide](testing.md)** - Comprehensive testing strategies
2. **[API Development](../api/reference.md)** - API development guide
3. **[Deployment](../deployment/overview.md)** - Deploy to production

---

**Happy coding!** 🚀 Your development environment is ready.