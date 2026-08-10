import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appraisalRequestsService } from "../services/appraisal-requests.service";
import { hrKeys } from "../query-keys";
import type { AppraisalRequestsListParams } from "../types/api";

export function useAppraisalRequests(params: AppraisalRequestsListParams = {}) {
  return useQuery({
    queryKey: hrKeys.appraisalRequests.list(params),
    queryFn: () => appraisalRequestsService.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateAppraisalRequests() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [...hrKeys.all, "appraisal-requests"] });
    queryClient.invalidateQueries({ queryKey: hrKeys.dashboard() });
  };
}

export function useApproveAppraisalRequest() {
  const invalidate = useInvalidateAppraisalRequests();
  return useMutation({
    mutationFn: (id: number) => appraisalRequestsService.approve(id),
    onSuccess: invalidate,
  });
}

export function useRejectAppraisalRequest() {
  const invalidate = useInvalidateAppraisalRequests();
  return useMutation({
    mutationFn: (id: number) => appraisalRequestsService.reject(id),
    onSuccess: invalidate,
  });
}

export function useScoreAppraisalRequest() {
  const invalidate = useInvalidateAppraisalRequests();
  return useMutation({
    mutationFn: ({ id, entries }: { id: number; entries: { entry_id: number; score: number }[] }) =>
      appraisalRequestsService.scoreAndTransition(id, entries),
    onSuccess: invalidate,
  });
}
