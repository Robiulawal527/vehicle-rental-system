export type UserRole = "admin" | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}

export interface SigninPayload {
  email: string;
  password: string;
}
