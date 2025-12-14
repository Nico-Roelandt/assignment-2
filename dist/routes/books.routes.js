import { Router } from "express";
import { prisma } from "../prisma.js";
import { ApiError } from "../middleware/errorHandler.js";
import { authRequired, adminOnly } from "../middleware/auth.js";
import { parseListQuery } from "../utils/pagination.js";
const router = Router();
router.post("/", authRequired, adminOnly, async (req, res, next) => {
    try {
        const { title, author, publisher, summary, isbn, price, publication_date } = req.body;
        if (!title || !author || !isbn || price === undefined) {
            throw new ApiError(400, "BAD_REQUEST", "Missing required fields");
        }
        const created = await prisma.books.create({
            data: {
                title,
                author,
                publisher: publisher ?? null,
                summary: summary ?? null,
                isbn,
                price: Number(price),
                publication_date: publication_date ? new Date(publication_date) : null
            }
        });
        res.status(201).json(created);
    }
    catch (e) {
        if (e?.code === "P2002")
            return next(new ApiError(409, "DUPLICATE_RESOURCE", "ISBN already exists"));
        next(e);
    }
});
router.get("/", async (req, res, next) => {
    try {
        const { page, size, sort, sortField, dir } = parseListQuery(req.query);
        const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : "";
        const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
        const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
        const where = {};
        if (keyword) {
            where.OR = [
                { title: { contains: keyword } },
                { author: { contains: keyword } },
                { isbn: { contains: keyword } }
            ];
        }
        if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
            where.price = {};
            if (minPrice !== undefined && !Number.isNaN(minPrice))
                where.price.gte = minPrice;
            if (maxPrice !== undefined && !Number.isNaN(maxPrice))
                where.price.lte = maxPrice;
        }
        const [totalElements, content] = await Promise.all([
            prisma.books.count({ where }),
            prisma.books.findMany({
                where,
                orderBy: { [sortField]: dir.toLowerCase() },
                skip: page * size,
                take: size
            })
        ]);
        res.json({
            content,
            page,
            size,
            totalElements,
            totalPages: Math.ceil(totalElements / size),
            sort
        });
    }
    catch (e) {
        next(e);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            throw new ApiError(400, "BAD_REQUEST", "Invalid id");
        const book = await prisma.books.findUnique({ where: { id } });
        if (!book)
            throw new ApiError(404, "RESOURCE_NOT_FOUND", "Book not found");
        res.json(book);
    }
    catch (e) {
        next(e);
    }
});
router.patch("/:id", authRequired, adminOnly, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            throw new ApiError(400, "BAD_REQUEST", "Invalid id");
        const exists = await prisma.books.findUnique({ where: { id } });
        if (!exists)
            throw new ApiError(404, "RESOURCE_NOT_FOUND", "Book not found");
        const { title, author, publisher, summary, isbn, price, publication_date } = req.body;
        const updated = await prisma.books.update({
            where: { id },
            data: {
                ...(title !== undefined ? { title } : {}),
                ...(author !== undefined ? { author } : {}),
                ...(publisher !== undefined ? { publisher: publisher ?? null } : {}),
                ...(summary !== undefined ? { summary: summary ?? null } : {}),
                ...(isbn !== undefined ? { isbn } : {}),
                ...(price !== undefined ? { price: Number(price) } : {}),
                ...(publication_date !== undefined
                    ? { publication_date: publication_date ? new Date(publication_date) : null }
                    : {})
            }
        });
        res.json(updated);
    }
    catch (e) {
        if (e?.code === "P2002")
            return next(new ApiError(409, "DUPLICATE_RESOURCE", "ISBN already exists"));
        next(e);
    }
});
router.delete("/:id", authRequired, adminOnly, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            throw new ApiError(400, "BAD_REQUEST", "Invalid id");
        const exists = await prisma.books.findUnique({ where: { id } });
        if (!exists)
            throw new ApiError(404, "RESOURCE_NOT_FOUND", "Book not found");
        await prisma.books.delete({ where: { id } });
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
});
export default router;
