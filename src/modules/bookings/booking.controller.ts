import { NextFunction, Request, Response } from "express";

import { createBooking, getBookings, updateBookingById } from "./booking.service";

export const createBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      const error = new Error("User not authenticated");
      (error as any).statusCode = 401;
      throw error;
    }

    const booking = await createBooking({
      requester: req.user,
      payload: req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

export const getBookingsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      const error = new Error("User not authenticated");
      (error as any).statusCode = 401;
      throw error;
    }

    const bookings = await getBookings({ requester: req.user });

    return res.status(200).json({
      success: true,
      message:
        req.user.role === "admin"
          ? "Bookings retrieved successfully"
          : "Your bookings retrieved successfully",
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBookingByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      const error = new Error("User not authenticated");
      (error as any).statusCode = 401;
      throw error;
    }

    const bookingId = Number(req.params.bookingId);

    const updated = await updateBookingById({
      bookingId,
      requester: req.user,
      payload: req.body,
    });

    const message =
      req.body.status === "returned"
        ? "Booking marked as returned. Vehicle is now available"
        : "Booking cancelled successfully";

    return res.status(200).json({
      success: true,
      message,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
