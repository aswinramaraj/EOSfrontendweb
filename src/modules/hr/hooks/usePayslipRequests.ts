import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payslipRequestsService } from "../services/payslip-requests.service";
import { hrKeys } from "../query-keys";
import type { PayslipRequestsListParams, UpdatePayslipRequestInput } from "../types/api";

export function usePayslipRequests(params: PayslipRequestsListParams = {}) {
  return useQuery({
    queryKey: hrKeys.payslipRequests.list(params),
    queryFn: () => payslipRequestsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdatePayslipRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdatePayslipRequestInput }) =>
      payslipRequestsService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...hrKeys.all, "payslip-requests"] }),
  });
}
