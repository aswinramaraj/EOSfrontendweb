import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facultyOdsService } from "../services/faculty-ods.service";
import { iqacKeys } from "../query-keys";
import type { FacultyOdListParams, VerifyOdInput } from "../types/od";

export function useFacultyOds(params: FacultyOdListParams) {
  return useQuery({
    queryKey: iqacKeys.facultyOds.list(params),
    queryFn: () => facultyOdsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useVerifyFacultyOd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: VerifyOdInput }) =>
      facultyOdsService.verify(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: iqacKeys.facultyOds.all() }),
  });
}
