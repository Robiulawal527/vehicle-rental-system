// Import the Express framework to create and configure the web server application
// Application type provides TypeScript type definitions for the Express app instance
import express, { Application } from "express";
// Import CORS middleware to enable Cross-Origin Resource Sharing
// Allows the frontend (running on a different port/domain) to make requests to this API
import cors from "cors";
// Import dotenv to load environment variables from a .env file into process.env
// This keeps sensitive configuration (like database credentials) separate from code
import dotenv from "dotenv";
// Import path module to handle and transform file paths in a cross-platform way
// Ensures correct path separators on Windows, Mac, and Linux
import path from "path";
// Import fs (file system) module to interact with the file system
// Used here to check if the frontend build directory exists
import fs from "fs";

// Import authentication routes that handle user signup and signin
// These routes are prefixed with /api/v1/auth
import { authRouter } from "./modules/auth/auth.routes";
// Import vehicle routes that handle CRUD operations for vehicles
// These routes are prefixed with /api/v1/vehicles
import { vehicleRouter } from "./modules/vehicles/vehicle.routes";
// Import user routes that handle user management operations
// These routes are prefixed with /api/v1/users
import { userRouter } from "./modules/users/user.routes";
// Import booking routes that handle rental booking operations
// These routes are prefixed with /api/v1/bookings
import { bookingRouter } from "./modules/bookings/booking.routes";
// Import the global error handler middleware to catch and format all errors
// This ensures consistent error responses across the entire API
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

// Load environment variables from .env file into process.env
// This must be called early before accessing any environment variables
// Makes configuration like DATABASE_URL, JWT_SECRET available throughout the app
dotenv.config();

// Create an Express application instance
// This app object will be configured with middleware and routes
// Export it so it can be imported in index.ts to start the server
export const app: Application = express();

// Enable CORS (Cross-Origin Resource Sharing) middleware
// Allows the frontend application (React/Vite) to make API requests from a different origin
// Without this, browsers would block API calls due to the Same-Origin Policy
app.use(cors());

// Enable Express built-in JSON body parser middleware
// Parses incoming request bodies with JSON payloads and makes the data available in req.body
// Essential for POST/PUT/PATCH requests that send JSON data
app.use(express.json());

// Register the authentication routes under the /api/v1/auth prefix
// Handles endpoints like POST /api/v1/auth/signup and POST /api/v1/auth/signin
app.use("/api/v1/auth", authRouter);

// Register the vehicle routes under the /api/v1/vehicles prefix
// Handles endpoints like GET /api/v1/vehicles, POST /api/v1/vehicles, etc.
app.use("/api/v1/vehicles", vehicleRouter);

// Register the user routes under the /api/v1/users prefix
// Handles endpoints like GET /api/v1/users, PUT /api/v1/users/:userId, etc.
app.use("/api/v1/users", userRouter);

// Register the booking routes under the /api/v1/bookings prefix
// Handles endpoints like POST /api/v1/bookings, GET /api/v1/bookings, etc.
app.use("/api/v1/bookings", bookingRouter);

// Serve frontend (built with Vite) if available
// This section serves the React frontend from the backend server in production
// Resolve the absolute path to the frontend build directory
// __dirname is the current directory (dist/src), so we go up and into client/dist
const clientDistPath = path.resolve(__dirname, "..", "client", "dist");
// Check if the frontend build directory exists (only exists after running npm run build)
// This prevents errors when running the backend in development without a frontend build
if (fs.existsSync(clientDistPath)) {
	// Serve all static files (HTML, CSS, JS, images) from the client/dist directory
	// This makes the frontend accessible through the same server as the API
	app.use(express.static(clientDistPath));
	// Handle all GET requests that don't start with /api/
	// This is the catch-all route for client-side routing (React Router)
	app.get("*", (req, res, next) => {
		// If the request path starts with /api/, skip this handler and continue to next middleware
		// This ensures API routes aren't affected by the frontend catch-all
		if (req.path.startsWith("/api/")) return next();
		// For all other routes, send the index.html file
		// This allows React Router to handle routing on the client side (Single Page Application)
		return res.sendFile(path.join(clientDistPath, "index.html"));
	});
}

// Register the global error handler middleware as the last middleware
// This catches any errors from all routes and formats them into consistent JSON responses
// Must be registered after all routes to catch errors from them
app.use(globalErrorHandler);

