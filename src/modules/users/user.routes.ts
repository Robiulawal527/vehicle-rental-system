import { Router } from "express";

import { authenticate, authorize } from "../../middlewares/authMiddleware";

import {
	deleteUserByIdController,
	getAllUsersController,
	updateUserByIdController,
} from "./user.controller";

export const userRouter = Router();

userRouter.get("/", authenticate, authorize("admin"), getAllUsersController);

userRouter.put("/:userId", authenticate, updateUserByIdController);

userRouter.delete(
	"/:userId",
	authenticate,
	authorize("admin"),
	deleteUserByIdController
);


