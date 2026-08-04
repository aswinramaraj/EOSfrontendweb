import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { BookCategory } from "../types/categories";

export const categoriesService = {
  // The backend's list response self-wraps with its own `success` field,
  // which the global TransformInterceptor passes through untouched — so
  // apiClient.get ends up returning the bare array, and page/page_size/total
  // are unreachable. Fetch unpaginated (page_size=100) instead of paging.
  list(q?: string): Promise<BookCategory[]> {
    return apiClient.get<BookCategory[]>(
      `/library/book-categories${buildQuery({ q, page_size: 100 })}`,
      requireToken(),
    );
  },
  create(name: string): Promise<BookCategory> {
    return apiClient.post<BookCategory>(
      "/library/book-categories",
      { name },
      requireToken(),
    );
  },
  update(id: number, name: string): Promise<BookCategory> {
    return apiClient.patch<BookCategory>(
      `/library/book-categories/${id}`,
      { name },
      requireToken(),
    );
  },
  // The backend's delete response has no `data` key at all, so
  // apiClient.delete resolves to undefined here — deliberately Promise<void>.
  remove(id: number): Promise<void> {
    return apiClient.delete<void>(`/library/book-categories/${id}`, requireToken());
  },
};
