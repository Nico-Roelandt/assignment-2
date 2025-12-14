import { Router } from "express";
import { prisma } from "../prisma.js";
import { ApiError } from "../middleware/errorHandler.js";
import { authRequired } from "../middleware/auth.js";
const router = Router();
router.get("/", authRequired, async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const items = await prisma.favorites.findMany({ where: { user_id: userId }, orderBy: { id: "desc" } });
        res.json({ content: items });
    }
    catch (e) {
        next(e);
    }
});
router.post("/", authRequired, async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const book_id = Number(req.body.book_id);
        if (!Number.isInteger(book_id))
            throw new ApiError(400, "BAD_REQUEST", "Invalid body");
        const book = await prisma.books.findUnique({ where: { id: book_id } });
        if (!book)
            throw new ApiError(404, "RESOURCE_NOT_FOUND", "Book not found");
        const existing = await prisma.favorites.findFirst({ where: { user_id: userId, book_id } });
        if (existing)
            return res.json(existing);
        const created = await prisma.favorites.create({ data: { user_id: userId, book_id } });
        res.status(201).json(created);
    }
    catch (e) {
        next(e);
    }
});
router.delete("/:id", authRequired, async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            throw new ApiError(400, "BAD_REQUEST", "Invalid id");
        const fav = await prisma.favorites.findUnique({ where: { id } });
        if (!fav)
            throw new ApiError(404, "RESOURCE_NOT_FOUND", "Favorite not found");
        if (fav.user_id !== userId)
            throw new ApiError(403, "FORBIDDEN", "Not allowed");
        await prisma.favorites.delete({ where: { id } });
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
});
router.delete("/by-book/:bookId", authRequired, async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const bookId = Number(req.params.bookId);
        if (!Number.isInteger(bookId))
            throw new ApiError(400, "BAD_REQUEST", "Invalid bookId");
        const fav = await prisma.favorites.findFirst({ where: { user_id: userId, book_id: bookId } });
        if (!fav)
            throw new ApiError(404, "RESOURCE_NOT_FOUND", "Favorite not found");
        await prisma.favorites.delete({ where: { id: fav.id } });
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
});
export default router;
