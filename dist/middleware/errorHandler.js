export class ApiError extends Error {
    status;
    code;
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
export function errorHandler(err, req, res, _next) {
    const status = err.status || 500;
    res.status(status).json({
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status,
        code: err.code || "INTERNAL_SERVER_ERROR",
        message: err.message || "Internal server error"
    });
}
