import React, { useEffect, useState } from "react";

import { apiClient, getErrorMessage } from "../api/client";
import { Vehicle, VehicleAvailabilityStatus, VehicleType } from "../api/types";

const vehicleTypes: VehicleType[] = ["car", "bike", "van", "SUV"];
const availability: VehicleAvailabilityStatus[] = ["available", "booked"];

export const AdminVehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vehicle_name: "",
    type: "car" as VehicleType,
    registration_number: "",
    daily_rent_price: 50,
    availability_status: "available" as VehicleAvailabilityStatus,
  });

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.get("/vehicles");
      setVehicles(res.data.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiClient.post("/vehicles", {
        ...form,
        daily_rent_price: Number(form.daily_rent_price),
      });
      setForm({
        vehicle_name: "",
        type: "car",
        registration_number: "",
        daily_rent_price: 50,
        availability_status: "available",
      });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const update = async (id: number, patch: Partial<Vehicle>) => {
    setError(null);
    try {
      await apiClient.put(`/vehicles/${id}`, patch);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const remove = async (id: number) => {
    setError(null);
    try {
      await apiClient.delete(`/vehicles/${id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin: Vehicles</h1>
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
        <h2 className="font-semibold mb-3">Create vehicle</h2>
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <div className="text-sm text-slate-600">Vehicle name</div>
            <input
              value={form.vehicle_name}
              onChange={(e) => setForm((f) => ({ ...f, vehicle_name: e.target.value }))}
              required
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <label className="block">
            <div className="text-sm text-slate-600">Type</div>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as VehicleType }))}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              {vehicleTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="text-sm text-slate-600">Availability</div>
            <select
              value={form.availability_status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  availability_status: e.target.value as VehicleAvailabilityStatus,
                }))
              }
              className="mt-1 w-full rounded border px-3 py-2"
            >
              {availability.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="text-sm text-slate-600">Registration number</div>
            <input
              value={form.registration_number}
              onChange={(e) =>
                setForm((f) => ({ ...f, registration_number: e.target.value }))
              }
              required
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <label className="block">
            <div className="text-sm text-slate-600">Daily rent price</div>
            <input
              value={form.daily_rent_price}
              onChange={(e) =>
                setForm((f) => ({ ...f, daily_rent_price: Number(e.target.value) }))
              }
              type="number"
              min={1}
              required
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <div className="sm:col-span-2">
            <button className="px-4 py-2 rounded bg-slate-900 text-white">
              Create
            </button>
          </div>
        </form>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold mb-3">Manage vehicles</h2>

        {vehicles.length === 0 ? (
          <div className="text-sm text-slate-600">No vehicles found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Reg</th>
                  <th className="py-2 pr-3">Daily</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-3">{v.id}</td>
                    <td className="py-2 pr-3">{v.vehicle_name}</td>
                    <td className="py-2 pr-3">{v.type}</td>
                    <td className="py-2 pr-3">{v.registration_number}</td>
                    <td className="py-2 pr-3">${v.daily_rent_price}</td>
                    <td className="py-2 pr-3">
                      <select
                        value={v.availability_status}
                        onChange={(e) =>
                          void update(v.id, {
                            availability_status: e.target
                              .value as VehicleAvailabilityStatus,
                          })
                        }
                        className="rounded border px-2 py-1"
                      >
                        {availability.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <button
                        onClick={() => void remove(v.id)}
                        className="px-3 py-1 rounded border bg-white"
                      >
                        Delete
                      </button>
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
