import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type {
  Book,
  BookListParams,
  BookSearchResult,
  CreateBookInput,
  UpdateBookInput,
} from "../types/books";

export const booksService = {
  list(params: BookListParams = {}): Promise<Paginated<Book>> {
    return apiClient.get<Paginated<Book>>(
      `/library/books${buildQuery(params)}`,
      requireToken(),
    );
  },
  // Fuzzy (typo-tolerant) search — used for the Issue-books typeahead, not
  // the filtered catalogue list. Backend requires q.length >= 2.
  search(q: string, limit?: number): Promise<BookSearchResult[]> {
    return apiClient.get<BookSearchResult[]>(
      `/library/books/search${buildQuery({ q, limit })}`,
      requireToken(),
    );
  },
  get(id: number): Promise<Book> {
    return apiClient.get<Book>(`/library/books/${id}`, requireToken());
  },
  create(input: CreateBookInput): Promise<Book> {
    return apiClient.post<Book>("/library/books", input, requireToken());
  },
  update(id: number, input: UpdateBookInput): Promise<Book> {
    return apiClient.patch<Book>(`/library/books/${id}`, input, requireToken());
  },
  remove(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/library/books/${id}`, requireToken());
  },
};
