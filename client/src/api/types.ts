export type UserRole = "admin" | "customer";

export type VehicleType = "car" | "bike" | "van" | "SUV";
export type VehicleAvailabilityStatus = "available" | "booked";

export type Vehicle = {
  id: number;
  vehicle_name: string;
  type: VehicleType;
  registration_number: string;
  daily_rent_price: number;
  availability_status: VehicleAvailabilityStatus;
};

export type BookingStatus = "active" | "cancelled" | "returned";

export type BookingCustomerView = {
  id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
  total_price: number;
  status: BookingStatus;
  vehicle: {
    vehicle_name: string;
    registration_number: string;
    type: VehicleType;
  };
};

export type BookingAdminView = {
  id: number;
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
  total_price: number;
  status: BookingStatus;
  customer: {
    name: string;
    email: string;
  };
  vehicle: {
    vehicle_name: string;
    registration_number: string;
  };
};

export type UserPublic = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
};
