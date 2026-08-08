import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { noDueService, type NoDueListParams } from "../services/no-due.service";
import { advisorKeys } from "../query-keys";

export function useNoDueStudents(params: NoDueListParams = {}) {
  return useQuery({
    queryKey: advisorKeys.noDue.list(params),
    queryFn: () => noDueService.list(params),
  });
}

export function useApproveNoDue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: number) => noDueService.approve(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advisorKeys.noDue.all() });
    },
  });
}

export function useRejectNoDue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: number) => noDueService.reject(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advisorKeys.noDue.all() });
    },
  });
}
