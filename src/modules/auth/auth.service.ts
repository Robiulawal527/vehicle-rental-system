import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { dbPool } from "../../config/db";

import { SigninPayload, SignupPayload, User } from "./auth.types";

const normalizeEmail = (email: string): string => email.toLowerCase();

export const signupUser = async (payload: SignupPayload): Promise<User> => {
  const { name, email, password, phone, role = "customer" } = payload;

  const normalizedEmail = normalizeEmail(email);

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await dbPool.query<User>(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, password, phone, role`,
    [name, normalizedEmail, hashedPassword, phone, role]
  );

  return result.rows[0];
};

export const signinUser = async (
  payload: SigninPayload
) => {
  const normalizedEmail = normalizeEmail(payload.email);

  const result = await dbPool.query<User>(
    `SELECT id, name, email, password, phone, role
     FROM users
     WHERE email = $1`,
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    const error = new Error("Invalid email or password");
    (error as any).statusCode = 400;
    throw error;
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    (error as any).statusCode = 400;
    throw error;
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

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

