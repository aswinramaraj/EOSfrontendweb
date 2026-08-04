import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eResourcesService } from "../services/e-resources.service";
import { libraryKeys } from "../query-keys";
import type { CreateEResourceInput, UpdateEResourceInput } from "../types/e-resources";

function useInvalidateEResources() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: libraryKeys.eResources.all() });
    queryClient.invalidateQueries({ queryKey: libraryKeys.dashboard() });
  };
}

export function useCreateEResource() {
  const invalidate = useInvalidateEResources();
  return useMutation({
    mutationFn: (input: CreateEResourceInput) => eResourcesService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateEResource() {
  const invalidate = useInvalidateEResources();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateEResourceInput }) =>
      eResourcesService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteEResource() {
  const invalidate = useInvalidateEResources();
  return useMutation({
    mutationFn: (id: number) => eResourcesService.remove(id),
    onSuccess: invalidate,
  });
}
