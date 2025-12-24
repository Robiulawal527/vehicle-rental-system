// Import Express types for request, response, and next function
// These types enable TypeScript to provide type checking and autocomplete for middleware parameters
import { Request, Response, NextFunction } from "express";
// Import jsonwebtoken library to verify JWT tokens sent by clients
// JWT (JSON Web Token) is used for stateless authentication
import jwt from "jsonwebtoken";

// Define the structure of the JWT payload after it's decoded
// This interface ensures type safety when accessing decoded token data
interface JwtPayload {
  // User's unique identifier from the database
  id: number;
  // User's role determines their permissions (admin can manage all resources, customer is limited)
  role: "admin" | "customer";
  // User's email address stored in the token for identification
  email: string;
}

// Extend Express's global types to add custom user property to Request
// This allows TypeScript to recognize req.user throughout the application
declare global {
  // Access Express namespace to modify existing types
  namespace Express {
    // Extend the Request interface
    interface Request {
      // Add optional user property containing decoded JWT data
      // Optional (?) because not all routes require authentication
      user?: JwtPayload;
    }
  }
}

// Authentication middleware that verifies JWT tokens from request headers
// Protects routes by ensuring only authenticated users can access them
// Export allows this middleware to be used in route definitions
export const authenticate = (
  // Request object containing client data including headers
  req: Request,
  // Response object used to send responses back to the client
  res: Response,
  // Next function to pass control to the next middleware or route handler
  next: NextFunction
) => {
  // Extract the Authorization header from the request
  // Standard format: "Bearer <token>"
  const authHeader = req.headers.authorization;

  // Check if Authorization header is missing
  // Without this header, there's no token to verify
  if (!authHeader) {
    // Return 401 Unauthorized status with error message
    // Early return prevents further code execution
    return res.status(401).json({
      // Indicates the request failed
      success: false,
      // User-friendly message
      message: "Unauthorized",
      // Detailed error explanation
      errors: "Authentication token is missing",
    });
  }

  // Split the Authorization header to extract the token
  // Format is "Bearer token123", split by space gives ["Bearer", "token123"]
  // Destructuring: first element (Bearer) is ignored with _, second is captured as token
  const [, token] = authHeader.split(" ");

  // Check if token extraction failed (malformed header)
  // This happens if header doesn't follow "Bearer <token>" format
  if (!token) {
    // Return 401 Unauthorized with specific error about header format
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      errors: "Invalid authorization header format",
    });
  }

  // Try to verify and decode the JWT token
  // Wrapped in try-catch because jwt.verify throws errors for invalid tokens
  try {
    // Verify the token using the secret key from environment variables
    // jwt.verify checks signature validity and expiration
    // Cast the result to JwtPayload type for type safety
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Attach decoded user data to the request object
    // This makes user information available to subsequent middleware and route handlers
    req.user = decoded;

    // Call next() to pass control to the next middleware or route handler
    // Request is authenticated and can proceed
    next();
  } catch (error) {
    // Catch any errors from jwt.verify (invalid signature, expired token, etc.)
    // Return 401 Unauthorized with error message
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      errors: "Invalid or expired token",
    });
  }
};

// Authorization middleware factory that checks if user has required role
// Returns a middleware function configured with specific allowed roles
// This is a higher-order function that creates customized authorization middleware
export const authorize =
  // Spread operator (...) allows passing multiple roles as arguments
  // Example: authorize("admin", "customer") or just authorize("admin")
  (...allowedRoles: Array<"admin" | "customer">) =>
  // Return the actual middleware function
  // This closure has access to allowedRoles from the outer function
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Check if user property exists on request
    // This should be populated by authenticate middleware called before this
    if (!req.user) {
      // Return 401 if user is not authenticated
      // This is a safety check in case authenticate wasn't called first
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "User not authenticated",
      });
    }

    // Check if user's role is in the array of allowed roles
    // includes() returns true if the user's role matches any allowed role
    if (!allowedRoles.includes(req.user.role)) {
      // Return 403 Forbidden if user doesn't have required role
      // 403 means authenticated but not authorized (lack of permissions)
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "You do not have permission to perform this action",
      });
    }

    // User is authorized, continue to the next middleware or route handler
    next();
  };

