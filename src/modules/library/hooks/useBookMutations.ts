import { useMutation, useQueryClient } from "@tanstack/react-query";
import { booksService } from "../services/books.service";
import { libraryKeys } from "../query-keys";
import type { CreateBookInput, UpdateBookInput } from "../types/books";

function useInvalidateBooks() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: libraryKeys.books.all() });
    queryClient.invalidateQueries({ queryKey: libraryKeys.dashboard() });
  };
}

export function useCreateBook() {
  const invalidate = useInvalidateBooks();
  return useMutation({
    mutationFn: (input: CreateBookInput) => booksService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateBook() {
  const invalidate = useInvalidateBooks();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateBookInput }) =>
      booksService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteBook() {
  const invalidate = useInvalidateBooks();
  return useMutation({
    mutationFn: (id: number) => booksService.remove(id),
    onSuccess: invalidate,
  });
}
