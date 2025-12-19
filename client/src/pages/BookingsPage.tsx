import React, { useEffect, useMemo, useState } from "react";

import { apiClient, getErrorMessage } from "../api/client";
import {
  BookingAdminView,
  BookingCustomerView,
  Vehicle,
} from "../api/types";
import { useAuth } from "../state/auth";

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string>("");
  const [rentStartDate, setRentStartDate] = useState<string>("");
  const [rentEndDate, setRentEndDate] = useState<string>("");

  const [bookings, setBookings] = useState<
    Array<BookingCustomerView | BookingAdminView>
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const [vehiclesRes, bookingsRes] = await Promise.all([
        apiClient.get("/vehicles"),
        apiClient.get("/bookings"),
      ]);

      setVehicles(vehiclesRes.data.data ?? []);
      setBookings(bookingsRes.data.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiClient.post("/bookings", {
        vehicle_id: Number(vehicleId),
        rent_start_date: rentStartDate,
        rent_end_date: rentEndDate,
        ...(user?.role === "admin" ? { customer_id: user.id } : {}),
      });
      setVehicleId("");
      setRentStartDate("");
      setRentEndDate("");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const cancelBooking = async (id: number) => {
    setError(null);
    try {
      await apiClient.put(`/bookings/${id}`, { status: "cancelled" });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const markReturned = async (id: number) => {
    setError(null);
    try {
      await apiClient.put(`/bookings/${id}`, { status: "returned" });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.availability_status === "available"),
    [vehicles]
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bookings</h1>
        <button
          onClick={() => void load()}
          className="px-3 py-2 rounded text-sm bg-white border"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold mb-3">Create booking</h2>
        <form onSubmit={createBooking} className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <div className="text-sm text-slate-600">Vehicle</div>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="mt-1 w-full rounded border px-3 py-2"
            >
              <option value="" disabled>
                Select available vehicle
              </option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_name} ({v.type}) - ${v.daily_rent_price}/day
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="text-sm text-slate-600">Start date</div>
            <input
              value={rentStartDate}
              onChange={(e) => setRentStartDate(e.target.value)}
              type="date"
              required
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <label className="block">
            <div className="text-sm text-slate-600">End date</div>
            <input
              value={rentEndDate}
              onChange={(e) => setRentEndDate(e.target.value)}
              type="date"
              required
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <div className="sm:col-span-2">
            <button
              disabled={submitting}
              className="px-4 py-2 rounded bg-slate-900 text-white disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create booking"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold mb-3">
          {user?.role === "admin" ? "All bookings" : "Your bookings"}
        </h2>

        {bookings.length === 0 ? (
          <div className="text-sm text-slate-600">No bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Vehicle</th>
                  {user?.role === "admin" && (
                    <th className="py-2 pr-3">Customer</th>
                  )}
                  <th className="py-2 pr-3">Start</th>
                  <th className="py-2 pr-3">End</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any) => (
                  <tr key={b.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-3">{b.id}</td>
                    <td className="py-2 pr-3">
                      {b.vehicle?.vehicle_name}
                      {b.vehicle?.registration_number
                        ? ` (${b.vehicle.registration_number})`
                        : ""}
                    </td>
                    {user?.role === "admin" && (
                      <td className="py-2 pr-3">
                        {b.customer?.name} ({b.customer?.email})
                      </td>
                    )}
                    <td className="py-2 pr-3">{b.rent_start_date}</td>
                    <td className="py-2 pr-3">{b.rent_end_date}</td>
                    <td className="py-2 pr-3">${b.total_price}</td>
                    <td className="py-2 pr-3">{b.status}</td>
                    <td className="py-2 pr-3">
                      {user?.role === "admin" ? (
                        <button
                          disabled={b.status !== "active"}
                          onClick={() => void markReturned(b.id)}
                          className="px-3 py-1 rounded border bg-white disabled:opacity-50"
                        >
                          Mark returned
                        </button>
                      ) : (
                        <button
                          disabled={b.status !== "active"}
                          onClick={() => void cancelBooking(b.id)}
                          className="px-3 py-1 rounded border bg-white disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
