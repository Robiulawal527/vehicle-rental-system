-- Local development schema for vehicle-rental-system
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer'))
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
  registration_number TEXT NOT NULL UNIQUE,
  daily_rent_price NUMERIC NOT NULL CHECK (daily_rent_price > 0),
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'booked'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES users(id),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  rent_start_date DATE NOT NULL,
  rent_end_date DATE NOT NULL,
  total_price NUMERIC NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'returned'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
