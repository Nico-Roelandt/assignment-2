import { Router } from "express";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
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

    const user = await prisma.users.findUnique({ where: { email: String(email) } });
    if (!user) throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials");

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials");

    const payload = { userId: user.id, isAdmin: user.is_admin };

    const secret = String(env.jwtSecret);

    const signOptions: SignOptions = {
      expiresIn: (env.jwtExpiresIn as any) ?? "1h"
    };

    res.json({
      accessToken: jwt.sign(payload, secret, signOptions)
    });
  } catch (e) {
    next(e);
  }
});

export default router;
