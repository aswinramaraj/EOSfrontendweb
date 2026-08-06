import { useQuery } from "@tanstack/react-query";
import { examsService } from "../services/exams.service";
import { examinationKeys } from "../query-keys";

export function useExams() {
  return useQuery({
    queryKey: examinationKeys.exams.list(),
    queryFn: examsService.list,
    staleTime: 30_000,
  });
}
