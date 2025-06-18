# NestJS Backend Service

A robust backend service for document management built with NestJS, featuring document upload, processing, and management capabilities.

## 🚀 Features

- **Document Management**

  - Upload documents to AWS S3
  - Process documents through RabbitMQ queue
  - Track document status and metadata
  - Search and filter documents

- **User Management**

  - Role-based access control (Admin, Editor, Viewer)
  - JWT authentication
  - User profile management

- **Security Features**

  - Rate limiting
  - API versioning
  - JWT authentication
  - Role-based guards

- **Infrastructure**
  - PostgreSQL database
  - RabbitMQ message queue
  - AWS S3 integration
  - Docker containerization

## 📁 Project Structure

```
├── src/
│   ├── config/                 # Configuration files
│   │   ├── config.module.ts    # NestJS configuration module
│   │   ├── config.validation.ts # Environment validation
│   │   └── swagger.config.ts   # Swagger documentation config
│   │
│   ├── common/                 # Shared utilities and middleware
│   │   ├── decorators/         # Custom decorators
│   │   ├── enums/             # Enum definitions
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Authentication and authorization guards
│   │   ├── interceptors/      # Request/Response interceptors
│   │   ├── interfaces/        # Shared interfaces
│   │   └── utils/             # Utility functions
│   │
│   ├── database/              # Database configuration
│   │   ├── config/            # TypeORM configuration
│   │   ├── entities/          # Database entities
│   │   ├── migrations/        # Database migrations
│   │   └── seeders/           # Database seeders
│   │
│   ├── modules/               # Application modules
│   │   ├── auth/              # Authentication module
│   │   ├── user/              # User management
│   │   ├── document/          # Document management
│   │   ├── aws/               # AWS S3 integration
│   │   └── health/            # Health checks
│   │
│   └── main.ts                # Application entry point
│
├── test/                      # Test files
├── Dockerfile                 # Production Docker configuration
├── Dockerfile.dev             # Development Docker configuration
├── entrypoint.sh              # Container entrypoint script
└── package.json               # Dependencies and scripts
```

## 🛠️ Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- AWS Account (for S3)
- PostgreSQL
- RabbitMQ

## 🚀 Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/your-username/jk-tech-assignment.git
cd jk-tech-assignment/backend
```

### 2. **Environment Setup**

The application uses different environment files based on `NODE_ENV`:

- **Development**: `.env.development.local` → `.env.development` → `.env.local` → `.env`
- **Production**: `.env.production.local` → `.env.production` → `.env.local` → `.env`

#### Create Environment Files

```bash
# Development environment
cp .env.example .env.development.local
# Edit with your development configuration
nano .env.development.local

# Production environment
cp .env.example .env.production.local
# Edit with your production configuration
nano .env.production.local
```

#### Required Environment Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=your-database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=your-s3-bucket-name

# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_QUEUE=documents_queue
```

### 3. **Install Dependencies**

```bash
npm install
```

### 4. **Database Setup**

#### Manual Migration Execution

```bash
# Development migrations
npm run migration:run:dev

# Production migrations
npm run migration:run:prod
```

#### Database Seeding

```bash
# Run seeders
npm run seed
```

### 5. **Start the Application**

#### Local Development

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📦 Docker Deployment

### Option 1: Full Microservices Stack (Recommended)

If you want to run the complete application with all microservices (backend, database, RabbitMQ, Python consumer), use the root repository's docker-compose:

```bash
# Navigate to the root repository
cd jk-tech-assignment

# Development environment
docker-compose -f docker-compose.dev.yml up

# Production environment
docker-compose up
```

The root repository contains:

- `docker-compose.dev.yml` - Development setup with all services
- `docker-compose.yml` - Production setup with all services

### Option 2: Standalone Backend Service

If you only want to build and run the backend service independently:

#### Building the Docker Image

```bash
# Build for development
docker build -t jk-tech-backend:dev --build-arg NODE_ENV=development .

# Build for production
docker build -t jk-tech-backend:prod --build-arg NODE_ENV=production .
```

**Note:** The `--build-arg NODE_ENV` is used for build-time defaults, but the actual `NODE_ENV` at runtime will be determined by:

- Environment variables passed via `--env-file`
- Environment variables set in docker-compose
- Environment variables passed via `-e` flags
- Defaults to `development` if not specified

#### Running the Docker Container

```bash
# Run development container
docker run -d \
  --name jk-tech-backend-dev \
  -p 3000:3000 \
  --env-file .env.development.local \
  jk-tech-backend:dev

# Run production container
docker run -d \
  --name jk-tech-backend-prod \
  -p 3000:3000 \
  --env-file .env.production.local \
  jk-tech-backend:prod
```

### Automatic Migration Execution

The application uses an entrypoint script (`entrypoint.sh`) that automatically runs migrations on container startup:

1. **Detects the environment** based on `NODE_ENV`
2. **Runs the appropriate migration command**:
   - `npm run migration:run:dev` for development
   - `npm run migration:run:prod` for production
3. **Provides clear logging** of which environment and migration is being executed
4. **Handles fallback** to development if `NODE_ENV` is not set

Example output:

```bash
🛠 Running migrations for NODE_ENV: development
🔧 Running development migrations...
🚀 Starting app: node dist/main
```

## 📚 API Documentation

Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

## 🔒 Security Features

### Rate Limiting

- Global rate limiting applied to all routes
- Configurable limits per endpoint
- IP-based tracking

### API Versioning

- URL-based versioning (e.g., `/v1/users`)
- Header-based versioning support
- Default version: v1

### Authentication

- JWT-based authentication
- Role-based access control
- Token refresh mechanism

## 📝 Database Migrations

### Create Migration

```bash
npm run migration:generate --name=your-migration-name
```

### Run Migrations Manually

```bash
# Development migrations
npm run migration:run:dev

# Production migrations
npm run migration:run:prod
```

### Revert Migration

```bash
npm run migration:revert
```

## 🌱 Database Seeding

### Run Seeders

```bash
# Run all seeders
npm run seed
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📤 AWS S3 Integration

- Document storage in S3 buckets
- Configurable bucket and region
- Secure file upload/download

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
