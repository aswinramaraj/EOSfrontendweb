import { apiClient } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { Quota } from "../components/quotas/types";

export const quotasService = {
  list() {
    return apiClient.get<Quota[]>("/quotas", tokenStorage.getToken());
  },

  create(name: string) {
    return apiClient.post<Quota>("/quotas", { name }, tokenStorage.getToken());
  },

  update(id: number, name: string) {
    return apiClient.put<Quota>(`/quotas/${id}`, { name }, tokenStorage.getToken());
  },

  patch(id: number, changes: Partial<{ name: string }>) {
    return apiClient.patch<Quota>(`/quotas/${id}`, changes, tokenStorage.getToken());
  },

  remove(id: number) {
    return apiClient.delete<void>(`/quotas/${id}`, tokenStorage.getToken());
  },
};
