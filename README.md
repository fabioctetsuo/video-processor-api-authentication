# Auth Service

A robust authentication and authorization microservice built with NestJS that provides JWT-based user authentication, registration, and profile management. Features PostgreSQL database with Prisma ORM, comprehensive security, and production-ready monitoring.

## Features

- 🔐 **User Authentication**: JWT-based login and token management
- 👥 **User Registration**: Secure user account creation with validation
- 🛡️ **Password Security**: Bcrypt hashing with salt rounds
- 🎫 **Token Management**: Access and refresh token support
- 👤 **Profile Management**: User profile retrieval and updates
- 🔑 **Role-based Access**: User and admin role support
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- 📊 **Monitoring**: Prometheus metrics and health checks
- 🐳 **Containerized**: Docker and Docker Compose ready
- 📱 **REST API**: OpenAPI/Swagger documentation
- 🧪 **Testing**: Comprehensive unit and integration tests

## Architecture

The service follows clean architecture principles:

```
src/
├── application/           # Business logic and use cases
│   └── use-cases/        # Authentication use cases
├── domain/               # Domain entities and interfaces
├── infrastructure/       # External dependencies
│   ├── database/         # Prisma database service
│   ├── metrics/          # Prometheus monitoring
│   ├── repositories/     # Data persistence
│   └── services/         # JWT and encryption services
└── presentation/         # Controllers and HTTP layer
    ├── controllers/      # REST controllers
    └── guards/          # Authentication guards
```

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone and navigate to the project
cd auth-service

# Start all services (API + PostgreSQL)
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f auth-service
```

The service will be available at:
- **API**: http://localhost:3002
- **Swagger UI**: http://localhost:3002/api
- **Health Check**: http://localhost:3002/auth/verify
- **Metrics**: http://localhost:3002/metrics

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start PostgreSQL
docker-compose up -d auth-postgres

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start in development mode
npm run start:dev
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | User login |
| `POST` | `/auth/refresh` | Refresh access token |
| `GET` | `/auth/profile` | Get user profile |
| `PUT` | `/auth/profile` | Update user profile |
| `GET` | `/auth/verify` | Verify token validity |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health check |
| `GET` | `/metrics` | Prometheus metrics |

## Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

Response:
```json
{
  "id": "cld12345678901234567",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### User Login

```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securePassword123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "token_type": "Bearer",
  "user": {
    "id": "cld12345678901234567",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### Get User Profile

```bash
curl -X GET http://localhost:3002/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "id": "cld12345678901234567",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Refresh Access Token

```bash
curl -X POST http://localhost:3002/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

## Configuration

### Environment Variables

```env
# Application
NODE_ENV=production
PORT=3002

# Database
DATABASE_URL=postgresql://auth_user:auth_password@localhost:5432/auth_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=10

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### Security Settings

The service implements several security best practices:

- **Password Hashing**: Bcrypt with configurable salt rounds
- **JWT Tokens**: Short-lived access tokens with refresh token rotation
- **Input Validation**: Class-validator for request validation
- **Rate Limiting**: Configurable request throttling
- **CORS**: Cross-origin resource sharing configuration

## Database Schema

The service uses PostgreSQL with Prisma ORM:

```prisma
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         UserRole @default(USER)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
}

enum UserRole {
  USER
  ADMIN
}
```

## Development

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npm run build

# Validation (lint + test + build)
npm run validate
```

### Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Deploy migrations (production)
npx prisma migrate deploy

# View database in browser
npx prisma studio
```

## Monitoring

### Health Checks

The service provides health endpoint for monitoring:

```bash
# Basic health check
curl http://localhost:3002/auth/verify

# Service status
curl http://localhost:3002/health
```

### Prometheus Metrics

Available metrics include:

- `http_request_duration_ms` - HTTP request duration
- `http_requests_total` - Total HTTP requests
- `auth_login_attempts_total` - Login attempt counter
- `auth_registration_total` - User registration counter
- `jwt_tokens_issued_total` - JWT tokens issued
- `jwt_tokens_refreshed_total` - JWT tokens refreshed

Access metrics at: http://localhost:3002/metrics

## Security

### Authentication Flow

1. **Registration**: User creates account with username, email, and password
2. **Login**: User authenticates with credentials
3. **Token Issue**: Service returns access token (short-lived) and refresh token (long-lived)
4. **API Access**: Client includes access token in Authorization header
5. **Token Refresh**: When access token expires, use refresh token to get new access token

### Password Security

- Passwords are hashed using bcrypt with configurable salt rounds
- Minimum password requirements enforced via validation
- No plain text passwords stored or logged

### JWT Security

- Access tokens expire in 15 minutes (configurable)
- Refresh tokens expire in 7 days (configurable)
- Tokens include user ID and role claims
- Secret key must be changed in production

## Deployment

### Docker Production

```bash
# Build production image
docker build -t auth-service:latest .

# Run with production settings
docker run -d \
  --name auth-service \
  -p 3002:3002 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-production-secret \
  auth-service:latest
```

### Docker Compose Production

```bash
# Production deployment
docker-compose -f docker-compose.yml up -d
```

### Environment Setup

For production deployment:

1. **Change JWT Secret**: Use a strong, unique secret key
2. **Database Security**: Use strong credentials and enable SSL
3. **HTTPS**: Deploy behind a reverse proxy with SSL/TLS
4. **Rate Limiting**: Adjust throttling based on expected load
5. **Monitoring**: Set up log aggregation and alerting

## Integration

### API Gateway Integration

This service is designed to work with an API Gateway:

```javascript
// Example API Gateway proxy configuration
{
  "/auth/*": {
    "target": "http://auth-service:3002",
    "changeOrigin": true,
    "pathRewrite": {
      "^/auth": "/auth"
    }
  }
}
```

### Client Integration

Example client usage:

```javascript
// Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const { access_token } = await loginResponse.json();

// Authenticated request
const profileResponse = await fetch('/auth/profile', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

## Troubleshooting

### Common Issues

**1. Database connection failed**
```bash
# Check PostgreSQL status
docker-compose logs auth-postgres

# Verify connection string
echo $DATABASE_URL
```

**2. JWT token invalid**
```bash
# Check token expiration
# Verify JWT_SECRET matches between instances
```

**3. Migration failures**
```bash
# Reset database
npx prisma migrate reset

# Deploy fresh migrations
npx prisma migrate deploy
```

**4. Service not starting**
```bash
# Check logs
docker-compose logs auth-service

# Verify environment variables
docker exec -it auth-service env | grep JWT
```

### Debug Mode

Enable detailed logging:

```bash
# Set log level
export LOG_LEVEL=debug

# Enable Prisma query logging
export DEBUG=prisma*
```

## API Documentation

Full API documentation is available via Swagger UI at `/api` when the service is running.

### Response Formats

**Success Response:**
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success"
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [...]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes with tests
4. Run test suite: `npm run validate`
5. Submit a pull request

### Code Style

- TypeScript with strict mode enabled
- ESLint + Prettier for formatting
- Clean Architecture principles
- Comprehensive test coverage (>80%)
- Conventional commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review existing issues
3. Create a new issue with detailed information

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.