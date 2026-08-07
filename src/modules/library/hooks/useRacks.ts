import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { racksService, type RackListParams } from "../services/racks.service";
import { libraryKeys } from "../query-keys";
import type { RackInput } from "../types/racks";

export function useRacks(params: RackListParams) {
  return useQuery({
    queryKey: libraryKeys.racks.list(params),
    queryFn: () => racksService.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateRacks() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: libraryKeys.racks.all() });
    queryClient.invalidateQueries({ queryKey: libraryKeys.dashboard() });
  };
}

export function useCreateRack() {
  const invalidate = useInvalidateRacks();
  return useMutation({
    mutationFn: (input: RackInput) => racksService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateRack() {
  const invalidate = useInvalidateRacks();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<RackInput> }) =>
      racksService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteRack() {
  const invalidate = useInvalidateRacks();
  return useMutation({
    mutationFn: (id: number) => racksService.remove(id),
    onSuccess: invalidate,
  });
}
