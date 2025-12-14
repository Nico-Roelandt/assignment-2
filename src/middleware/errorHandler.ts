import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;

  res.status(status).json({
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    status,
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "Internal server error"
  });
}
