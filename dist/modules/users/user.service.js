"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.updateUserById = exports.getAllUsers = void 0;
const db_1 = require("../../config/db");
const normalizeEmail = (email) => email.toLowerCase();
const getAllUsers = async () => {
    const result = await db_1.dbPool.query(`SELECT id, name, email, phone, role
     FROM users
     ORDER BY id ASC`);
    return result.rows;
};
exports.getAllUsers = getAllUsers;
const updateUserById = async (userId, payload, options) => {
    const fields = [];
    const values = [];
    let idx = 1;
    const add = (col, val) => {
        fields.push(`${col} = $${idx}`);
        values.push(val);
        idx += 1;
    };
    if (payload.name !== undefined)
        add("name", payload.name);
    if (payload.email !== undefined)
        add("email", normalizeEmail(payload.email));
    if (payload.phone !== undefined)
        add("phone", payload.phone);
    if (payload.role !== undefined) {
        if (!options.allowRoleUpdate) {
            const error = new Error("Only admin can update role");
            error.statusCode = 403;
            throw error;
        }
        add("role", payload.role);
    }
    if (fields.length === 0) {
        const error = new Error("No fields provided to update");
        error.statusCode = 400;
        throw error;
    }
    values.push(userId);
    const result = await db_1.dbPool.query(`UPDATE users
     SET ${fields.join(", ")}
     WHERE id = $${idx}
     RETURNING id, name, email, phone, role`, values);
    if (result.rows.length === 0) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return result.rows[0];
};
exports.updateUserById = updateUserById;
const deleteUserById = async (userId) => {
    const activeBooking = await db_1.dbPool.query(`SELECT EXISTS(
       SELECT 1 FROM bookings
       WHERE customer_id = $1 AND status = 'active'
     ) as exists`, [userId]);
    if (activeBooking.rows[0]?.exists) {
        const error = new Error("Cannot delete user with active bookings");
        error.statusCode = 400;
        throw error;
    }
    const result = await db_1.dbPool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    if (result.rowCount === 0) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
};
exports.deleteUserById = deleteUserById;
