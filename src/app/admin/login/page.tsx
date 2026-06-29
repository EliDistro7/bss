// app/admin/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login, ApiError } from "../../../lib/api/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bss-black px-6">
      <div className="w-full max-w-narrow">
        <p className="eyebrow text-center">BSS Admin</p>
        <h1 className="display-md text-center mb-10">Sign in</h1>

        <form onSubmit={handleSubmit} className="card p-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-body tracking-wide uppercase text-bss-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-bss-surface border border-bss-border text-bss-white px-4 py-3 text-sm
                         focus:outline-none focus:border-bss-white transition-colors duration-200"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-body tracking-wide uppercase text-bss-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-bss-surface border border-bss-border text-bss-white px-4 py-3 text-sm
                         focus:outline-none focus:border-bss-white transition-colors duration-200"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary justify-center mt-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}