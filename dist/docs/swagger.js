import swaggerJSDoc from "swagger-jsdoc";
export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Online Bookstore API",
            version: "1.0.0",
            description: "Backend API for the bookstore assignment"
        },
        servers: [{ url: "http://localhost:8080" }],
        components: {
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
            },
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        timestamp: { type: "string", example: "2025-12-12T13:00:00.000Z" },
                        path: { type: "string", example: "/books/1" },
                        status: { type: "integer", example: 400 },
                        code: { type: "string", example: "BAD_REQUEST" },
                        message: { type: "string", example: "Invalid id" }
                    }
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", example: "user1@example.com" },
                        password: { type: "string", example: "P@ssw0rd!" }
                    }
                },
                LoginResponse: {
                    type: "object",
                    properties: {
                        accessToken: { type: "string", example: "eyJhbGciOi..." }
                    }
                },
                Book: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 2 },
                        title: { type: "string", example: "Book 2" },
                        author: { type: "string", example: "Author 2" },
                        publisher: { type: "string", nullable: true },
                        summary: { type: "string", nullable: true },
                        isbn: { type: "string", example: "ISBN-2" },
                        price: { type: "number", example: 12.0 },
                        publication_date: { type: "string", nullable: true, example: "2020-01-01T00:00:00.000Z" },
                        created_at: { type: "string", example: "2025-12-12T13:00:00.000Z" },
                        updated_at: { type: "string", example: "2025-12-12T13:00:00.000Z" }
                    }
                },
                PagedBooks: {
                    type: "object",
                    properties: {
                        content: { type: "array", items: { $ref: "#/components/schemas/Book" } },
                        page: { type: "integer", example: 0 },
                        size: { type: "integer", example: 10 },
                        totalElements: { type: "integer", example: 50 },
                        totalPages: { type: "integer", example: 5 },
                        sort: { type: "string", example: "id,DESC" }
                    }
                }
            }
        }
    },
    apis: ["./src/routes/*.ts", "./src/server.ts", "./src/app.ts"]
});
