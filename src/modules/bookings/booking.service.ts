import { dbPool } from "../../config/db";
import { CreateBookingPayload, UpdateBookingPayload } from "./booking.types";

const parseISODate = (value: string): Date => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    const error = new Error("Invalid date format. Use YYYY-MM-DD");
    (error as any).statusCode = 400;
    throw error;
  }
  return d;
};

const daysBetween = (start: Date, end: Date): number => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = (end.getTime() - start.getTime()) / msPerDay;
  const days = Math.ceil(diff);
  return days;
};

export const autoReturnExpiredBookings = async (): Promise<void> => {
  await dbPool.query(
    `WITH expired AS (
      SELECT id, vehicle_id
      FROM bookings
      WHERE status = 'active' AND rent_end_date < CURRENT_DATE
    )
    UPDATE bookings b
    SET status = 'returned'
    FROM expired e
    WHERE b.id = e.id`
  );

  await dbPool.query(
    `UPDATE vehicles
     SET availability_status = 'available'
     WHERE id IN (
       SELECT vehicle_id FROM bookings
       WHERE status = 'returned' AND rent_end_date < CURRENT_DATE
     )`
  );
};

export const createBooking = async (options: {
  requester: { id: number; role: "admin" | "customer" };
  payload: CreateBookingPayload;
}) => {
  const { requester, payload } = options;

  const customerId =
    requester.role === "customer" ? requester.id : Number(payload.customer_id);

  if (!customerId || Number.isNaN(customerId)) {
    const error = new Error("customer_id is required for admin booking");
    (error as any).statusCode = 400;
    throw error;
  }

  const vehicleId = Number(payload.vehicle_id);
  if (!vehicleId || Number.isNaN(vehicleId)) {
    const error = new Error("vehicle_id is required");
    (error as any).statusCode = 400;
    throw error;
  }

  const start = parseISODate(payload.rent_start_date);
  const end = parseISODate(payload.rent_end_date);

  const numberOfDays = daysBetween(start, end);
  if (numberOfDays <= 0) {
    const error = new Error("rent_end_date must be after rent_start_date");
    (error as any).statusCode = 400;
    throw error;
  }

  const vehicleRes = await dbPool.query<{
    vehicle_name: string;
    daily_rent_price: number;
    availability_status: string;
  }>(
    `SELECT vehicle_name, daily_rent_price, availability_status
     FROM vehicles
     WHERE id = $1`,
    [vehicleId]
  );

  if (vehicleRes.rows.length === 0) {
    const error = new Error("Vehicle not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const vehicle = vehicleRes.rows[0];

  if (vehicle.availability_status !== "available") {
    const error = new Error("Vehicle is not available");
    (error as any).statusCode = 400;
    throw error;
  }

  const totalPrice = vehicle.daily_rent_price * numberOfDays;

  const bookingRes = await dbPool.query<{
    id: number;
    customer_id: number;
    vehicle_id: number;
    rent_start_date: string;
    rent_end_date: string;
    total_price: number;
    status: string;
  }>(
    `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
    [
      customerId,
      vehicleId,
      payload.rent_start_date,
      payload.rent_end_date,
      totalPrice,
    ]
  );

  await dbPool.query(
    `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
    [vehicleId]
  );

  const booking = bookingRes.rows[0];

  return {
    ...booking,
    vehicle: {
      vehicle_name: vehicle.vehicle_name,
      daily_rent_price: vehicle.daily_rent_price,
    },
  };
};

export const getBookings = async (options: {
  requester: { id: number; role: "admin" | "customer" };
}) => {
  const { requester } = options;

  await autoReturnExpiredBookings();

  if (requester.role === "admin") {
    const result = await dbPool.query(
      `SELECT
         b.id,
         b.customer_id,
         b.vehicle_id,
         b.rent_start_date,
         b.rent_end_date,
         b.total_price,
         b.status,
         u.name as customer_name,
         u.email as customer_email,
         v.vehicle_name,
         v.registration_number
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       JOIN vehicles v ON v.id = b.vehicle_id
       ORDER BY b.id ASC`
    );

    return result.rows.map((r: any) => ({
      id: r.id,
      customer_id: r.customer_id,
      vehicle_id: r.vehicle_id,
      rent_start_date: r.rent_start_date,
      rent_end_date: r.rent_end_date,
      total_price: Number(r.total_price),
      status: r.status,
      customer: {
        name: r.customer_name,
        email: r.customer_email,
      },
      vehicle: {
        vehicle_name: r.vehicle_name,
        registration_number: r.registration_number,
      },
    }));
  }

  const result = await dbPool.query(
    `SELECT
       b.id,
       b.vehicle_id,
       b.rent_start_date,
       b.rent_end_date,
       b.total_price,
       b.status,
       v.vehicle_name,
       v.registration_number,
       v.type
     FROM bookings b
     JOIN vehicles v ON v.id = b.vehicle_id
     WHERE b.customer_id = $1
     ORDER BY b.id ASC`,
    [requester.id]
  );

  return result.rows.map((r: any) => ({
    id: r.id,
    vehicle_id: r.vehicle_id,
    rent_start_date: r.rent_start_date,
    rent_end_date: r.rent_end_date,
    total_price: Number(r.total_price),
    status: r.status,
    vehicle: {
      vehicle_name: r.vehicle_name,
      registration_number: r.registration_number,
      type: r.type,
    },
  }));
};

export const updateBookingById = async (options: {
  bookingId: number;
  requester: { id: number; role: "admin" | "customer" };
  payload: UpdateBookingPayload;
}) => {
  const { bookingId, requester, payload } = options;

  const status = payload.status;

  if (requester.role === "customer") {
    if (status !== "cancelled") {
      const error = new Error("Customers can only cancel bookings");
      (error as any).statusCode = 403;
      throw error;
    }

    const bookingRes = await dbPool.query<{
      id: number;
      customer_id: number;
      vehicle_id: number;
      rent_start_date: string;
      rent_end_date: string;
      total_price: number;
      status: string;
    }>(
      `SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
       FROM bookings
       WHERE id = $1`,
      [bookingId]
    );

    if (bookingRes.rows.length === 0) {
      const error = new Error("Booking not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const booking = bookingRes.rows[0];

    if (booking.customer_id !== requester.id) {
      const error = new Error("You do not have permission to perform this action");
      (error as any).statusCode = 403;
      throw error;
    }

    if (booking.status !== "active") {
      const error = new Error("Only active bookings can be cancelled");
      (error as any).statusCode = 400;
      throw error;
    }

    const start = parseISODate(booking.rent_start_date);
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (start.getTime() <= today.getTime()) {
      const error = new Error("Booking can only be cancelled before the start date");
      (error as any).statusCode = 400;
      throw error;
    }

    const updatedRes = await dbPool.query(
      `UPDATE bookings
       SET status = 'cancelled'
       WHERE id = $1
       RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
      [bookingId]
    );

    await dbPool.query(
      `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
      [booking.vehicle_id]
    );

    return updatedRes.rows[0];
  }

  // admin
  if (status !== "returned") {
    const error = new Error("Admin can only mark bookings as returned");
    (error as any).statusCode = 400;
    throw error;
  }

  const bookingRes = await dbPool.query<{
    id: number;
    customer_id: number;
    vehicle_id: number;
    rent_start_date: string;
    rent_end_date: string;
    total_price: number;
    status: string;
  }>(
    `SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
     FROM bookings
     WHERE id = $1`,
    [bookingId]
  );

  if (bookingRes.rows.length === 0) {
    const error = new Error("Booking not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const booking = bookingRes.rows[0];

  const updatedRes = await dbPool.query(
    `UPDATE bookings
     SET status = 'returned'
     WHERE id = $1
     RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
    [bookingId]
  );

  await dbPool.query(
    `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
    [booking.vehicle_id]
  );

  return {
    ...updatedRes.rows[0],
    vehicle: { availability_status: "available" },
  };
};
