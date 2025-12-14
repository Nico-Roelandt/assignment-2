# Assignment 2 – Web Service Design (JBNU 2025)

Backend API for an online "fake" bookstore project developed as part of Assignment 2.
The project implements a REST API with authentication, role-based access, database persistence, and documentation.

## Technology Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- MySQL
- JWT Authentication
- Swagger (OpenAPI)
- Postman

## Features

- JWT-based authentication (User / Admin)
- Role-based authorization
- CRUD operations on multiple resources
- Pagination, sorting, and filtering
- Centralized error handling
- Swagger auto-generated documentation
- Database integration with Prisma
- Seed data for testing

## Project Structure

```
src/
 ├─ routes/          # API routes
 ├─ middleware/      # Auth & error handling
 ├─ docs/            # Swagger configuration
 ├─ utils/           # Pagination helper
 ├─ prisma.ts        # Prisma client
 └─ server.ts        # App entry point
prisma/
 ├─ schema.prisma
 └─ seed.ts
```

## Installation & Local Execution

1. **Install dependencies**
    ```bash
    npm install
    ```

2. **Environment variables**

    Create a `.env` file (see `.env.example`):
    ```
    DATABASE_URL="mysql://user:password@localhost:3306/bookstore"
    JWT_SECRET="your_jwt_secret"
    JWT_EXPIRES_IN="1h"
    PORT=3000
    PUBLIC_BASE_URL="http://localhost:3000"
    ```

3. **Prisma setup**
    ```bash
    npx prisma generate
    npx prisma migrate deploy
    npx prisma db seed
    ```

4. **Start the server**
    ```bash
    npm run dev
    ```

Server runs on: `http://localhost:3000`

## API Documentation (Swagger)

Swagger UI is available at: `http://localhost:3000/docs`

It includes:
- Endpoint list
- Request/response schemas
- JWT Bearer authentication

## Authentication

### Login

```
POST /auth/login
```

**Body:**
```json
{
  "email": "user1@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "accessToken": "JWT_TOKEN"
}
```

Use the token in requests:
```
Authorization: Bearer <token>
```

## Roles

| Role | Description |
|------|-------------|
| USER | Standard user |
| ADMIN | Administrative access |

## Main API Endpoints

### Auth
- `POST /auth/login`

### Users
- `GET /users/me`

### Books
- `GET /books`
- `GET /books/:id`
- `POST /books` (ADMIN)
- `PATCH /books/:id` (ADMIN)
- `DELETE /books/:id` (ADMIN)

### Orders
- `POST /orders`
- `GET /orders/me`
- `GET /orders` (ADMIN)
- `PATCH /orders/:id/status` (ADMIN)

### Cart
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:id`
- `DELETE /cart/items/:id`
- `DELETE /cart`

### Favorites
- `GET /favorites`
- `POST /favorites`
- `DELETE /favorites/:id`

### Coupons / Discounts (ADMIN)
- `POST /coupons`
- `GET /coupons`
- `POST /discounts`
- `GET /discounts`

### Health Check
- `GET /health` – Returns server status (200 OK)

## Postman

A Postman collection is provided in the `postman/` directory.

It includes:
- Environment variables
- Authentication handling
- Request examples

## Deployment (JCloud)

The application was deployed on a JCloud virtual machine.

- The backend runs correctly using PM2
- The application listens on internal port 3000
- The `/health` endpoint responds correctly when accessed locally on the VM

**Expected port mapping according to JCloud configuration:**
- Internal port: 3000
- Expected public port: 13046

**Local verification on the server:**
```bash
curl http://127.0.0.1:3000/health
```

**Returns:**
```json
{
  "status": "OK",
  "version": "1.0.0"
}
```

However, despite the expected port forwarding configuration (3000 → 13046), the public port 13046 did not route traffic correctly to the application.

**As a result:**
- The backend is fully functional
- All endpoints work locally and can be tested via SSH access
- The issue appears to be related to JCloud port forwarding rather than the application itself
