# Environment Management - Industry Standard Setup

This project follows 2024 industry best practices for managing multiple environments in Next.js.

## Structure

```
project/
├── .env                    # Base configuration (source of truth)
├── env/                    # Environment-specific overrides
│   ├── .env.staging
│   └── .env.production
└── package.json           # Scripts using env-cmd
```

## Key Principles

1. **`.env` is the single source of truth** - Contains all default values
2. **Environment files only contain overrides** - Only values that differ from `.env`
3. **Files kept outside root** - Prevents Next.js auto-loading conflicts
4. **Using env-cmd** - Industry standard tool for environment management

## Usage

### Development
```bash
npm run dev
```

### Staging
```bash
# Build for staging
npm run build:staging

# Start staging server
npm run start:staging
```

### Production
```bash
# Build for production
npm run build:production

# Start production server
npm run start:production
```

## How It Works

1. `env-cmd` loads `.env` first (all defaults)
2. Then loads environment-specific file (e.g., `env/.env.staging`)
3. Environment-specific values override defaults
4. Next.js receives the merged configuration

## Why This Approach?

- **Industry Standard**: Used by major companies and recommended in Next.js discussions
- **Clean Separation**: Environment configs don't interfere with each other
- **Single Source of Truth**: `.env` contains all possible configurations
- **DRY Principle**: No duplication of values across environment files
- **Tool Support**: Works with Docker, CI/CD, and deployment platforms

## Alternative Approaches (Not Recommended)

1. **Multiple builds with file swapping** - Goes against "build once, deploy anywhere"
2. **Runtime configuration** - Better for containerized deployments but more complex
3. **Root-level .env files** - Causes conflicts with Next.js auto-loading

## Security Note

Never commit sensitive values to git. Use placeholder values and inject real values during deployment.