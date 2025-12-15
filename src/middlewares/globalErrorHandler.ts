import { NextFunction, Request, Response } from "express";

interface ApiError extends Error {
  statusCode?: number;
  errors?: unknown;
}

export const globalErrorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || "An unexpected error occurred",
  });
};

