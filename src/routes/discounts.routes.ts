import { Router } from "express";
import { prisma } from "../prisma.js";
import { ApiError } from "../middleware/errorHandler.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

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
  const raw = typeof req.query.sort === "string" ? req.query.sort : "id,DESC";
  const [field, dirRaw] = raw.split(",");
  const dir = (dirRaw || "DESC").toLowerCase();

  const allowed = new Set(["id", "book_id", "discount_rate", "start", "end", "is_valid"]);
  const sortField = allowed.has(field) ? field : "id";
  const sortDir = dir === "asc" ? "asc" : "desc";

  return { sortField, sortDir, sort: `${sortField},${sortDir.toUpperCase()}` };
}

router.post("/", authRequired, adminOnly, async (req, res, next) => {
  try {
    const book_id = Number(req.body.book_id);
    const discount_rate = Number(req.body.discount_rate);
    const { start, end } = req.body;
    const is_valid = req.body.is_valid;

    if (!Number.isInteger(book_id) || Number.isNaN(discount_rate) || !start || !end) {
      throw new ApiError(400, "BAD_REQUEST", "Missing or invalid fields");
    }

    const book = await prisma.books.findUnique({ where: { id: book_id } });
    if (!book) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Book not found");

    const created = await prisma.discounts.create({
      data: {
        book_id,
        discount_rate,
        start: new Date(start),
        end: new Date(end),
        is_valid: is_valid === undefined ? true : !!is_valid
      }
    });

    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { page, size } = parsePageSize(req);
    const { sortField, sortDir, sort } = parseSort(req);

    const where: any = {};

    if (req.query.bookId !== undefined) {
      const bookId = Number(req.query.bookId);
      if (Number.isInteger(bookId)) where.book_id = bookId;
    }

    if (req.query.isValid !== undefined) {
      where.is_valid = String(req.query.isValid) === "true";
    }

    const [totalElements, content] = await Promise.all([
      prisma.discounts.count({ where }),
      prisma.discounts.findMany({
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

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, "BAD_REQUEST", "Invalid id");

    const discount = await prisma.discounts.findUnique({ where: { id } });
    if (!discount) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Discount not found");

    res.json(discount);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", authRequired, adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, "BAD_REQUEST", "Invalid id");

    const exists = await prisma.discounts.findUnique({ where: { id } });
    if (!exists) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Discount not found");

    const data: any = {};
    if (req.body.discount_rate !== undefined) data.discount_rate = Number(req.body.discount_rate);
    if (req.body.start !== undefined) data.start = new Date(req.body.start);
    if (req.body.end !== undefined) data.end = new Date(req.body.end);
    if (req.body.is_valid !== undefined) data.is_valid = !!req.body.is_valid;

    const updated = await prisma.discounts.update({ where: { id }, data });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", authRequired, adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, "BAD_REQUEST", "Invalid id");

    const exists = await prisma.discounts.findUnique({ where: { id } });
    if (!exists) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Discount not found");

    await prisma.discounts.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
