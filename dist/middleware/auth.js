import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./errorHandler.js";
export function authRequired(req, _res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token)
        return next(new ApiError(401, "UNAUTHORIZED", "Missing access token"));
    try {
        const payload = jwt.verify(token, env.jwtSecret);
        req.auth = { userId: payload.userId, isAdmin: !!payload.isAdmin };
        next();
    }
    catch {
        next(new ApiError(401, "UNAUTHORIZED", "Invalid or expired access token"));
    }
}
export function adminOnly(req, _res, next) {
    if (!req.auth?.isAdmin)
        return next(new ApiError(403, "FORBIDDEN", "Admin only"));
    next();
}
