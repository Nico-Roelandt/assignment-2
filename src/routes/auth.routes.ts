import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { env } from "../config/env.js";
import { ApiError } from "../middleware/errorHandler.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "BAD_REQUEST", "Email and password are required");
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials");

    const payload = { userId: user.id, isAdmin: user.is_admin };

    res.json({
      accessToken: jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn })
    });
  } catch (e: any) {
    next(e);
  }
});

export default router;
