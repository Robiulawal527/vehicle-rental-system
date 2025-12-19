import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiClient, getErrorMessage } from "../api/client";
import { Vehicle } from "../api/types";

export const VehicleDetailsPage: React.FC = () => {
  const { vehicleId } = useParams();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await apiClient.get(`/vehicles/${vehicleId}`);
        setVehicle(res.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [vehicleId]);

  if (loading) return <div>Loading...</div>;

  if (error)
    return (
      <div className="space-y-3">
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
        <Link to="/vehicles" className="underline text-sm">
          Back to vehicles
        </Link>
      </div>
    );

  if (!vehicle) return <div>Not found.</div>;

  return (
    <div className="space-y-4">
      <div>
        <Link to="/vehicles" className="underline text-sm">
          Back
        </Link>
      </div>

      <div className="rounded border bg-white p-4">
        <h1 className="text-xl font-semibold">{vehicle.vehicle_name}</h1>
        <div className="text-sm text-slate-600">
          {vehicle.type} • {vehicle.registration_number}
        </div>

        <div className="mt-3 grid gap-2 text-sm">
          <div>
            Daily rent price: <span className="font-medium">${vehicle.daily_rent_price}</span>
          </div>
          <div>
            Availability: <span className="font-medium">{vehicle.availability_status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
