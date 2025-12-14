import { Router } from "express";
import { prisma } from "../prisma.js";
import { ApiError } from "../middleware/errorHandler.js";
import { authRequired, adminOnly } from "../middleware/auth.js";
import { parseListQuery } from "../utils/pagination.js";
const router = Router();
router.post("/", authRequired, async (req, res, next) => {
    try {
        const book_id = Number(req.body.book_id);
        const quantity = Number(req.body.quantity);
        const status = req.body.status ? String(req.body.status) : "CREATED";
        if (!Number.isInteger(book_id) || !Number.isInteger(quantity) || quantity <= 0) {
            throw new ApiError(400, "BAD_REQUEST", "Invalid body");
        }
        const book = await prisma.books.findUnique({ where: { id: book_id } });
        if (!book)
            throw new ApiError(404, "RESOURCE_NOT_FOUND", "Book not found");
        const created = await prisma.orders.create({
            data: { book_id, user_id: req.auth.userId, quantity, status }
        });
        res.status(201).json(created);
    }
    catch (e) {
        next(e);
    }
});
router.get("/me", authRequired, async (req, res, next) => {
    try {
        const { page, size, sort, sortField, dir } = parseListQuery(req.query);
        const where = { user_id: req.auth.userId };
        const [totalElements, content] = await Promise.all([
            prisma.orders.count({ where }),
            prisma.orders.findMany({
                where,
                orderBy: { [sortField]: dir.toLowerCase() },
                skip: page * size,
                take: size
            })
        ]);
        res.json({ content, page, size, totalElements, totalPages: Math.ceil(totalElements / size), sort });
    }
    catch (e) {
        next(e);
    }
});
router.get("/", authRequired, adminOnly, async (req, res, next) => {
    try {
        const { page, size, sort, sortField, dir } = parseListQuery(req.query);
        const where = {};
        if (req.query.userId !== undefined) {
            const userId = Number(req.query.userId);
            if (Number.isInteger(userId))
                where.user_id = userId;
        }
        if (req.query.bookId !== undefined) {
            const bookId = Number(req.query.bookId);
            if (Number.isInteger(bookId))
                where.book_id = bookId;
        }
        if (req.query.status !== undefined)
            where.status = String(req.query.status);
        const [totalElements, content] = await Promise.all([
            prisma.orders.count({ where }),
            prisma.orders.findMany({
                where,
                orderBy: { [sortField]: dir.toLowerCase() },
                skip: page * size,
                take: size
            })
        ]);
        res.json({ content, page, size, totalElements, totalPages: Math.ceil(totalElements / size), sort });
    }
    catch (e) {
        next(e);
    }
});
router.get("/:id", authRequired, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            throw new ApiError(400, "BAD_REQUEST", "Invalid id");
        const order = await prisma.orders.findUnique({ where: { id } });
        if (!order)
            throw new ApiError(404, "RESOURCE_NOT_FOUND", "Order not found");
        if (!req.auth.isAdmin && order.user_id !== req.auth.userId) {
            throw new ApiError(403, "FORBIDDEN", "Not allowed");
        }
        res.json(order);
    }
    catch (e) {
        next(e);
    }
});
router.patch("/:id/status", authRequired, adminOnly, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const status = req.body.status ? String(req.body.status) : "";
        if (!Number.isInteger(id) || !status)
            throw new ApiError(400, "BAD_REQUEST", "Invalid body");
        const exists = await prisma.orders.findUnique({ where: { id } });
        if (!exists)
            throw new ApiError(404, "RESOURCE_NOT_FOUND", "Order not found");
        const updated = await prisma.orders.update({ where: { id }, data: { status } });
        res.json(updated);
    }
    catch (e) {
        next(e);
    }
});
router.delete("/:id", authRequired, adminOnly, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            throw new ApiError(400, "BAD_REQUEST", "Invalid id");
        const exists = await prisma.orders.findUnique({ where: { id } });
        if (!exists)
            throw new ApiError(404, "RESOURCE_NOT_FOUND", "Order not found");
        await prisma.orders.delete({ where: { id } });
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
});
export default router;
