# Contributing Guide

Thank you for your interest in contributing to the Document Processing Template! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MySQL database
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/vvg_template.git
   cd vvg_template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style

- **TypeScript**: All new code must be written in TypeScript
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code formatting is enforced
- **Naming**: Use descriptive names for variables, functions, and components

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add document comparison feature
fix: resolve authentication token expiry issue
docs: update deployment guide
style: format code with prettier
refactor: consolidate API error handling
test: add integration tests for upload flow
chore: update dependencies
```

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Guidelines

- Write tests for new features and bug fixes
- Maintain or improve test coverage
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run lint
   npm run build
   npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a descriptive title
   - Provide a detailed description
   - Link to any related issues
   - Request review from maintainers

## 📋 Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's style guidelines
- [ ] Self-review of the code has been performed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding changes to documentation have been made
- [ ] Changes generate no new warnings or errors
- [ ] New and existing tests pass locally
- [ ] Any dependent changes have been merged and published

## 🐛 Bug Reports

When filing bug reports, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Environment details** (OS, Node.js version, etc.)
- **Screenshots** if applicable
- **Error messages** or logs

## 💡 Feature Requests

For feature requests, please provide:

- **Clear description** of the proposed feature
- **Use case** and motivation
- **Proposed implementation** (if you have ideas)
- **Potential alternatives** considered

## 🔧 Development Tips

### Environment Configuration

The project uses a three-tier environment setup:
- `.env` - Base configuration (committed)
- `.env.production` - Production overrides (committed)
- `.env.local` - Secrets and local dev overrides (gitignored)

### Database Migrations

```bash
# Create a new migration
npm run db:create-migration

# Run migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

### Debugging

- Use the built-in logging system: `lib/logger.ts`
- Enable debug mode: `LOG_LEVEL=debug npm run dev`
- Use browser dev tools for client-side debugging

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Project Architecture](docs/architecture/overview.md)

## ❓ Questions?

If you have questions that aren't covered in this guide:

1. Check the [documentation](docs/)
2. Search existing issues on GitHub
3. Create a new issue with the "question" label
4. Reach out to the maintainers

Thank you for contributing! 🎉