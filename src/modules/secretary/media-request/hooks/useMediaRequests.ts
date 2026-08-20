import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mediaRequestService } from "../services/media-request.service";
import { mediaRequestKeys } from "../query-keys";
import type { CreateMediaRequestInput, MediaRequestStatus } from "../types";

export function useMediaRequests(status?: MediaRequestStatus) {
  return useQuery({
    queryKey: mediaRequestKeys.list(status),
    queryFn: () => mediaRequestService.list(status),
  });
}

function useInvalidateMediaRequests() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: mediaRequestKeys.all() });
}

export function useCreateMediaRequest() {
  const invalidate = useInvalidateMediaRequests();
  return useMutation({
    mutationFn: (input: CreateMediaRequestInput) => mediaRequestService.create(input),
    onSuccess: invalidate,
  });
}

export function useDeleteMediaRequest() {
  const invalidate = useInvalidateMediaRequests();
  return useMutation({
    mutationFn: (id: number) => mediaRequestService.remove(id),
    onSuccess: invalidate,
  });
}
