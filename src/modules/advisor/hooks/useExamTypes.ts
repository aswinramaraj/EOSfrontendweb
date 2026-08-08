import { useQuery } from "@tanstack/react-query";
import { examTypesService } from "../services/exam-types.service";
import { advisorKeys } from "../query-keys";

export function useExamTypes() {
  return useQuery({
    queryKey: [...advisorKeys.all, "exam-types"],
    queryFn: () => examTypesService.list(),
  });
}
