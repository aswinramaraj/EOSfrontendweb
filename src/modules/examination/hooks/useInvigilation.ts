import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invigilationService } from "../services/invigilation.service";
import { examinationKeys } from "../query-keys";
import type {
  CreateInvigilationDutyInput,
  FindInvigilationParams,
  UpdateInvigilationDutyInput,
} from "../types/invigilation";

export function useInvigilationDuties(params: FindInvigilationParams) {
  return useQuery({
    queryKey: examinationKeys.invigilationDuties.list(params),
    queryFn: () => invigilationService.list(params),
    enabled: params.exam_id !== undefined,
  });
}

export function useFacultyWorkload(facultyId: number | null) {
  return useQuery({
    queryKey: examinationKeys.invigilationWorkload(facultyId ?? 0),
    queryFn: () => invigilationService.getFacultyWorkload(facultyId!),
    enabled: facultyId !== null,
  });
}

function useInvalidateDuties() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: examinationKeys.invigilationDuties.all() });
    queryClient.invalidateQueries({ queryKey: examinationKeys.invigilationBatches.all() });
  };
}

export function useCreateInvigilationDuty() {
  const invalidate = useInvalidateDuties();
  return useMutation({
    mutationFn: (input: CreateInvigilationDutyInput) => invigilationService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateInvigilationDuty() {
  const invalidate = useInvalidateDuties();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateInvigilationDutyInput }) =>
      invigilationService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteInvigilationDuty() {
  const invalidate = useInvalidateDuties();
  return useMutation({
    mutationFn: (id: number) => invigilationService.remove(id),
    onSuccess: invalidate,
  });
}
