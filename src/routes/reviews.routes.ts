import { Router } from "express";
import { prisma } from "../prisma.js";
import { ApiError } from "../middleware/errorHandler.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function parsePageSize(req: any) {
  const page = req.query.page ? Number(req.query.page) : 0;
  const size = req.query.size ? Number(req.query.size) : 20;
  return {
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    size: Number.isInteger(size) && size > 0 ? Math.min(size, 100) : 20
  };
}

function parseSort(req: any) {
  const raw = typeof req.query.sort === "string" ? req.query.sort : "created_at,DESC";
  const [field, dirRaw] = raw.split(",");
  const dir = (dirRaw || "DESC").toLowerCase();

  const allowed = new Set(["id", "created_at", "updated_at", "rating"]);
  const sortField = allowed.has(field) ? field : "created_at";
  const sortDir = dir === "asc" ? "asc" : "desc";

  return { sortField, sortDir, sort: `${sortField},${sortDir.toUpperCase()}` };
}

router.post("/books/:id/reviews", authRequired, async (req, res, next) => {
  try {
    const bookId = Number(req.params.id);
    const rating = Number(req.body.rating);
    const comment = req.body.comment !== undefined ? String(req.body.comment) : null;

    if (!Number.isInteger(bookId) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid body");
    }

    const book = await prisma.books.findUnique({ where: { id: bookId } });
    if (!book) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Book not found");

    const created = await prisma.reviews.create({
      data: { book_id: bookId, user_id: req.auth!.userId, rating, comment }
    });

    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.get("/books/:id/reviews", async (req, res, next) => {
  try {
    const bookId = Number(req.params.id);
    if (!Number.isInteger(bookId)) throw new ApiError(400, "BAD_REQUEST", "Invalid book id");

    const { page, size } = parsePageSize(req);
    const { sortField, sortDir, sort } = parseSort(req);

    const book = await prisma.books.findUnique({ where: { id: bookId } });
    if (!book) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Book not found");

    const where = { book_id: bookId };

    const [totalElements, content] = await Promise.all([
      prisma.reviews.count({ where }),
      prisma.reviews.findMany({
        where,
        orderBy: { [sortField]: sortDir },
        skip: page * size,
        take: size
      })
    ]);

    res.json({ content, page, size, totalElements, totalPages: Math.ceil(totalElements / size), sort });
  } catch (e) {
    next(e);
  }
});

router.patch("/reviews/:id", authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, "BAD_REQUEST", "Invalid id");

    const review = await prisma.reviews.findUnique({ where: { id } });
    if (!review) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Review not found");

    if (!req.auth!.isAdmin && review.user_id !== req.auth!.userId) {
      throw new ApiError(403, "FORBIDDEN", "Not allowed");
    }

    const data: any = {};
    if (req.body.rating !== undefined) {
      const rating = Number(req.body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(400, "BAD_REQUEST", "Invalid rating");
      data.rating = rating;
    }
    if (req.body.comment !== undefined) data.comment = req.body.comment === null ? null : String(req.body.comment);

    const updated = await prisma.reviews.update({ where: { id }, data });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/reviews/:id", authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, "BAD_REQUEST", "Invalid id");

    const review = await prisma.reviews.findUnique({ where: { id } });
    if (!review) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Review not found");

    if (!req.auth!.isAdmin && review.user_id !== req.auth!.userId) {
      throw new ApiError(403, "FORBIDDEN", "Not allowed");
    }

    await prisma.reviews.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
