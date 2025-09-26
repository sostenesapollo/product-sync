# 🚀 CI/CD Setup for Product Sync

This project uses GitHub Actions for Continuous Integration and Continuous Deployment. The CI/CD pipeline is configured to ensure code quality, run tests, and deploy the application automatically.

## 📋 Workflows

### 🔄 CI Pipeline (`.github/workflows/ci.yml`)

The CI pipeline runs on every push and pull request to `main` and `develop` branches. It includes the following jobs:

#### 🔍 Lint & Format Check
- **ESLint**: Checks TypeScript code for syntax errors and code quality issues
- **Prettier**: Verifies code formatting consistency
- **Auto-fix**: ESLint automatically fixes issues where possible

#### 🧪 Tests
- **Unit Tests**: Runs Jest unit tests for all services and controllers
- **E2E Tests**: End-to-end tests (currently skipped until database setup is complete)
- **Coverage**: Generates test coverage reports and uploads to Codecov
- **Test Database**: PostgreSQL 15 service container for testing

#### 🏗️ Build
- **Docker Build**: Validates that the application can be built into a Docker image
- **Cache**: Uses GitHub Actions cache to speed up builds
- **Multi-stage**: Tests the complete Docker multi-stage build process

#### 🔒 Security
- **Dependency Audit**: Checks for known vulnerabilities in dependencies
- **CodeQL**: GitHub's semantic code analysis for security issues
- **SAST**: Static Application Security Testing

### 🚀 Deployment Pipeline (`.github/workflows/deploy.yml`)

The deployment pipeline can be triggered:
- **Automatically**: On new releases (when a release is published)
- **Manually**: Via workflow dispatch with environment selection

#### Features:
- **Container Registry**: Builds and pushes to GitHub Container Registry (ghcr.io)
- **Multi-environment**: Supports staging and production environments
- **Image Tagging**: Semantic versioning and branch-based tags
- **Deployment Summary**: Creates detailed deployment reports

### 🤖 Dependabot (`.github/dependabot.yml`)

Automated dependency updates for:
- **npm packages**: Weekly updates on Mondays
- **Docker images**: Weekly base image updates
- **GitHub Actions**: Weekly workflow dependency updates

## 🔧 Local Development Scripts

```bash
# Install dependencies
pnpm install

# Run linter (auto-fix enabled)
pnpm run lint

# Check code formatting
pnpm run format:check

# Fix code formatting
pnpm run format

# Run unit tests
pnpm run test

# Run tests with coverage
pnpm run test:cov

# Run e2e tests
pnpm run test:e2e

# Build application
pnpm run build

# Start development server
pnpm run dev
```

## 🏃‍♂️ Running CI Locally

To test the CI pipeline locally before pushing:

```bash
# Run the same checks as CI
pnpm run lint           # ESLint checks
pnpm run format:check   # Prettier formatting
pnpm run test           # Unit tests
pnpm run build          # Build verification

# Build Docker image (same as CI)
docker build -t product-sync:local .
```

## 🔐 Environment Variables

The CI/CD pipeline uses these environment variables:

### Testing Environment
- `DATABASE_URL`: PostgreSQL connection for tests
- `JWT_SECRET`: JWT secret key for authentication tests
- `CONTENTFUL_SPACE_ID`: Contentful CMS space ID
- `CONTENTFUL_ACCESS_TOKEN`: Contentful API access token

### Deployment
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- Additional secrets can be configured in repository settings

## 📊 Status Badges

Add these badges to your main README.md:

```markdown
[![CI](https://github.com/username/product-sync/actions/workflows/ci.yml/badge.svg)](https://github.com/username/product-sync/actions/workflows/ci.yml)
[![Deploy](https://github.com/username/product-sync/actions/workflows/deploy.yml/badge.svg)](https://github.com/username/product-sync/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/gh/username/product-sync/branch/main/graph/badge.svg)](https://codecov.io/gh/username/product-sync)
```

## 🛠️ Customization

### Adding New Jobs
To add new jobs to the CI pipeline:

1. Edit `.github/workflows/ci.yml`
2. Add your job following the existing pattern
3. Use appropriate Node.js and service containers as needed

### Environment-Specific Deployments
The deployment workflow supports multiple environments:

```yaml
inputs:
  environment:
    description: 'Environment to deploy to'
    required: true
    default: 'staging'
    type: choice
    options:
      - staging
      - production
```

### Security Scanning
The pipeline includes:
- **Dependency scanning**: `pnpm audit`
- **Code analysis**: GitHub CodeQL
- **Container scanning**: Available through GitHub security tab

## 📝 Pull Request Template

The repository includes a pull request template (`.github/pull_request_template.md`) that ensures:
- Proper change description
- Testing verification
- Code quality checklist
- Security considerations

## 🚨 Troubleshooting

### Common Issues

1. **ESLint Failures**
   ```bash
   pnpm run lint --fix
   ```

2. **Format Issues**
   ```bash
   pnpm run format
   ```

3. **Test Failures**
   - Check test database connection
   - Verify environment variables
   - Run tests locally first

4. **Docker Build Issues**
   - Check Dockerfile syntax
   - Verify all files are included (check .dockerignore)
   - Test build locally

### Getting Help

- Check the Actions tab in GitHub for detailed logs
- Review individual job outputs for specific errors
- Ensure all required secrets are configured
- Verify branch protection rules if applicable

## 🔄 Workflow Updates

When updating workflows:

1. Test changes on a feature branch first
2. Use workflow dispatch for manual testing
3. Monitor the Actions tab for results
4. Update this documentation accordingly