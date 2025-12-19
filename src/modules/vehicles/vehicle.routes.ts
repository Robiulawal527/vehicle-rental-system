import { Router } from "express";

import { authenticate, authorize } from "../../middlewares/authMiddleware";

import {
	createVehicleController,
	deleteVehicleByIdController,
	getAllVehiclesController,
	getVehicleByIdController,
	updateVehicleByIdController,
} from "./vehicle.controller";

export const vehicleRouter = Router();

vehicleRouter.get("/", getAllVehiclesController);

vehicleRouter.get("/:vehicleId", getVehicleByIdController);

vehicleRouter.post(
	"/",
	authenticate,
	authorize("admin"),
	createVehicleController
);

vehicleRouter.put(
	"/:vehicleId",
	authenticate,
	authorize("admin"),
	updateVehicleByIdController
);

vehicleRouter.delete(
	"/:vehicleId",
	authenticate,
	authorize("admin"),
	deleteVehicleByIdController
);


