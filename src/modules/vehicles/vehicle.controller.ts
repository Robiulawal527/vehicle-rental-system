import { NextFunction, Request, Response } from "express";

import {
  createVehicle,
  deleteVehicleById,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
} from "./vehicle.service";

export const createVehicleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vehicle = await createVehicle(req.body);

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (err) {
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
