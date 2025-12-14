import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./errorHandler.js";

export type AuthUser = { userId: number; isAdmin: boolean };

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return next(new ApiError(401, "UNAUTHORIZED", "Missing access token"));

  try {
    const payload = jwt.verify(token, env.jwtSecret) as any;
    req.auth = { userId: payload.userId, isAdmin: !!payload.isAdmin };
    next();
  } catch {
    next(new ApiError(401, "UNAUTHORIZED", "Invalid or expired access token"));
  }
}

export function adminOnly(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth?.isAdmin) return next(new ApiError(403, "FORBIDDEN", "Admin only"));
  next();
}
