import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../state/auth";

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Vehicle Rental System</h1>
      <p className="text-slate-700">
        Browse vehicles, create bookings, and manage inventory (admin).
      </p>

      <div className="flex gap-3">
        <Link
          to="/vehicles"
          className="px-4 py-2 rounded bg-slate-900 text-white"
        >
          View Vehicles
        </Link>
        {user ? (
          <Link
            to="/bookings"
            className="px-4 py-2 rounded bg-white border"
          >
            Your Bookings
          </Link>
        ) : (
          <Link to="/signin" className="px-4 py-2 rounded bg-white border">
            Sign in to book
          </Link>
        )}
      </div>
    </div>
  );
};
