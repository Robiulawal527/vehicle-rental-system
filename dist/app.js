"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const vehicle_routes_1 = require("./modules/vehicles/vehicle.routes");
const user_routes_1 = require("./modules/users/user.routes");
const booking_routes_1 = require("./modules/bookings/booking.routes");
const globalErrorHandler_1 = require("./middlewares/globalErrorHandler");
dotenv_1.default.config();
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use("/api/v1/auth", auth_routes_1.authRouter);
exports.app.use("/api/v1/vehicles", vehicle_routes_1.vehicleRouter);
exports.app.use("/api/v1/users", user_routes_1.userRouter);
exports.app.use("/api/v1/bookings", booking_routes_1.bookingRouter);
// Serve frontend (built with Vite) if available
const clientDistPath = path_1.default.resolve(__dirname, "..", "client", "dist");
if (fs_1.default.existsSync(clientDistPath)) {
    exports.app.use(express_1.default.static(clientDistPath));
    exports.app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/"))
            return next();
        return res.sendFile(path_1.default.join(clientDistPath, "index.html"));
    });
}
exports.app.use(globalErrorHandler_1.globalErrorHandler);
