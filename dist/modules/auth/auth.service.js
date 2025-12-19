"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinUser = exports.signupUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../config/db");
const normalizeEmail = (email) => email.toLowerCase();
const signupUser = async (payload) => {
    const { name, email, password, phone, role = "customer" } = payload;
    const normalizedEmail = normalizeEmail(email);
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const result = await db_1.dbPool.query(`INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, password, phone, role`, [name, normalizedEmail, hashedPassword, phone, role]);
    return result.rows[0];
};
exports.signupUser = signupUser;
const signinUser = async (payload) => {
    const normalizedEmail = normalizeEmail(payload.email);
    const result = await db_1.dbPool.query(`SELECT id, name, email, password, phone, role
     FROM users
     WHERE email = $1`, [normalizedEmail]);
    if (result.rows.length === 0) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        throw error;
    }
    const user = result.rows[0];
    const isPasswordValid = await bcrypt_1.default.compare(payload.password, user.password);
    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        throw error;
    }
    const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };
    const token = jsonwebtoken_1.default.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "7d" });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        },
    };
};
exports.signinUser = signinUser;
