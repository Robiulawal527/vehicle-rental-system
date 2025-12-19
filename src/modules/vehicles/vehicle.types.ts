export type VehicleType = "car" | "bike" | "van" | "SUV";
export type VehicleAvailabilityStatus = "available" | "booked";

export interface Vehicle {
  id: number;
  vehicle_name: string;
  type: VehicleType;
  registration_number: string;
  daily_rent_price: number;
  availability_status: VehicleAvailabilityStatus;
}

export interface CreateVehiclePayload {
  vehicle_name: string;
  type: VehicleType;
  registration_number: string;
  daily_rent_price: number;
  availability_status?: VehicleAvailabilityStatus;
}

export interface UpdateVehiclePayload {
  vehicle_name?: string;
  type?: VehicleType;
  registration_number?: string;
  daily_rent_price?: number;
  availability_status?: VehicleAvailabilityStatus;
}
