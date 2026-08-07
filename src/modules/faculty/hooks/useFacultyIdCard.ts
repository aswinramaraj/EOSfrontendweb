import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facultyIdCardService } from "../services/faculty-id-card.service";
import { facultyKeys } from "../query-keys";

export function useFacultyIdCardBulkStatus(facultyIds: number[]) {
  return useQuery({
    queryKey: [...facultyKeys.all, "id-card-status", [...facultyIds].sort((a, b) => a - b)],
    queryFn: () => facultyIdCardService.getBulkStatus(facultyIds),
    enabled: facultyIds.length > 0,
  });
}

export function useIssueFacultyIdCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (facultyId: number) => facultyIdCardService.issue(facultyId),
    onSuccess: (_, facultyId) => {
      queryClient.invalidateQueries({ queryKey: [...facultyKeys.all, "id-card-status"] });
      queryClient.invalidateQueries({ queryKey: facultyKeys.activity(facultyId) });
    },
  });
}
