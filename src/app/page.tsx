"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/shared/lib/token-storage";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";

export default function Home() {
  const router = useRouter();
  const user = useAuthUser();

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  function handleLogout() {
    tokenStorage.clear();
    router.replace("/login");
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 p-8 text-center">
      <p className="text-sm text-zinc-500">Signed in as</p>
      <h1 className="text-2xl font-bold text-zinc-900">{user.email}</h1>
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
        {user.role}
      </span>
      <button
        onClick={handleLogout}
        className="mt-4 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Log out
      </button>
    </div>
  );
}
