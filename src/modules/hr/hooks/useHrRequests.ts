import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hrRequestsService } from "../services/hr-requests.service";
import { hrKeys } from "../query-keys";
import { facultyKeys } from "@/modules/faculty/query-keys";
import type { CreateHrVacationEntryInput, HrRequestsListParams } from "../types/api";

function useInvalidateHrRequests() {
  const queryClient = useQueryClient();
  return () => {
    // Partial key (no params) so every list variant — regardless of
    // filters — gets invalidated, not just the exact {} params case.
    queryClient.invalidateQueries({ queryKey: [...hrKeys.all, "requests"] });
    queryClient.invalidateQueries({ queryKey: hrKeys.dashboard() });
    queryClient.invalidateQueries({ queryKey: hrKeys.departments.all() });
    // A leave/OD decision, creation, or cancellation changes whether that
    // faculty counts as on_duty_or_leave vs. absent for the affected day —
    // the Attendance overview/detail pages cross-reference approved leave/OD,
    // so they need to refresh too or they'd keep showing the stale picture.
    queryClient.invalidateQueries({ queryKey: [...facultyKeys.all, "attendance-overview"] });
    queryClient.invalidateQueries({ queryKey: [...facultyKeys.all, "attendance"] });
  };
}

export function useHrRequests(params: HrRequestsListParams = {}) {
  return useQuery({
    queryKey: hrKeys.requests.list(params),
    queryFn: () => hrRequestsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useHrRequestDecision() {
  const invalidate = useInvalidateHrRequests();
  return useMutation({
    mutationFn: ({
      kind,
      sourceId,
      decision,
    }: {
      kind: "leave" | "od";
      sourceId: number;
      decision: "approved" | "rejected";
    }) => hrRequestsService.decide(kind, sourceId, decision),
    onSuccess: invalidate,
  });
}

export function useCreateHrVacationEntry() {
  const invalidate = useInvalidateHrRequests();
  return useMutation({
    mutationFn: (input: CreateHrVacationEntryInput) => hrRequestsService.create(input),
    onSuccess: invalidate,
  });
}

export function useDeleteHrVacationEntry() {
  const invalidate = useInvalidateHrRequests();
  return useMutation({
    mutationFn: ({ kind, sourceId }: { kind: "leave" | "od"; sourceId: number }) =>
      hrRequestsService.remove(kind, sourceId),
    onSuccess: invalidate,
  });
}
