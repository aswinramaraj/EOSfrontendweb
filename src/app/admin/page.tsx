"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { tokenStorage } from "@/shared/lib/token-storage";
import { authService } from "@/modules/auth/services/auth.service";
import { ApiError } from "@/shared/lib/api-client";
import type { MeProfile } from "@/modules/auth/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = useAuthUser();
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
      return;
    }

    const token = tokenStorage.getToken();
    if (!token) return;

    authService
      .getMe(token)
      .then(setProfile)
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.message : "Failed to load profile."),
      );
  }, [user, router]);

  function handleLogout() {
    tokenStorage.clear();
    router.replace("/login");
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">Admin dashboard — placeholder</p>
          <h1 className="text-2xl font-bold text-zinc-900">Welcome, {user.email}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Log out
        </button>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Session (from login)
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-500">User ID</dt>
            <dd className="font-medium text-zinc-900">{user.id}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Email</dt>
            <dd className="font-medium text-zinc-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Role</dt>
            <dd className="font-medium text-zinc-900">{user.role}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Role ID</dt>
            <dd className="font-medium text-zinc-900">{user.roleId}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Full profile — GET /auth/me
        </h2>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {!error && !profile && <p className="mt-3 text-sm text-zinc-500">Loading…</p>}
        {profile && (
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-50 p-4 text-xs text-zinc-800">
            {JSON.stringify(profile, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
