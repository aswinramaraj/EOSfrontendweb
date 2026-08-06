import { useMutation, useQueryClient } from "@tanstack/react-query";
import { examTypesService } from "../services/exam-types.service";
import { examinationKeys } from "../query-keys";
import type { CreateExamTypeInput, UpdateExamTypeInput } from "../types/exams";

function useInvalidateExamTypes() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: examinationKeys.examTypes.all() });
}

export function useCreateExamType() {
  const invalidate = useInvalidateExamTypes();
  return useMutation({
    mutationFn: (input: CreateExamTypeInput) => examTypesService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateExamType() {
  const invalidate = useInvalidateExamTypes();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateExamTypeInput }) =>
      examTypesService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteExamType() {
  const invalidate = useInvalidateExamTypes();
  return useMutation({
    mutationFn: (id: number) => examTypesService.remove(id),
    onSuccess: invalidate,
  });
}
