"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinController = exports.signupController = void 0;
const auth_service_1 = require("./auth.service");
const signupController = async (req, res, next) => {
    try {
        const user = await (0, auth_service_1.signupUser)(req.body);
        const responseData = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        };
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: responseData,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.signupController = signupController;
const signinController = async (req, res, next) => {
    try {
        const { token, user } = await (0, auth_service_1.signinUser)(req.body);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.signinController = signinController;
