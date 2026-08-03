"use client";

import { useSyncExternalStore } from "react";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { AuthUser } from "../types";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getServerSnapshot(): AuthUser | null | undefined {
  return undefined;
}

/**
 * Three states, not two: `undefined` means "haven't checked localStorage
 * yet" (only possible on the pre-hydration render), `null` means "checked —
 * no session", and AuthUser means "checked — logged in". Collapsing the
 * first two into `null` is a trap: an effect that redirects on `!user` fires
 * once with that transient pre-hydration null and navigates to /login
 * before the real value ever gets a chance to render.
 */
export function useAuthUser() {
  return useSyncExternalStore(subscribe, tokenStorage.getUser, getServerSnapshot);
}
