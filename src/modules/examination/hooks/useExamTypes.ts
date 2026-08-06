import { useQuery } from "@tanstack/react-query";
import { examTypesService } from "../services/exam-types.service";
import { examinationKeys } from "../query-keys";

export function useExamTypes() {
  return useQuery({
    queryKey: examinationKeys.examTypes.list(),
    queryFn: examTypesService.list,
    staleTime: 60_000,
  });
}
