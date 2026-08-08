import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hostelsService } from "../services/hostels.service";
import { hostelKeys } from "../query-keys";
import type { CreateHostelInput, HostelListParams, UpdateHostelInput } from "../types/hostels";

export function useHostels(params: HostelListParams = {}) {
  return useQuery({
    queryKey: hostelKeys.hostels.list(params),
    queryFn: () => hostelsService.list(params),
  });
}

function useInvalidateHostels() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: hostelKeys.hostels.all() });
    queryClient.invalidateQueries({ queryKey: hostelKeys.dashboard() });
  };
}

export function useCreateHostel() {
  const invalidate = useInvalidateHostels();
  return useMutation({
    mutationFn: (input: CreateHostelInput) => hostelsService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateHostel() {
  const invalidate = useInvalidateHostels();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateHostelInput }) =>
      hostelsService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteHostel() {
  const invalidate = useInvalidateHostels();
  return useMutation({
    mutationFn: (id: number) => hostelsService.remove(id),
    onSuccess: invalidate,
  });
}
