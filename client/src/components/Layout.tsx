import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../state/auth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded text-sm ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">
            Vehicle Rental
          </Link>

          <nav className="flex items-center gap-2">
            <NavLink to="/vehicles" className={navLinkClass}>
              Vehicles
            </NavLink>

            {user && (
              <NavLink to="/bookings" className={navLinkClass}>
                Bookings
              </NavLink>
            )}

            {user?.role === "admin" && (
              <>
                <NavLink to="/admin/vehicles" className={navLinkClass}>
                  Admin Vehicles
                </NavLink>
                <NavLink to="/admin/users" className={navLinkClass}>
                  Admin Users
                </NavLink>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-sm text-slate-600">
                  {user.name} ({user.role})
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded text-sm bg-slate-900 text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-3 py-2 rounded text-sm text-slate-700 hover:bg-slate-100"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded text-sm bg-slate-900 text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
