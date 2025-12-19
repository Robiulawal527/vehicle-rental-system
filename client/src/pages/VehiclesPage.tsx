import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiClient, getErrorMessage } from "../api/client";
import { Vehicle } from "../api/types";

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const content = useMemo(() => {
    if (loading) return <div>Loading...</div>;
    if (error)
      return (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      );
    if (vehicles.length === 0) return <div>No vehicles found.</div>;

    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => (
          <div key={v.id} className="rounded border bg-white p-4">
            <div className="font-semibold">{v.vehicle_name}</div>
            <div className="text-sm text-slate-600">
              {v.type} • {v.registration_number}
            </div>
            <div className="mt-2 text-sm">
              Daily: <span className="font-medium">${v.daily_rent_price}</span>
            </div>
            <div className="mt-1 text-sm">
              Status: <span className="font-medium">{v.availability_status}</span>
            </div>
            <div className="mt-3">
              <Link
                to={`/vehicles/${v.id}`}
                className="text-sm underline text-slate-900"
              >
                View details
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  }, [vehicles, loading, error]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Vehicles</h1>
        <button
          onClick={() => void load()}
          className="px-3 py-2 rounded text-sm bg-white border"
        >
          Refresh
        </button>
      </div>

      {content}
    </div>
  );
};
