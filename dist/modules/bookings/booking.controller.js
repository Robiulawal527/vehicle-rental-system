"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingByIdController = exports.getBookingsController = exports.createBookingController = void 0;
const booking_service_1 = require("./booking.service");
const createBookingController = async (req, res, next) => {
    try {
        if (!req.user) {
            const error = new Error("User not authenticated");
            error.statusCode = 401;
            throw error;
        }
        const booking = await (0, booking_service_1.createBooking)({
            requester: req.user,
            payload: req.body,
        });
        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createBookingController = createBookingController;
const getBookingsController = async (req, res, next) => {
    try {
        if (!req.user) {
            const error = new Error("User not authenticated");
            error.statusCode = 401;
            throw error;
        }
        const bookings = await (0, booking_service_1.getBookings)({ requester: req.user });
        return res.status(200).json({
            success: true,
            message: req.user.role === "admin"
                ? "Bookings retrieved successfully"
                : "Your bookings retrieved successfully",
            data: bookings,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getBookingsController = getBookingsController;
const updateBookingByIdController = async (req, res, next) => {
    try {
        if (!req.user) {
            const error = new Error("User not authenticated");
            error.statusCode = 401;
            throw error;
        }
        const bookingId = Number(req.params.bookingId);
        const updated = await (0, booking_service_1.updateBookingById)({
            bookingId,
            requester: req.user,
            payload: req.body,
        });
        const message = req.body.status === "returned"
            ? "Booking marked as returned. Vehicle is now available"
            : "Booking cancelled successfully";
        return res.status(200).json({
            success: true,
            message,
            data: updated,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateBookingByIdController = updateBookingByIdController;
