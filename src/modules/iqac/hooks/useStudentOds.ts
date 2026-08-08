import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentOdsService } from "../services/student-ods.service";
import { iqacKeys } from "../query-keys";
import type { StudentOdListParams, VerifyOdInput } from "../types/od";

export function useStudentOds(params: StudentOdListParams) {
  return useQuery({
    queryKey: iqacKeys.studentOds.list(params),
    queryFn: () => studentOdsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useStudentOd(id: number | null) {
  return useQuery({
    queryKey: iqacKeys.studentOds.detail(id ?? 0),
    queryFn: () => studentOdsService.get(id as number),
    enabled: id !== null,
  });
}

export function useVerifyStudentOd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: VerifyOdInput }) =>
      studentOdsService.verify(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: iqacKeys.studentOds.all() }),
  });
}
