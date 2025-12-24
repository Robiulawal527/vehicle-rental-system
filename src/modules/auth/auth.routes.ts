// Import Router class from Express to create modular route handlers
// Router allows grouping related routes together
import { Router } from "express";

// Import controller functions that handle the business logic for auth endpoints
// Controllers process requests and return responses
import { signinController, signupController } from "./auth.controller";

// Create a new Router instance for authentication routes
// This router will be mounted at /api/v1/auth in the main app
export const authRouter = Router();

// Define POST route for user registration at /api/v1/auth/signup
// When a POST request hits this endpoint, signupController handles it
// Expects request body with: name, email, password, phone, and optionally role
authRouter.post("/signup", signupController);

// Define POST route for user login at /api/v1/auth/signin
// When a POST request hits this endpoint, signinController handles it
// Expects request body with: email and password
// Returns a JWT token on successful authentication
authRouter.post("/signin", signinController);

