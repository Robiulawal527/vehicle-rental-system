// Import Express types for middleware function parameters
// NextFunction, Request, and Response provide type safety for the error handler
import { NextFunction, Request, Response } from "express";

// Extend the standard Error interface to include additional API-specific properties
// This allows errors to carry HTTP status codes and detailed error information
interface ApiError extends Error {
  // Optional HTTP status code (404, 400, 500, etc.)
  // Used to determine the appropriate response status
  statusCode?: number;
  // Optional additional error details that can be any type
  // Could be validation errors, database errors, or custom error messages
  errors?: unknown;
}

// Global error handler middleware that catches all errors thrown in the application
// Express recognizes this as an error handler because it has 4 parameters (err is first)
// Must be registered last in middleware chain to catch errors from all previous middleware/routes
export const globalErrorHandler = (
  // The error object thrown from any route or middleware
  // Typed as ApiError to access custom statusCode and errors properties
  err: ApiError,
  // Request object prefixed with _ to indicate it's intentionally unused
  // Still required by Express error handler signature but not needed here
  _req: Request,
  // Response object used to send the error response back to client
  res: Response,
  // Next function prefixed with _ to indicate it's intentionally unused
  // Required by Express error handler signature even though we don't call it
  _next: NextFunction
) => {
  // Determine HTTP status code: use error's statusCode if provided, otherwise default to 500
  // 500 = Internal Server Error (catch-all for unexpected errors)
  // || operator provides fallback when statusCode is undefined
  const statusCode = err.statusCode || 500;

  // Send JSON error response to client with appropriate status code
  // Return statement ensures function exits after sending response
  return res.status(statusCode).json({
    // Indicates the request failed
    // Consistent success: false helps clients handle errors uniformly
    success: false,
    // Use custom error message if provided, otherwise use generic message
    // || operator provides fallback for undefined error messages
    message: err.message || "Internal Server Error",
    // Use custom error details if provided, otherwise use generic message
    // Provides additional context about what went wrong
    errors: err.errors || "An unexpected error occurred",
  });
};

