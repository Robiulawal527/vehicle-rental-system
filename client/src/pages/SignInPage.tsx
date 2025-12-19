import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiClient, getErrorMessage } from "../api/client";
import { useAuth } from "../state/auth";

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/signin", { email, password });
      const { token, user } = res.data.data;
      setAuth(token, user);
      navigate("/vehicles");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-3">Sign in</h1>

      {error && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <div className="text-sm text-slate-600">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <label className="block">
          <div className="text-sm text-slate-600">Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <button
          disabled={loading}
          className="w-full rounded bg-slate-900 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-3 text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <a className="underline" href="/signup">
          Sign up
        </a>
      </div>
    </div>
  );
};
