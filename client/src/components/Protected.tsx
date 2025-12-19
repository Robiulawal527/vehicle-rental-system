import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth, UserRole } from "../state/auth";

export const RequireAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
};

export const RequireRole: React.FC<
  React.PropsWithChildren<{ role: UserRole }>
> = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};
