# NestJS Backend Application

## Description

A NestJS backend application with TypeORM, PostgreSQL, and authentication features.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1d
```

## Database Migrations

### Generating Migrations

To generate a new migration, use the following command:

```bash
npm run migration:generate --name=YourMigrationName
```

For example:

```bash
npm run migration:generate --name=CreateUsersTable
```

The migration file will be created in the `src/database/migrations` directory.

### Running Migrations

To run all pending migrations:

```bash
npm run migration:run
```

### Reverting Migrations

To revert the last migration:

```bash
npm run migration:revert
```

### Migration Best Practices

1. Always use descriptive names for migrations
2. Use PascalCase or camelCase for migration names
3. Each migration should be focused on a single change
4. Test migrations in development before applying to production
5. Keep migrations in version control

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Project Structure

```
src/
├── config/             # Configuration files
├── database/          # Database related files
│   ├── config/       # Database configuration
│   ├── migrations/   # Database migrations
│   └── entities/     # Database entities
├── modules/          # Application modules
│   └── auth/        # Authentication module
└── common/          # Common utilities and enums
```

## API Documentation

API documentation will be available at `/api` when running the application.

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

This project is licensed under the MIT License.
