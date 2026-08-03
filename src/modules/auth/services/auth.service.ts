import { apiClient } from "@/shared/lib/api-client";
import type { LoginCredentials, LoginResult, MeProfile } from "../types";

export const authService = {
  login(credentials: LoginCredentials) {
    return apiClient.post<LoginResult>("/auth/login", credentials);
  },

  getMe(token: string) {
    return apiClient.get<MeProfile>("/auth/me", token);
  },
};
