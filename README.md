# NDA Analyzer

AI-powered legal document analysis tool for comparing Non-Disclosure Agreements.

## Overview

Web application that allows users to upload NDAs, compare them against standard templates, and receive AI-generated suggestions for alignment.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development server
npm run dev
```

## Documentation

- **Architecture & Design**: [`project.md`](project.md)
- **Implementation Guide**: [`claude.md`](claude.md)  
- **Current Status**: [`docs/DEPLOYMENT_STATUS.md`](docs/DEPLOYMENT_STATUS.md)
- **Development Roadmap**: [`docs/MVP_ROADMAP.md`](docs/MVP_ROADMAP.md)
- **Requirements**: [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md)

## Tech Stack

- **Frontend**: Next.js 15.2.4 with TypeScript
- **Auth**: Azure AD via NextAuth
- **Database**: MySQL (AWS RDS)
- **Storage**: AWS S3
- **AI**: OpenAI GPT-4 (planned)
- **Deployment**: EC2 + NGINX + PM2

## Status

Currently in MVP development. See [deployment status](docs/DEPLOYMENT_STATUS.md) for details on blockers and progress.

## License

Proprietary - VVG Internal Use Only