# Contributing to SeedValidator Finance

First off, thank you for considering contributing to SeedValidator Finance! It's people like you that make this project a great tool for the startup community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/seedvalidator-finance.git
   cd seedvalidator-finance
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/seedvalidator-finance.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title** describing the enhancement
- **Detailed description** of the proposed change
- **Use case** explaining why this would be useful
- **Possible implementation** if you have ideas

### Code Contributions

1. Look for issues labeled `good first issue` or `help wanted`
2. Comment on the issue to express interest
3. Wait for assignment before starting work
4. Follow the development workflow below

## Development Workflow

### Setting Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/runway-dashboard`)
- `fix/` - Bug fixes (e.g., `fix/calculation-error`)
- `docs/` - Documentation updates (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-module`)
- `test/` - Adding tests (e.g., `test/forecast-engine`)

## Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer functional components and hooks
- Use meaningful variable names

### CSS/Styling

- Use CSS Modules or Tailwind CSS
- Follow BEM naming convention for custom CSS
- Mobile-first responsive design
- Maintain consistent spacing and colors

### Documentation

- Use JSDoc comments for functions
- Update README when adding features
- Include inline comments for complex logic
- Keep documentation up-to-date

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(dashboard): add real-time runway calculator

fix(auth): resolve OAuth callback redirect issue

docs(readme): update installation instructions
```

## Pull Request Process

1. **Update documentation** - Ensure README and other docs are updated
2. **Add tests** - Include tests for new functionality
3. **Pass CI checks** - All tests and linting must pass
4. **Get reviews** - Request review from maintainers
5. **Squash commits** - Clean up commit history if needed

### PR Template

When creating a PR, include:

- **Description** of changes
- **Related issue** (if applicable)
- **Type of change** (feature, fix, docs, etc.)
- **Testing done** (how you tested the changes)
- **Screenshots** (for UI changes)

### Review Process

- All PRs require at least one approval
- Address all review comments
- Re-request review after making changes
- Maintainers may request additional changes

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

---

Thank you for contributing! 🎉
