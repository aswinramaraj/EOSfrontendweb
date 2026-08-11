import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appraisalCriteriaService } from "../services/appraisal-criteria.service";
import { hrKeys } from "../query-keys";
import type { AppraisalCriteriaListParams, CreateAppraisalCriterionInput } from "../types/api";

export function useAppraisalDivisions() {
  return useQuery({
    queryKey: hrKeys.appraisalDivisions(),
    queryFn: appraisalCriteriaService.listDivisions,
  });
}

export function useAppraisalCriteria(params: AppraisalCriteriaListParams = {}) {
  return useQuery({
    queryKey: hrKeys.appraisalCriteria.list(params),
    queryFn: () => appraisalCriteriaService.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateAppraisalCriteria() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [...hrKeys.all, "appraisal-criteria"] });
}

export function useCreateAppraisalCriterion() {
  const invalidate = useInvalidateAppraisalCriteria();
  return useMutation({
    mutationFn: (input: CreateAppraisalCriterionInput) => appraisalCriteriaService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAppraisalCriterion() {
  const invalidate = useInvalidateAppraisalCriteria();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreateAppraisalCriterionInput> }) =>
      appraisalCriteriaService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAppraisalCriterion() {
  const invalidate = useInvalidateAppraisalCriteria();
  return useMutation({
    mutationFn: (id: number) => appraisalCriteriaService.remove(id),
    onSuccess: invalidate,
  });
}

export function useCreateAppraisalDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => appraisalCriteriaService.createDivision(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hrKeys.appraisalDivisions() }),
  });
}
