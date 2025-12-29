# Contributing to ProseCreator

Thank you for your interest in contributing to ProseCreator! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

Before submitting a bug report:
1. Check the [existing issues](https://github.com/adverant/Adverant-Nexus-Plugin-ProseCreator/issues) to avoid duplicates
2. Collect relevant information about your environment
3. Provide steps to reproduce the issue

**Bug Report Template:**
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Numbered steps to reproduce
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node.js version, etc.
- **Screenshots/Logs**: If applicable

### Suggesting Features

We welcome feature suggestions! Please:
1. Check existing [feature requests](https://github.com/adverant/Adverant-Nexus-Plugin-ProseCreator/labels/enhancement)
2. Describe the problem your feature would solve
3. Propose a solution if you have one

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Run tests**: `npm test`
6. **Run linting**: `npm run lint`
7. **Run type checking**: `npm run typecheck`
8. **Commit your changes** with a clear commit message
9. **Push to your fork** and submit a pull request

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(generation): add screenplay format support
fix(blueprint): handle edge case with empty chapters
docs(readme): update installation instructions
```

## Development Setup

### Prerequisites

- Node.js 20+
- npm 9+
- Docker (for running tests)

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Adverant-Nexus-Plugin-ProseCreator.git
cd Adverant-Nexus-Plugin-ProseCreator

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Testing

- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- Coverage report: `npm run test:coverage`

All PRs must pass:
- [ ] All existing tests
- [ ] New tests for new functionality
- [ ] TypeScript type checking
- [ ] ESLint rules

## Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Avoid `any` type - use proper typing
- Use interfaces for object shapes
- Use enums for fixed sets of values
- Document public APIs with JSDoc comments

### Code Style

- Use 2-space indentation
- Use single quotes for strings
- Use semicolons
- Maximum line length: 100 characters
- Use meaningful variable and function names

### File Organization

```
src/
├── types/          # TypeScript interfaces and types
├── agents/         # AI agent implementations
├── generation/     # Content generation logic
├── blueprint/      # Living blueprint system
├── memory/         # Infinite memory architecture
├── formats/        # Multi-format output
├── routes/         # API routes
├── middleware/     # Express middleware
├── utils/          # Utility functions
└── index.ts        # Entry point
```

## Documentation

- Update README.md for user-facing changes
- Update API documentation for endpoint changes
- Add JSDoc comments for public functions
- Include examples where helpful

## Release Process

Releases are managed by the maintainers:

1. Version bump following [Semantic Versioning](https://semver.org/)
2. Update CHANGELOG.md
3. Create release tag
4. Publish to Nexus Marketplace

## Getting Help

- **Discord**: [Adverant Community](https://discord.gg/adverant)
- **Email**: support@adverant.ai
- **Discussions**: Use GitHub Discussions for questions

## Recognition

Contributors are recognized in our:
- README.md Contributors section
- CHANGELOG.md release notes
- Nexus Marketplace plugin page

Thank you for contributing!
