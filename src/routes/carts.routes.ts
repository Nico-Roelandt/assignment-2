import { Router } from "express";
import { prisma } from "../prisma.js";
import { ApiError } from "../middleware/errorHandler.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const items = await prisma.carts.findMany({ where: { user_id: userId }, orderBy: { id: "desc" } });
    res.json({ content: items });
  } catch (e) {
    next(e);
  }
});

router.post("/items", authRequired, async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const book_id = Number(req.body.book_id);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(book_id) || !Number.isInteger(quantity) || quantity <= 0) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid body");
    }

    const book = await prisma.books.findUnique({ where: { id: book_id } });
    if (!book) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Book not found");

    const existing = await prisma.carts.findFirst({ where: { user_id: userId, book_id } });

    if (existing) {
      const updated = await prisma.carts.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
      return res.json(updated);
    }

    const created = await prisma.carts.create({
      data: { user_id: userId, book_id, quantity }
    });

    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.patch("/items/:id", authRequired, async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const id = Number(req.params.id);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity <= 0) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid body");
    }

    const item = await prisma.carts.findUnique({ where: { id } });
    if (!item) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Cart item not found");
    if (item.user_id !== userId) throw new ApiError(403, "FORBIDDEN", "Not allowed");

    const updated = await prisma.carts.update({ where: { id }, data: { quantity } });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/items/:id", authRequired, async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) throw new ApiError(400, "BAD_REQUEST", "Invalid id");

    const item = await prisma.carts.findUnique({ where: { id } });
    if (!item) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Cart item not found");
    if (item.user_id !== userId) throw new ApiError(403, "FORBIDDEN", "Not allowed");

    await prisma.carts.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.delete("/", authRequired, async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    await prisma.carts.deleteMany({ where: { user_id: userId } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
