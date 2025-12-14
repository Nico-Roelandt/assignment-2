import { Router } from "express";
import { prisma } from "../prisma.js";
import { ApiError } from "../middleware/errorHandler.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = Router();

function parsePageSize(req: any) {
  const page = req.query.page ? Number(req.query.page) : 0;
  const size = req.query.size ? Number(req.query.size) : 20;
  return { page: Number.isInteger(page) && page >= 0 ? page : 0, size: Number.isInteger(size) && size > 0 ? Math.min(size, 100) : 20 };
}

function parseSort(req: any) {
  const raw = typeof req.query.sort === "string" ? req.query.sort : "id,DESC";
  const [field, dirRaw] = raw.split(",");
  const dir = (dirRaw || "DESC").toLowerCase();
  const allowed = new Set(["id", "code", "coupon_amount", "start", "end", "is_valid"]);
  const sortField = allowed.has(field) ? field : "id";
  const sortDir = dir === "asc" ? "asc" : "desc";
  return { sortField, sortDir, sort: `${sortField},${sortDir.toUpperCase()}` };
}

router.post("/", authRequired, adminOnly, async (req, res, next) => {
  try {
    const { code, coupon_amount, start, end, is_valid } = req.body;

    if (!code || coupon_amount === undefined || !start || !end) {
      throw new ApiError(400, "BAD_REQUEST", "Missing required fields");
    }

    const created = await prisma.coupons.create({
      data: {
        code,
        coupon_amount: Number(coupon_amount),
        start: new Date(start),
        end: new Date(end),
        is_valid: is_valid === undefined ? true : !!is_valid
      }
    });

    res.status(201).json(created);
  } catch (e: any) {
    if (e?.code === "P2002") return next(new ApiError(409, "DUPLICATE_RESOURCE", "Coupon code already exists"));
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { page, size } = parsePageSize(req);
    const { sortField, sortDir, sort } = parseSort(req);

    const where: any = {};
    if (req.query.isValid !== undefined) where.is_valid = String(req.query.isValid) === "true";

    const [totalElements, content] = await Promise.all([
      prisma.coupons.count({ where }),
      prisma.coupons.findMany({
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

    const coupon = await prisma.coupons.findUnique({ where: { id } });
    if (!coupon) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Coupon not found");

    res.json(coupon);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", authRequired, adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, "BAD_REQUEST", "Invalid id");

    const exists = await prisma.coupons.findUnique({ where: { id } });
    if (!exists) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Coupon not found");

    const { code, coupon_amount, start, end, is_valid } = req.body;

    const updated = await prisma.coupons.update({
      where: { id },
      data: {
        ...(code !== undefined ? { code } : {}),
        ...(coupon_amount !== undefined ? { coupon_amount: Number(coupon_amount) } : {}),
        ...(start !== undefined ? { start: new Date(start) } : {}),
        ...(end !== undefined ? { end: new Date(end) } : {}),
        ...(is_valid !== undefined ? { is_valid: !!is_valid } : {})
      }
    });

    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2002") return next(new ApiError(409, "DUPLICATE_RESOURCE", "Coupon code already exists"));
    next(e);
  }
});

router.delete("/:id", authRequired, adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, "BAD_REQUEST", "Invalid id");

    const exists = await prisma.coupons.findUnique({ where: { id } });
    if (!exists) throw new ApiError(404, "RESOURCE_NOT_FOUND", "Coupon not found");

    await prisma.coupons.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
