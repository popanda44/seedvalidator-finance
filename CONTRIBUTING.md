# Contributing to SeedValidator Finance

Thank you for contributing! Please follow these guidelines.

---

## 🌿 Git Workflow

### Branch Structure
| Branch | Purpose |
|--------|---------|
| `main` | Production code (protected) |
| `develop` | Integration branch |
| `feature/*` | New features |
| `bugfix/*` | Bug fixes |
| `hotfix/*` | Critical patches |

### Branch Naming
```
feature/PLT-123-add-burn-rate-calculation
bugfix/PLT-456-fix-date-timezone-issue
hotfix/PLT-789-critical-security-patch
```

---

## 📝 Commit Messages (Conventional Commits)

| Prefix | Use Case |
|--------|----------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `refactor:` | Code refactoring |
| `test:` | Adding tests |
| `chore:` | Maintenance |

**Examples:**
```
feat: add revenue forecasting API endpoint
fix: resolve duplicate transaction bug
docs: update API documentation
```

---

## 🔄 Pull Request Process

1. Create PR with detailed description
2. Link related issues (`Fixes #123`)
3. Request review from 2 team members
4. Pass all CI/CD checks
5. Get approval before merging
6. Squash and merge to `develop`

---

## ✅ Code Review Checklist

- [ ] Code follows ESLint/Prettier style guide
- [ ] Tests cover new functionality (>80% coverage)
- [ ] No console.logs or debugging code
- [ ] Security vulnerabilities addressed
- [ ] Performance optimized (no N+1 queries)
- [ ] Documentation updated

---

## 🧪 Testing

### Testing Pyramid
- 70% Unit Tests (functions, components)
- 20% Integration Tests (API endpoints)
- 10% E2E Tests (critical user flows)

### Commands
```bash
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests
npm run lint          # Lint code
npm run format        # Format code
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/popanda44/seedvalidator-finance.git
cd seedvalidator-finance

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run the dev server
npm run dev
```
