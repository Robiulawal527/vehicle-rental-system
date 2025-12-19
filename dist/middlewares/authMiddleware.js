"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            errors: "Authentication token is missing",
        });
    }
    const [, token] = authHeader.split(" ");
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            errors: "Invalid authorization header format",
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            errors: "Invalid or expired token",
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            errors: "User not authenticated",
        });
    }
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Forbidden",
            errors: "You do not have permission to perform this action",
        });
    }
    next();
};
exports.authorize = authorize;
