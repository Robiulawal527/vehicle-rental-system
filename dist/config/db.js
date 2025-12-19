"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbPool = void 0;
const pg_1 = require("pg");
exports.dbPool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});
