import { dbPool } from "../../config/db";
import { UpdateUserPayload, UserPublic } from "./user.types";

const normalizeEmail = (email: string): string => email.toLowerCase();

export const getAllUsers = async (): Promise<UserPublic[]> => {
  const result = await dbPool.query<UserPublic>(
    `SELECT id, name, email, phone, role
     FROM users
     ORDER BY id ASC`
  );

  return result.rows;
};

export const updateUserById = async (
  userId: number,
  payload: UpdateUserPayload,
  options: { allowRoleUpdate: boolean }
): Promise<UserPublic> => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const add = (col: string, val: unknown) => {
    fields.push(`${col} = $${idx}`);
    values.push(val);
    idx += 1;
  };

  if (payload.name !== undefined) add("name", payload.name);
  if (payload.email !== undefined) add("email", normalizeEmail(payload.email));
  if (payload.phone !== undefined) add("phone", payload.phone);
  if (payload.role !== undefined) {
    if (!options.allowRoleUpdate) {
      const error = new Error("Only admin can update role");
      (error as any).statusCode = 403;
      throw error;
    }
    add("role", payload.role);
  }

  if (fields.length === 0) {
    const error = new Error("No fields provided to update");
    (error as any).statusCode = 400;
    throw error;
  }

  values.push(userId);

  const result = await dbPool.query<UserPublic>(
    `UPDATE users
     SET ${fields.join(", ")}
     WHERE id = $${idx}
     RETURNING id, name, email, phone, role`,
    values
  );

  if (result.rows.length === 0) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

export const deleteUserById = async (userId: number): Promise<void> => {
  const activeBooking = await dbPool.query<{ exists: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM bookings
       WHERE customer_id = $1 AND status = 'active'
     ) as exists`,
    [userId]
  );

  if (activeBooking.rows[0]?.exists) {
    const error = new Error("Cannot delete user with active bookings");
    (error as any).statusCode = 400;
    throw error;
  }

  const result = await dbPool.query(
    `DELETE FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rowCount === 0) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }
};
