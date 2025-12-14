# Assignment 2 Web service design JBNU 2025

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

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file (see `.env.example`):

```env
DATABASE_URL="mysql://user:password@localhost:3306/bookstore"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="1h"
PUBLIC_BASE_URL="http://localhost:8080"
```

### 3. Prisma setup

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 4. Start the server

```bash
npm run dev
```

Server runs on: `http://localhost:8080`

## API Documentation (Swagger)

Swagger UI is available at: `http://localhost:8080/docs`

It includes:
- Endpoint list
- Request/response schemas
- JWT Bearer authentication

## Authentication

### Login

**POST** `/auth/login`

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

### Roles

| Role  | Description           |
|-------|----------------------|
| USER  | Standard user        |
| ADMIN | Administrative access|

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
- `GET /health` - Returns server status (200 OK)

## Postman

A Postman collection is provided in: `postman/`

It includes:
- Environment variables
- Auth scripts
- Automated request tests

## Deployment

The application is deployed on JCloud and accessible via public IP and port.
Swagger and health check endpoints are available on the deployed server.
