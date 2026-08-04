import { useQuery } from "@tanstack/react-query";
import { booksService } from "../services/books.service";
import { libraryKeys } from "../query-keys";

// Backend rejects q shorter than 2 characters — gating here avoids firing a
// request that's guaranteed to 400.
export function useBookSearch(q: string) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: libraryKeys.books.search(trimmed),
    queryFn: () => booksService.search(trimmed),
    enabled: trimmed.length >= 2,
  });
}
