import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examSubjectMappingService } from "../services/exam-subject-mapping.service";
import { examinationKeys } from "../query-keys";
import type { MapSubjectsInput } from "../types/exam-subject-mapping";

export function useExamSubjectMappings() {
  return useQuery({
    queryKey: examinationKeys.subjectMappings.list(),
    queryFn: examSubjectMappingService.list,
  });
}

function useInvalidateMappings() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: examinationKeys.subjectMappings.all() });
}

export function useMapSubjects() {
  const invalidate = useInvalidateMappings();
  return useMutation({
    mutationFn: (input: MapSubjectsInput) => examSubjectMappingService.map(input),
    onSuccess: invalidate,
  });
}

export function useUnmapSubject() {
  const invalidate = useInvalidateMappings();
  return useMutation({
    mutationFn: (id: number) => examSubjectMappingService.remove(id),
    onSuccess: invalidate,
  });
}
