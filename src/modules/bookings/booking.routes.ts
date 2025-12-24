// Import Router class from Express to create booking route handlers
import { Router } from "express";

// Import authentication and authorization middleware functions
// These protect endpoints from unauthorized access
import { authenticate, authorize } from "../../middlewares/authMiddleware";

// Import booking controller functions that handle rental booking operations
import {
	createBookingController,
	getBookingsController,
	updateBookingByIdController,
} from "./booking.controller";

// Create a new Router instance for booking-related endpoints
// Will be mounted at /api/v1/bookings in the main app
export const bookingRouter = Router();

// Protected POST route to create a new vehicle rental booking
// Requires authentication via JWT token
// Both admin and customer roles can create bookings
// Customers book for themselves, admins can book for any customer
// Validates vehicle availability and calculates total price
bookingRouter.post(
	"/",
	authenticate,
	authorize("admin", "customer"),
	createBookingController
);

// Protected GET route to retrieve bookings
// Requires authentication via JWT token
// Admins see all bookings with customer details
// Customers only see their own bookings
// Automatically returns expired active bookings before fetching
bookingRouter.get(
	"/",
	authenticate,
	authorize("admin", "customer"),
	getBookingsController
);

// Protected PUT route to update a booking status
// Route parameter :bookingId identifies which booking to update
// Requires authentication via JWT token
// Customers can only cancel their own bookings (before start date)
// Admins can mark any booking as returned
// Updates vehicle availability status accordingly
bookingRouter.put(
	"/:bookingId",
	authenticate,
	authorize("admin", "customer"),
	updateBookingByIdController
);


