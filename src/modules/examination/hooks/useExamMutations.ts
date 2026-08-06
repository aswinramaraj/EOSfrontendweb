import { useMutation, useQueryClient } from "@tanstack/react-query";
import { examsService } from "../services/exams.service";
import { examinationKeys } from "../query-keys";
import type { CreateExamInput, UpdateExamInput } from "../types/exams";

function useInvalidateExams() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: examinationKeys.exams.all() });
}

export function useCreateExam() {
  const invalidate = useInvalidateExams();
  return useMutation({
    mutationFn: (input: CreateExamInput) => examsService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateExam() {
  const invalidate = useInvalidateExams();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateExamInput }) =>
      examsService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteExam() {
  const invalidate = useInvalidateExams();
  return useMutation({
    mutationFn: (id: number) => examsService.remove(id),
    onSuccess: invalidate,
  });
}

export function useCompleteExam() {
  const invalidate = useInvalidateExams();
  return useMutation({
    mutationFn: (id: number) => examsService.complete(id),
    onSuccess: invalidate,
  });
}
