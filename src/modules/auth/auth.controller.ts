// Import Express types for handling HTTP requests and responses
// These types enable TypeScript to provide intellisense and type checking
import { Request, Response, NextFunction } from "express";

// Import service functions that contain the actual business logic for auth operations
// Separating controllers from services keeps code organized and testable
import { signinUser, signupUser } from "./auth.service";

// Controller function to handle user registration (signup) requests
// Controllers are responsible for validating input, calling services, and formatting responses
export const signupController = async (
  // Request object containing the user data in req.body
  req: Request,
  // Response object used to send success or error responses back to client
  res: Response,
  // NextFunction used to pass errors to the global error handler
  next: NextFunction
) => {
  // Wrap in try-catch to handle any errors from the service layer
  // This prevents unhandled promise rejections
  try {
    // Call the signupUser service function with request body data
    // Await the promise since database operations are asynchronous
    // Service handles password hashing and database insertion
    const user = await signupUser(req.body);

    // Create a response object excluding the password for security
    // Never send passwords (even hashed) back to the client
    const responseData = {
      // User's unique identifier from the database
      id: user.id,
      // User's full name
      name: user.name,
      // User's email address
      email: user.email,
      // User's phone number
      phone: user.phone,
      // User's role (admin or customer)
      role: user.role,
    };

    // Send success response with 201 Created status
    // 201 indicates a new resource was successfully created
    return res.status(201).json({
      // Indicates the request succeeded
      success: true,
      // User-friendly success message
      message: "User registered successfully",
      // The created user data (without password)
      data: responseData,
    });
  } catch (error) {
    // Pass any caught errors to the global error handler
    // Global error handler will format the error response
    next(error);
  }
};

// Controller function to handle user login (signin) requests
// Validates credentials and returns JWT token for authenticated sessions
export const signinController = async (
  // Request object containing email and password in req.body
  req: Request,
  // Response object used to send authentication token and user data
  res: Response,
  // NextFunction used to pass errors to the global error handler
  next: NextFunction
) => {
  // Wrap in try-catch to handle authentication errors
  try {
    // Call signinUser service with login credentials
    // Await the result which includes JWT token and user data
    // Service validates password and generates token
    const { token, user } = await signinUser(req.body);

    // Send success response with 200 OK status
    // 200 indicates the request was successful
    return res.status(200).json({
      // Indicates successful authentication
      success: true,
      // User-friendly success message
      message: "Login successful",
      // Return both token and user data for client to store
      data: {
        // JWT token for authenticating future requests
        // Client should include this in Authorization header
        token,
        // User information (id, name, email, phone, role)
        user,
      },
    });
  } catch (error) {
    // Pass authentication errors (invalid credentials, etc.) to error handler
    next(error);
  }
};

