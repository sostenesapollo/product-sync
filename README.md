# Product Sync API

A NestJS-based backend API that synchronizes product data from Contentful CMS and provides comprehensive analytics and reporting capabilities.

## Features

- **Automated Sync**: Hourly scheduled synchronization with Contentful API
- **Public API**: Paginated product listing with advanced filtering
- **Private Analytics**: JWT-protected reporting endpoints
- **Soft Delete**: Tracks deleted products for analytics
- **Comprehensive Reports**: Product statistics, price analytics, and custom insights
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Docker Support**: Containerized deployment with PostgreSQL
- **Type Safety**: Full TypeScript implementation with validation

## Technology Stack

- **Framework**: NestJS (Node.js LTS v24.3.0)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based security
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator and class-transformer
- **Scheduling**: Built-in CRON jobs
- **Containerization**: Docker & Docker Compose

## Quick Start

### Using Docker (Recommended)

1. **Clone and start the application:**
   ```bash
   git clone <repository-url>
   cd product-sync
   docker-compose up -d
   ```

2. **Wait for services to be ready** (about 30-60 seconds)

3. **Access the application:**
   - API: http://localhost:3001
   - Swagger Docs: http://localhost:3001/api/docs
   - pgAdmin: http://localhost:5050 (optional)

### Manual Setup

1. **Prerequisites:**
   - Node.js (LTS version)
   - PostgreSQL 15+
   - pnpm (recommended) or npm

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start PostgreSQL** and create database `product_sync`

5. **Run the application:**
   ```bash
   # Development
   pnpm run start:dev
   
   # Production
   pnpm run build
   pnpm run start:prod
   ```

## API Endpoints

### Authentication

- `POST /auth/login` - Get JWT token
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

### Public Endpoints

- `GET /products` - List products with pagination and filtering
- `GET /products/:id` - Get product by ID
- `DELETE /products/:id` - Soft delete product
- `POST /products/sync` - Manual sync trigger

### Private Endpoints (Requires JWT)

- `GET /reports/product-stats` - Product deletion statistics
- `GET /reports/price-stats` - Price presence analytics
- `GET /reports/category-report` - Category-wise breakdown
- `GET /reports/custom-report` - Advanced analytics

## Key Features

### Automated Data Sync
- Hourly synchronization with Contentful API
- Manual sync trigger available
- Error handling and logging
- Tracks sync timestamps

### Advanced Filtering
- Text search (name, category, brand, color)
- Price range filtering
- Pagination (max 5 items per page)
- Sorting options

### Analytics & Reports
- Product deletion percentages
- Price presence statistics
- Category breakdowns
- Custom business insights

### Authentication & Security
- JWT-based authentication
- Protected private endpoints
- Input validation
- Soft delete for audit trails

## Testing

```bash
# Unit tests
pnpm run test

# Test coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e
```

## Production Deployment

```bash
# Docker production deployment
docker-compose up -d

# Manual deployment
pnpm run build
pnpm run start:prod
```

## License

This project is proprietary software developed for Apply Digital.