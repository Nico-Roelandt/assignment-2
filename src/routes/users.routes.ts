import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { ApiError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/me", authRequired, async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.auth!.userId },
      select: { id: true, email: true, name: true, is_admin: true, created_at: true }
    });

    if (!user) throw new ApiError(404, "RESOURCE_NOT_FOUND", "User not found");
    res.json(user);
  } catch (e) {
    next(e);
  }
});

export default router;
