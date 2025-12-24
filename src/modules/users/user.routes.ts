// Import Router class from Express to create user route handlers
import { Router } from "express";

// Import authentication and authorization middleware
// authenticate verifies JWT token, authorize checks user role
import { authenticate, authorize } from "../../middlewares/authMiddleware";

// Import user controller functions that handle user management operations
import {
	deleteUserByIdController,
	getAllUsersController,
	updateUserByIdController,
} from "./user.controller";

// Create a new Router instance for user-related endpoints
// Will be mounted at /api/v1/users in the main app
export const userRouter = Router();

// Protected GET route to retrieve all users in the system
// Requires authentication via JWT token
// Only admin users can access this endpoint
// Returns list of all users without passwords
userRouter.get("/", authenticate, authorize("admin"), getAllUsersController);

// Protected PUT route to update a user's information
// Route parameter :userId identifies which user to update
// Requires authentication - users can update their own info, admins can update anyone
// Admin role required to update user roles
userRouter.put("/:userId", authenticate, updateUserByIdController);

// Protected DELETE route to remove a user from the system
// Route parameter :userId identifies which user to delete
// Requires authentication and admin role
// Prevents deletion if user has active bookings
userRouter.delete(
	"/:userId",
	authenticate,
	authorize("admin"),
	deleteUserByIdController
);


