# NestJS Document Management System

A robust document management system built with NestJS, featuring document upload, processing, and management capabilities.

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
│   │   ├── database.config.ts  # Database connection and TypeORM settings
│   │   ├── aws.config.ts       # AWS S3 bucket and credentials configuration
│   │   └── rabbitmq.config.ts  # RabbitMQ connection and queue settings
│   │
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── documents/         # Document management
│   │   └── common/            # Shared utilities
│   │
│   ├── database/
│   │   ├── migrations/        # Database migrations
│   │   └── seeds/            # Database seeders
│   │
│   └── main.ts             # Application entry point
│
├── test/                     # Test files
├── docker/                   # Docker configuration
├── .env.example             # Environment variables template
└── docker-compose.yml       # Docker compose configuration
```

## 🛠️ Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- AWS Account (for S3)
- PostgreSQL
- RabbitMQ

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Environment Setup**

   ```bash
   # Copy environment file
   cp .env.example .env

   # Edit .env with your configuration
   nano .env
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Database Setup**

   ```bash
   # Run migrations
   npm run migration:run

   # Seed initial data
   npm run seed:users
   ```

5. **Start the application**

   Development:

   ```bash
   # Using Docker
   docker-compose -f docker-compose.dev.yml up

   # Without Docker
   npm run start:dev
   ```

   Production:

   ```bash
   # Using Docker
   docker-compose up

   # Without Docker
   npm run build
   npm run start:prod
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

## 📦 Docker Support

### Development

```bash
# Build and start
docker-compose -f docker-compose.dev.yml up

# Rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Production

```bash
# Build and start
docker-compose up

# Rebuild without cache
docker-compose build --no-cache
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov
```

## 📝 Database Migrations

### Create Migration

```bash
npm run migration:generate --name=added-ingetionlogs
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Migration

```bash
npm run migration:revert
```

## 🌱 Database Seeding

### Run Seeders

```bash
# Run all seeders
npm run seed:run

# Run specific seeder
npm run seed:run -- --seed=UserSeeder
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
