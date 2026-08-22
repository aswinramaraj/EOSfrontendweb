"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import { authService } from "../services/auth.service";
import type { QuickRole, Role } from "../types";

// Where each role lands after login. Roles with no entry fall back to "/".
const ROLE_HOME: Partial<Record<Role, string>> = {
  admin: "/admin",
  library: "/library",
  placement: "/placement",
  hr_payroll: "/hr",
  gate_warden: "/hostel",
  iqac: "/iqac",
  academic_coordinator: "/academic-coordinator",
};

// The backend's /auth/login has no role parameter — it returns whatever role
// is on the account. "Login as X" is a client-side shortcut only; if it
// doesn't match the account's real role, we reject after the fact instead of
// silently logging the user into the wrong portal.
const QUICK_ROLE_MATCH: Record<QuickRole, Role[]> = {
  student: ["student"],
  faculty: ["faculty", "hod", "academic_coordinator"],
  parent: ["parent"],
  admin: ["admin"],
};

export function useLogin() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(
    email: string,
    password: string,
    expectedRole: QuickRole | null,
  ) {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authService.login({ email, password });

      if (
        expectedRole &&
        !QUICK_ROLE_MATCH[expectedRole].includes(result.user.role)
      ) {
        setError(
          `This account isn't registered as ${expectedRole}. Please choose the correct login option.`,
        );
        return;
      }

      tokenStorage.set(result.accessToken, result.user);
      router.push(ROLE_HOME[result.user.role] ?? "/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return { login, isSubmitting, error };
}
