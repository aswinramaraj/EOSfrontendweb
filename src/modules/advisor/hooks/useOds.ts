import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { odsService, type OdListParams } from "../services/ods.service";
import { advisorKeys } from "../query-keys";

export function useOds(params: OdListParams = {}) {
  return useQuery({
    queryKey: advisorKeys.ods.list(params),
    queryFn: () => odsService.list(params),
  });
}

export function useFacultyApproveOd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: "approved" | "rejected" }) =>
      odsService.facultyApprove(id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advisorKeys.ods.all() });
      queryClient.invalidateQueries({ queryKey: advisorKeys.dashboard() });
    },
  });
}
