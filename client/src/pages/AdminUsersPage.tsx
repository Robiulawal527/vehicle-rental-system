import React, { useEffect, useState } from "react";

import { apiClient, getErrorMessage } from "../api/client";
import { UserPublic, UserRole } from "../api/types";

const roles: UserRole[] = ["admin", "customer"];

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.get("/users");
      setUsers(res.data.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = async (id: number, patch: Partial<UserPublic>) => {
    setError(null);
    try {
      await apiClient.put(`/users/${id}`, patch);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const remove = async (id: number) => {
    setError(null);
    try {
      await apiClient.delete(`/users/${id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin: Users</h1>
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
        {users.length === 0 ? (
          <div className="text-sm text-slate-600">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-3">{u.id}</td>
                    <td className="py-2 pr-3">{u.name}</td>
                    <td className="py-2 pr-3">{u.email}</td>
                    <td className="py-2 pr-3">{u.phone}</td>
                    <td className="py-2 pr-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          void update(u.id, { role: e.target.value as UserRole })
                        }
                        className="rounded border px-2 py-1"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <button
                        onClick={() => void remove(u.id)}
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
