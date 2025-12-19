"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicleByIdController = exports.updateVehicleByIdController = exports.getVehicleByIdController = exports.getAllVehiclesController = exports.createVehicleController = void 0;
const vehicle_service_1 = require("./vehicle.service");
const createVehicleController = async (req, res, next) => {
    try {
        const vehicle = await (0, vehicle_service_1.createVehicle)(req.body);
        return res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: vehicle,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createVehicleController = createVehicleController;
const getAllVehiclesController = async (_req, res, next) => {
    try {
        const vehicles = await (0, vehicle_service_1.getAllVehicles)();
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
    }
    catch (err) {
        next(err);
    }
};
exports.getAllVehiclesController = getAllVehiclesController;
const getVehicleByIdController = async (req, res, next) => {
    try {
        const vehicleId = Number(req.params.vehicleId);
        const vehicle = await (0, vehicle_service_1.getVehicleById)(vehicleId);
        return res.status(200).json({
            success: true,
            message: "Vehicle retrieved successfully",
            data: vehicle,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getVehicleByIdController = getVehicleByIdController;
const updateVehicleByIdController = async (req, res, next) => {
    try {
        const vehicleId = Number(req.params.vehicleId);
        const updated = await (0, vehicle_service_1.updateVehicleById)(vehicleId, req.body);
        return res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: updated,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateVehicleByIdController = updateVehicleByIdController;
const deleteVehicleByIdController = async (req, res, next) => {
    try {
        const vehicleId = Number(req.params.vehicleId);
        await (0, vehicle_service_1.deleteVehicleById)(vehicleId);
        return res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully",
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteVehicleByIdController = deleteVehicleByIdController;
