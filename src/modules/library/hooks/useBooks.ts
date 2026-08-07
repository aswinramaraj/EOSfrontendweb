import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { booksService } from "../services/books.service";
import { libraryKeys } from "../query-keys";
import type { BookListParams } from "../types/books";

export function useBooks(params: BookListParams) {
  return useQuery({
    queryKey: libraryKeys.books.list(params),
    queryFn: () => booksService.list(params),
    placeholderData: keepPreviousData,
  });
}
