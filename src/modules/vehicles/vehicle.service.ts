import { dbPool } from "../../config/db";
import {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  Vehicle,
  VehicleAvailabilityStatus,
  VehicleType,
} from "./vehicle.types";

const allowedTypes: VehicleType[] = ["car", "bike", "van", "SUV"];
const allowedAvailability: VehicleAvailabilityStatus[] = ["available", "booked"];

const assertValidVehicleType = (type: unknown) => {
  if (typeof type !== "string" || !allowedTypes.includes(type as VehicleType)) {
    const error = new Error(
      `Invalid vehicle type. Allowed types: ${allowedTypes.join(", ")}`
    );
    (error as any).statusCode = 400;
    throw error;
  }
};

const assertValidAvailability = (status: unknown) => {
  if (
    typeof status !== "string" ||
    !allowedAvailability.includes(status as VehicleAvailabilityStatus)
  ) {
    const error = new Error(
      `Invalid availability status. Allowed: ${allowedAvailability.join(", ")}`
    );
    (error as any).statusCode = 400;
    throw error;
  }
};

export const createVehicle = async (
  payload: CreateVehiclePayload
): Promise<Vehicle> => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status = "available",
  } = payload;

  if (!vehicle_name || !registration_number) {
    const error = new Error("vehicle_name and registration_number are required");
    (error as any).statusCode = 400;
    throw error;
  }

  assertValidVehicleType(type);
  assertValidAvailability(availability_status);

  if (typeof daily_rent_price !== "number" || daily_rent_price <= 0) {
    const error = new Error("daily_rent_price must be a positive number");
    (error as any).statusCode = 400;
    throw error;
  }

  const result = await dbPool.query<Vehicle>(
    `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return result.rows[0];
};

export const getAllVehicles = async (): Promise<Vehicle[]> => {
  const result = await dbPool.query<Vehicle>(
    `SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status
     FROM vehicles
     ORDER BY id ASC`
  );

  return result.rows;
};

export const getVehicleById = async (vehicleId: number): Promise<Vehicle> => {
  const result = await dbPool.query<Vehicle>(
    `SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status
     FROM vehicles
     WHERE id = $1`,
    [vehicleId]
  );

  if (result.rows.length === 0) {
    const error = new Error("Vehicle not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

export const updateVehicleById = async (
  vehicleId: number,
  payload: UpdateVehiclePayload
): Promise<Vehicle> => {
  if (payload.type !== undefined) assertValidVehicleType(payload.type);
  if (payload.availability_status !== undefined)
    assertValidAvailability(payload.availability_status);
  if (payload.daily_rent_price !== undefined) {
    if (
      typeof payload.daily_rent_price !== "number" ||
      payload.daily_rent_price <= 0
    ) {
      const error = new Error("daily_rent_price must be a positive number");
      (error as any).statusCode = 400;
      throw error;
    }
  }

  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const add = (col: string, val: unknown) => {
    fields.push(`${col} = $${idx}`);
    values.push(val);
    idx += 1;
  };

  if (payload.vehicle_name !== undefined) add("vehicle_name", payload.vehicle_name);
  if (payload.type !== undefined) add("type", payload.type);
  if (payload.registration_number !== undefined)
    add("registration_number", payload.registration_number);
  if (payload.daily_rent_price !== undefined)
    add("daily_rent_price", payload.daily_rent_price);
  if (payload.availability_status !== undefined)
    add("availability_status", payload.availability_status);

  if (fields.length === 0) {
    const error = new Error("No fields provided to update");
    (error as any).statusCode = 400;
    throw error;
  }

  values.push(vehicleId);

  const result = await dbPool.query<Vehicle>(
    `UPDATE vehicles
     SET ${fields.join(", ")}
     WHERE id = $${idx}
     RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
    values
  );

  if (result.rows.length === 0) {
    const error = new Error("Vehicle not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

export const deleteVehicleById = async (vehicleId: number): Promise<void> => {
  const activeBooking = await dbPool.query<{ exists: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM bookings
       WHERE vehicle_id = $1 AND status = 'active'
     ) as exists`,
    [vehicleId]
  );

  if (activeBooking.rows[0]?.exists) {
    const error = new Error("Cannot delete vehicle with active bookings");
    (error as any).statusCode = 400;
    throw error;
  }

  const result = await dbPool.query(
    `DELETE FROM vehicles WHERE id = $1`,
    [vehicleId]
  );

  if (result.rowCount === 0) {
    const error = new Error("Vehicle not found");
    (error as any).statusCode = 404;
    throw error;
  }
};
