import { Router } from "express";

import { authenticate, authorize } from "../../middlewares/authMiddleware";

import {
	createBookingController,
	getBookingsController,
	updateBookingByIdController,
} from "./booking.controller";

export const bookingRouter = Router();

bookingRouter.post(
	"/",
	authenticate,
	authorize("admin", "customer"),
	createBookingController
);

bookingRouter.get(
	"/",
	authenticate,
	authorize("admin", "customer"),
	getBookingsController
);

bookingRouter.put(
	"/:bookingId",
	authenticate,
	authorize("admin", "customer"),
	updateBookingByIdController
);


