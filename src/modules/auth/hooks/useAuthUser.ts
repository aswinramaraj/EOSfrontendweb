"use client";

import { useSyncExternalStore } from "react";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { AuthUser } from "../types";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  // "storage" only fires in OTHER tabs; tokenStorage.subscribe covers a
  // same-tab set()/clear() (e.g. a 401-triggered logout) that "storage"
  // would otherwise never surface here.
  const unsubscribeSameTab = tokenStorage.subscribe(callback);
  return () => {
    window.removeEventListener("storage", callback);
    unsubscribeSameTab();
  };
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
