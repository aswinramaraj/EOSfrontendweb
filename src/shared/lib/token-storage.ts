import type { AuthUser } from "@/modules/auth/types";

const TOKEN_KEY = "eos_access_token";
const USER_KEY = "eos_user";

// Cached so useSyncExternalStore (see useAuthUser) gets a stable reference
// across renders instead of a freshly-parsed object every call.
let cachedUser: AuthUser | null | undefined = undefined;

function readUserFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export const tokenStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    if (cachedUser === undefined) {
      cachedUser = readUserFromStorage();
    }
    return cachedUser;
  },

  set(token: string, user: AuthUser) {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    cachedUser = user;
  },

  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    cachedUser = null;
  },
};
