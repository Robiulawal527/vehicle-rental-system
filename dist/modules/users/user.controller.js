"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserByIdController = exports.updateUserByIdController = exports.getAllUsersController = void 0;
const user_service_1 = require("./user.service");
const getAllUsersController = async (_req, res, next) => {
    try {
        const users = await (0, user_service_1.getAllUsers)();
        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllUsersController = getAllUsersController;
const updateUserByIdController = async (req, res, next) => {
    try {
        const userId = Number(req.params.userId);
        const requester = req.user;
        if (!requester) {
            const error = new Error("User not authenticated");
            error.statusCode = 401;
            throw error;
        }
        const isAdmin = requester.role === "admin";
        const isSelf = requester.id === userId;
        if (!isAdmin && !isSelf) {
            const error = new Error("You do not have permission to perform this action");
            error.statusCode = 403;
            throw error;
        }
        const updated = await (0, user_service_1.updateUserById)(userId, req.body, {
            allowRoleUpdate: isAdmin,
        });
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updated,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateUserByIdController = updateUserByIdController;
const deleteUserByIdController = async (req, res, next) => {
    try {
        const userId = Number(req.params.userId);
        await (0, user_service_1.deleteUserById)(userId);
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUserByIdController = deleteUserByIdController;
