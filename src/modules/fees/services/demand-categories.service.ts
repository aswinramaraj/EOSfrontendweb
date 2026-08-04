import { apiClient } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { DemandCategory } from "../components/demand-categories/types";

export const demandCategoriesService = {
  list() {
    return apiClient.get<DemandCategory[]>("/demand-categories", tokenStorage.getToken());
  },

  create(name: string) {
    return apiClient.post<DemandCategory>("/demand-categories", { name }, tokenStorage.getToken());
  },

  update(id: number, name: string) {
    return apiClient.put<DemandCategory>(`/demand-categories/${id}`, { name }, tokenStorage.getToken());
  },

  patch(id: number, changes: Partial<{ name: string }>) {
    return apiClient.patch<DemandCategory>(`/demand-categories/${id}`, changes, tokenStorage.getToken());
  },

  remove(id: number) {
    return apiClient.delete<void>(`/demand-categories/${id}`, tokenStorage.getToken());
  },
};
