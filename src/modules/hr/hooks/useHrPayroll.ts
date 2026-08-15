import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hrPayrollService } from "../services/hr-payroll.service";
import { hrKeys } from "../query-keys";
import type { CreateHrPayrollInput, HrPayrollListParams } from "../types/api";

export function useHrPayroll(params: HrPayrollListParams = {}) {
  return useQuery({
    queryKey: hrKeys.payroll.list(params),
    queryFn: () => hrPayrollService.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateHrPayroll() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [...hrKeys.all, "payroll"] });
    queryClient.invalidateQueries({ queryKey: hrKeys.dashboard() });
  };
}

export function useCreateHrPayroll() {
  const invalidate = useInvalidateHrPayroll();
  return useMutation({
    mutationFn: (input: CreateHrPayrollInput) => hrPayrollService.create(input),
    onSuccess: invalidate,
  });
}

export function useMarkHrPayrollPaid() {
  const invalidate = useInvalidateHrPayroll();
  return useMutation({
    mutationFn: ({ id, paidOn }: { id: number; paidOn: string }) =>
      hrPayrollService.markPaid(id, paidOn),
    onSuccess: invalidate,
  });
}
