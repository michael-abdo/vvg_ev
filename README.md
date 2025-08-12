# Document Processing Template

A production-ready Next.js template for document processing applications with upload, AI analysis, and management features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and add your secrets
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000/template` to access the application.

## ✨ Features

- **Document Upload & Processing** - PDF, DOCX, TXT support with AI-powered extraction
- **AI-Powered Analysis** - Compare documents using OpenAI GPT models
- **Secure Authentication** - Azure AD integration with role-based access
- **Cloud Storage** - AWS S3 with local development fallback
- **Production Ready** - Comprehensive logging, error handling, and monitoring
- **Docker Support** - Complete containerization for easy deployment

## 📖 Documentation

- **[Getting Started](docs/getting-started/)** - Installation, configuration, and first deployment
- **[Deployment Guide](docs/deployment/)** - Production deployment instructions
- **[Development Guide](docs/development/)** - Development setup and workflow
- **[API Reference](docs/api/)** - Complete API documentation
- **[Architecture Overview](docs/architecture/)** - System design and technical details

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: MySQL with connection pooling
- **Storage**: AWS S3 / Local filesystem
- **AI**: OpenAI GPT integration
- **Infrastructure**: Docker, NGINX, PM2

## 🔧 Development Commands

```bash
npm run dev              # Start development server
npm run dev:seed         # Start with test data seeded
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linting
npm run db:migrate       # Run database migrations
```

## 📦 Deployment

### Quick Deploy with Docker

```bash
# Build and run
docker-compose up -d

# Or for production
docker-compose -f docker-compose.production.yml up -d
```

### Manual Deployment

See [Deployment Guide](docs/deployment/overview.md) for detailed instructions.

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🔒 Security

Security issues should be reported according to our [Security Policy](SECURITY.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Create an issue on GitHub
- **Questions**: Reach out to the development team

---

**Note**: This template uses Next.js basePath configuration. All URLs will be prefixed with `/template` (e.g., `http://localhost:3000/template/dashboard`). This enables multi-app deployments on the same domain.