// Import Express types for handling HTTP requests, responses, and error propagation
// These types ensure type safety when working with Express middleware and controllers
import { NextFunction, Request, Response } from "express";

// Import service functions that contain vehicle business logic
// Services handle database operations and validation logic
// Separating services from controllers keeps code modular and testable
import {
  createVehicle,
  deleteVehicleById,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
} from "./vehicle.service";

// Controller to handle POST requests for creating a new vehicle
// Only admins can access this endpoint (enforced by route middleware)
export const createVehicleController = async (
  // Request object containing vehicle data in req.body
  req: Request,
  // Response object to send success or error responses
  res: Response,
  // Next function to pass errors to global error handler
  next: NextFunction
) => {
  // Wrap in try-catch to handle validation and database errors
  try {
    // Call service function to validate data and insert vehicle into database
    // await because database operations are asynchronous
    const vehicle = await createVehicle(req.body);

    // Send success response with 201 Created status
    // 201 indicates a new resource was successfully created
    return res.status(201).json({
      // Indicates successful operation
      success: true,
      // User-friendly success message
      message: "Vehicle created successfully",
      // Return the created vehicle data including auto-generated id
      data: vehicle,
    });
  } catch (err) {
    // Pass any errors to global error handler for consistent error responses
    next(err);
  }
};

export const getAllVehiclesController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vehicles = await getAllVehicles();

    if (vehicles.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: vehicles,
    });
  } catch (err) {
    next(err);
  }
};

export const getVehicleByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vehicleId = Number(req.params.vehicleId);

    const vehicle = await getVehicleById(vehicleId);

    return res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
};

export const updateVehicleByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vehicleId = Number(req.params.vehicleId);

    const updated = await updateVehicleById(vehicleId, req.body);

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteVehicleByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vehicleId = Number(req.params.vehicleId);

    await deleteVehicleById(vehicleId);

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
