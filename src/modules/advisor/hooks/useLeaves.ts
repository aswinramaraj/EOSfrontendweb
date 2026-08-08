import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leavesService, type LeaveListParams } from "../services/leaves.service";
import { advisorKeys } from "../query-keys";

export function useLeaves(params: LeaveListParams = {}) {
  return useQuery({
    queryKey: advisorKeys.leaves.list(params),
    queryFn: () => leavesService.list(params),
  });
}

export function useFacultyApproveLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: "approved" | "rejected" }) =>
      leavesService.facultyApprove(id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advisorKeys.leaves.all() });
      queryClient.invalidateQueries({ queryKey: advisorKeys.dashboard() });
    },
  });
}
