# Backend Service – Scalable AI PDF Summary Generator

A robust NestJS backend for managing users, authentication, document uploads, and asynchronous PDF summarization. This service exposes a secure REST API, handles user roles, and coordinates with the Python microservice for AI-powered PDF analysis.

---

## 🧩 Modules Overview

- **User Module:** Manages user registration, profile, and role updates (Admin, Editor, Viewer).
- **Auth Module:** Handles authentication (JWT), login, and registration.
- **Document Module:** Enables document upload, retrieval, and metadata management.
- **Ingestion Module:** Orchestrates the PDF summarization process, tracks ingestion status, and logs processing attempts.

---

## 📚 Key API Endpoints

### 📖 API Documentation (Swagger)

Interactive API documentation is available via Swagger UI. You can explore all endpoints, see request/response schemas, and try out the APIs directly from your browser:

- **Swagger UI:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

| Endpoint                         | Method | Description                                  |
| -------------------------------- | ------ | -------------------------------------------- |
| `/auth/register`                 | POST   | Register a new user (default role: Viewer)   |
| `/auth/login`                    | POST   | User login, returns JWT                      |
| `/user/:id/role`                 | PATCH  | Update a user's role (Admin only)            |
| `/document/upload`               | POST   | Upload a new PDF document (Editor only)      |
| `/document/:id`                  | GET    | Get document details by ID                   |
| `/document`                      | GET    | List all documents (with filters)            |
| `/user/profile`                  | GET    | Get current user's profile                   |
| `/ingestion/start/:documentId`   | POST   | Start PDF summarization (async, Editor only) |
| `/ingestion/logs/:documentId`    | GET    | Get ingestion logs and status for a document |
| `/document/:id/summary`          | GET    | Get the summary of a document by ID          |
| `/document/:id/summary/download` | GET    | Download the summary of a document as a file |
| `/document/:id/summary/history`  | GET    | Get the history of summaries for a document  |

---

## 🔄 User Flow (with API References)

1. **User Registration**
   - User registers via [`/auth/register`](#) (assigned role: Viewer).
2. **Role Upgrade**
   - Admin updates user role to Editor via [`/user/:id/role`](#).
3. **Document Upload**
   - Editor uploads a PDF via [`/document/upload`](#).
   - Document details can be viewed via [`/document/:id`](#).
4. **Start Summarization**
   - Editor triggers summarization via [`/ingestion/start/:documentId`](#).
   - This is asynchronous: backend emits an event to the Python service.
   - API responds immediately with a "started" status.
5. **Track Progress**
   - User checks status/logs via [`/ingestion/logs/:documentId`](#), including attempt numbers and error trails.
   - If processing fails, user can retry; each attempt is logged and visible in the logs.

---

## 🚀 Getting Started

### 1. Clone the Backend Repository

```bash
git clone https://github.com/Saurav15/pdf-analyzer-microservice.git
cd pdf-analyzer-microservice/backend
```

### 2. Environment Setup

- Copy the example environment file and edit as needed:
  ```bash
  cp .env.example .env
  # Edit .env with your configuration
  ```

### 3. Install Dependencies

```bash
npm install
```

### 4. External Service Dependencies

- You can connect to your own PostgreSQL and RabbitMQ instances, **or**
- Use the Docker Compose setup in the parent repo:
  ```bash
  # From the project root
  docker compose -f docker-compose.dev.yml --profile infra up
  ```

### 5. Run Database Migrations

```bash
# For development
dnpm run migration:run:dev
# For production
npm run migration:run:prod
```

### 6. Run Seeders

```bash
npm run seed
```

### 7. Start the Application

```bash
# Development
npm run start:dev
# Production
npm run build
npm run start:prod
```

## 🧑‍💻 Static Test Users

The following static users are always seeded for testing/demo purposes:

| Role   | Email              | Password   |
| ------ | ------------------ | ---------- |
| Admin  | admin@example.com  | Admin@123  |
| Editor | editor@example.com | Editor@123 |
| Viewer | viewer@example.com | Viewer@123 |

---

## 🛡️ Features & Best Practices

- **Authentication:** Secure JWT-based login and route protection.
- **Authorization:** Role-based access control (Admin, Editor, Viewer).
- **Database Migrations & Seeding:** Automated and manual scripts for schema and data setup.
- **API Versioning:** URL-based versioning for future-proof APIs.
- **Security:**
  - Helmet for HTTP header protection
  - Rate limiting
  - Input validation and sanitization
- **Logging:** Centralized and structured logging for all actions and errors.
- **Docker Support:** Containerized for easy deployment and local development.

---

For detailed module and API documentation, see the [Swagger UI](http://localhost:3000/api/docs) after starting the service.
