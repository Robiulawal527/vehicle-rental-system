export type UserRole = "admin" | "customer";

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
}
