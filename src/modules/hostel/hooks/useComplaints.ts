import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { complaintsService } from "../services/complaints.service";
import { hostelKeys } from "../query-keys";
import { useInvalidateHostel } from "./useInvalidateHostel";
import type { ComplaintListParams, CreateComplaintInput, UpdateComplaintInput } from "../types/complaints";

export function useComplaints(params: ComplaintListParams) {
  return useQuery({
    queryKey: hostelKeys.complaints.list(params),
    queryFn: () => complaintsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateComplaint() {
  const invalidate = useInvalidateHostel();
  return useMutation({
    mutationFn: (input: CreateComplaintInput) => complaintsService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateComplaint() {
  const invalidate = useInvalidateHostel();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateComplaintInput }) =>
      complaintsService.update(id, input),
    onSuccess: invalidate,
  });
}
