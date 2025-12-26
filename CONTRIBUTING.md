# FinYeld AI - Contributing Guide

Welcome to FinYeld AI! This guide outlines our development practices and how to contribute effectively.

---

## Git Workflow

### Branch Structure

- **main** - Production code (protected, requires PR)
- **develop** - Integration branch for features
- **feature/** - New features
- **bugfix/** - Bug fixes
- **hotfix/** - Critical production fixes

### Branch Naming Convention

```
feature/PLT-123-add-burn-rate-calculation
bugfix/PLT-456-fix-date-timezone-issue
hotfix/PLT-789-critical-security-patch
```

---

## Commit Messages (Conventional Commits)

Format: `type: description`

| Type       | Use Case                    |
| ---------- | --------------------------- |
| `feat`     | New feature                 |
| `fix`      | Bug fix                     |
| `docs`     | Documentation               |
| `refactor` | Code refactoring            |
| `test`     | Adding tests                |
| `chore`    | Maintenance tasks           |
| `style`    | Formatting (no code change) |
| `perf`     | Performance improvement     |

**Examples:**

```
feat: add revenue forecasting API endpoint
fix: resolve duplicate transaction bug
docs: update API documentation
refactor: optimize database queries
test: add unit tests for forecast model
chore: upgrade Next.js to v14.2
```

---

## Pull Request Process

1. **Create PR** with detailed description
2. **Link tickets** (e.g., "Closes PLT-123")
3. **Request review** from 2 team members
4. **Pass CI/CD** - All tests must pass
5. **Get approval** before merging
6. **Squash and merge** to develop

### PR Template Checklist

- [ ] Code follows style guide
- [ ] Tests cover new functionality (>80% coverage)
- [ ] No console.logs or debugging code
- [ ] Security vulnerabilities addressed
- [ ] Performance optimized
- [ ] Documentation updated

---

## Development Setup

```bash
# Clone repository
git clone https://github.com/popanda44/seedvalidator-finance.git
cd seedvalidator-finance

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## Testing

### Testing Pyramid

- **70%** Unit Tests (functions, components)
- **20%** Integration Tests (API endpoints)
- **10%** E2E Tests (critical user flows)

### Commands

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- path/to/test.ts
```

### Tools

- **Unit**: Jest + React Testing Library
- **Integration**: Supertest for APIs
- **E2E**: Playwright

---

## Code Style

### ESLint & Prettier

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Key Rules

- Use TypeScript strict mode
- No `any` types (use proper typing)
- Export default for pages, named for utilities
- Use `cn()` for conditional classNames

---

## CI/CD Pipeline

1. **Lint & Format** - ESLint, Prettier
2. **Unit Tests** - Jest with coverage
3. **E2E Tests** - Playwright
4. **Security Scan** - npm audit
5. **Build** - Next.js production build
6. **Deploy Staging** - on develop branch
7. **Deploy Production** - on main branch

---

## Review Checklist

Before requesting review:

- [ ] Self-reviewed the code
- [ ] Ran tests locally
- [ ] Updated documentation
- [ ] No linting errors
- [ ] Meaningful commit messages

---

## Support

- **Issues**: GitHub Issues
- **Email**: hello@finyeld.ai
