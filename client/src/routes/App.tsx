import React from "react";
import { Route, Routes } from "react-router-dom";

import { Layout } from "../components/Layout";
import { RequireAuth, RequireRole } from "../components/Protected";
import { HomePage } from "../pages/HomePage";
import { SignInPage } from "../pages/SignInPage";
import { SignUpPage } from "../pages/SignUpPage";
import { VehiclesPage } from "../pages/VehiclesPage";
import { VehicleDetailsPage } from "../pages/VehicleDetailsPage";
import { BookingsPage } from "../pages/BookingsPage";
import { AdminVehiclesPage } from "../pages/AdminVehiclesPage";
import { AdminUsersPage } from "../pages/AdminUsersPage";

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/vehicles/:vehicleId" element={<VehicleDetailsPage />} />

        <Route
          path="/bookings"
          element={
            <RequireAuth>
              <BookingsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/vehicles"
          element={
            <RequireRole role="admin">
              <AdminVehiclesPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole role="admin">
              <AdminUsersPage />
            </RequireRole>
          }
        />

        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
};
