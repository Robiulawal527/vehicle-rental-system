import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { authRouter } from "./modules/auth/auth.routes";
import { vehicleRouter } from "./modules/vehicles/vehicle.routes";
import { userRouter } from "./modules/users/user.routes";
import { bookingRouter } from "./modules/bookings/booking.routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

dotenv.config();

export const app: Application = express();

app.use(cors());

app.use(express.json());

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/vehicles", vehicleRouter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/bookings", bookingRouter);

app.use(globalErrorHandler);

