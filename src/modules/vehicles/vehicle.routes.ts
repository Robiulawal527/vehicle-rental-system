// Import Router class from Express to create route handlers for vehicles
import { Router } from "express";

// Import authentication and authorization middleware functions
// These protect routes from unauthorized access
import { authenticate, authorize } from "../../middlewares/authMiddleware";

// Import vehicle controller functions that handle request/response logic
// Controllers delegate business logic to services
import {
	createVehicleController,
	deleteVehicleByIdController,
	getAllVehiclesController,
	getVehicleByIdController,
	updateVehicleByIdController,
} from "./vehicle.controller";

// Create a new Router instance for vehicle-related endpoints
// Will be mounted at /api/v1/vehicles in the main app
export const vehicleRouter = Router();

// Public GET route to retrieve all vehicles
// No authentication required - anyone can view vehicles
// Useful for public-facing vehicle catalog on homepage
vehicleRouter.get("/", getAllVehiclesController);

// Public GET route to retrieve a specific vehicle by ID
// Route parameter :vehicleId is available as req.params.vehicleId
// No authentication required - anyone can view vehicle details
vehicleRouter.get("/:vehicleId", getVehicleByIdController);

// Protected POST route to create a new vehicle
// Requires authentication via JWT token in Authorization header
// Only users with "admin" role can create vehicles
// authenticate middleware verifies token and populates req.user
// authorize("admin") middleware checks if user has admin role
vehicleRouter.post(
	"/",
	authenticate,
	authorize("admin"),
	createVehicleController
);

// Protected PUT route to update an existing vehicle
// Route parameter :vehicleId identifies which vehicle to update
// Requires authentication and admin role
// Allows partial updates (not all fields required)
vehicleRouter.put(
	"/:vehicleId",
	authenticate,
	authorize("admin"),
	updateVehicleByIdController
);

// Protected DELETE route to remove a vehicle from the system
// Route parameter :vehicleId identifies which vehicle to delete
// Requires authentication and admin role
// Prevents deletion if vehicle has active bookings
vehicleRouter.delete(
	"/:vehicleId",
	authenticate,
	authorize("admin"),
	deleteVehicleByIdController
);


