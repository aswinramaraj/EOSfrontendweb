import { ApiError } from "./api-client";
import { tokenStorage } from "./token-storage";

export function requireToken(): string {
  const token = tokenStorage.getToken();
  if (!token) {
    throw new ApiError("You are not signed in.", 401, "NO_TOKEN");
  }
  return token;
}
