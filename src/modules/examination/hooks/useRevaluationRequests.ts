import { useQuery } from "@tanstack/react-query";
import { revaluationRequestsService } from "../services/revaluation-requests.service";
import { examinationKeys } from "../query-keys";
import type { RevaluationStatus } from "../types/revaluation";

export function useRevaluationRequests(status?: RevaluationStatus) {
  return useQuery({
    queryKey: examinationKeys.revaluationRequests.list({ status }),
    queryFn: () => revaluationRequestsService.list(status),
  });
}
