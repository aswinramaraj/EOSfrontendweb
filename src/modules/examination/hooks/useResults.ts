import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examResultsService } from "../services/results.service";
import { examinationKeys } from "../query-keys";

export function useResultPublications() {
  return useQuery({
    queryKey: examinationKeys.results.list(),
    queryFn: examResultsService.listPublications,
  });
}

export function usePublishResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: number) => examResultsService.publish(examId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: examinationKeys.results.all() }),
  });
}

export function useResultsSummary(examId: number | undefined) {
  return useQuery({
    queryKey: examinationKeys.resultsSummary(examId ?? 0),
    queryFn: () => examResultsService.getSummary(examId!),
    enabled: examId !== undefined,
  });
}

export function usePassRateByDepartment(examId: number | undefined) {
  return useQuery({
    queryKey: examinationKeys.passRateByDepartment(examId ?? 0),
    queryFn: () => examResultsService.getPassRateByDepartment(examId!),
    enabled: examId !== undefined,
  });
}

export function useRankHolders(examId: number | undefined, limit?: number) {
  return useQuery({
    queryKey: examinationKeys.rankHolders(examId ?? 0),
    queryFn: () => examResultsService.getRankHolders(examId!, limit),
    enabled: examId !== undefined,
  });
}
