import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "../services/categories.service";
import { libraryKeys } from "../query-keys";

export function useCategories(q?: string) {
  return useQuery({
    queryKey: libraryKeys.categories.list({ q }),
    queryFn: () => categoriesService.list(q),
  });
}

function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: libraryKeys.categories.all() });
    queryClient.invalidateQueries({ queryKey: libraryKeys.dashboard() });
  };
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (name: string) => categoriesService.create(name),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      categoriesService.update(id, name),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (id: number) => categoriesService.remove(id),
    onSuccess: invalidate,
  });
}
