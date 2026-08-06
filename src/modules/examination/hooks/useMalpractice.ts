import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { malpracticeService } from "../services/malpractice.service";
import { examinationKeys } from "../query-keys";
import type {
  CreateMalpracticeIncidentInput,
  FindMalpracticeParams,
  UpdateMalpracticeIncidentInput,
} from "../types/malpractice";

export function useMalpracticeIncidents(params: FindMalpracticeParams) {
  return useQuery({
    queryKey: examinationKeys.malpractice.list(params),
    queryFn: () => malpracticeService.list(params),
  });
}

function useInvalidateMalpractice() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: examinationKeys.malpractice.all() });
}

export function useCreateMalpracticeIncident() {
  const invalidate = useInvalidateMalpractice();
  return useMutation({
    mutationFn: (input: CreateMalpracticeIncidentInput) => malpracticeService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateMalpracticeIncident() {
  const invalidate = useInvalidateMalpractice();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateMalpracticeIncidentInput }) =>
      malpracticeService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteMalpracticeIncident() {
  const invalidate = useInvalidateMalpractice();
  return useMutation({
    mutationFn: (id: number) => malpracticeService.remove(id),
    onSuccess: invalidate,
  });
}
