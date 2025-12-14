import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
async function main() {
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE favorites`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE carts`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE reviews`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE orders`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE discounts`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE coupons`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE books`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE users`);
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1`);
    const password = await bcrypt.hash("password", 10);
    const admin = await prisma.users.create({
        data: {
            email: "admin@example.com",
            password,
            name: "Admin",
            is_admin: true
        }
    });
    const users = await Promise.all(Array.from({ length: 20 }).map((_, i) => prisma.users.create({
        data: {
            email: `user${i + 1}@example.com`,
            password,
            name: `User ${i + 1}`,
            is_admin: false
        }
    })));
    const books = await Promise.all(Array.from({ length: 50 }).map((_, i) => prisma.books.create({
        data: {
            title: `Book ${i + 1}`,
            author: `Author ${i % 10}`,
            publisher: "Demo Publisher",
            summary: "Sample book description",
            isbn: `ISBN-${i + 1}`,
            price: 10 + i,
            publication_date: new Date("2020-01-01")
        }
    })));
    await Promise.all(Array.from({ length: 60 }).map((_, i) => prisma.reviews.create({
        data: {
            book_id: books[i % books.length].id,
            user_id: users[i % users.length].id,
            rating: (i % 5) + 1,
            comment: "Good book"
        }
    })));
    await Promise.all(Array.from({ length: 40 }).map((_, i) => prisma.orders.create({
        data: {
            book_id: books[i % books.length].id,
            user_id: users[i % users.length].id,
            quantity: (i % 3) + 1,
            status: "CREATED"
        }
    })));
    await Promise.all(Array.from({ length: 30 }).map((_, i) => prisma.carts.create({
        data: {
            book_id: books[i % books.length].id,
            user_id: users[i % users.length].id,
            quantity: 1
        }
    })));
    await Promise.all(Array.from({ length: 30 }).map((_, i) => prisma.favorites.create({
        data: {
            book_id: books[i % books.length].id,
            user_id: users[i % users.length].id
        }
    })));
    await prisma.coupons.createMany({
        data: [
            {
                code: "WELCOME10",
                coupon_amount: 10,
                start: new Date("2024-01-01"),
                end: new Date("2026-01-01"),
                is_valid: true
            },
            {
                code: "SPRING5",
                coupon_amount: 5,
                start: new Date("2024-01-01"),
                end: new Date("2026-01-01"),
                is_valid: true
            }
        ]
    });
    await Promise.all(Array.from({ length: 20 }).map((_, i) => prisma.discounts.create({
        data: {
            book_id: books[i].id,
            discount_rate: 10,
            start: new Date("2024-01-01"),
            end: new Date("2026-01-01"),
            is_valid: true
        }
    })));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
