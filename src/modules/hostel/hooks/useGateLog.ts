import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { gateLogService } from "../services/gate-log.service";
import { hostelKeys } from "../query-keys";
import { useInvalidateHostel } from "./useInvalidateHostel";
import type { CreateGateLogInput, GateLogListParams } from "../types/gate-log";

export function useGateLog(params: GateLogListParams) {
  return useQuery({
    queryKey: hostelKeys.gateLog.list(params),
    queryFn: () => gateLogService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateGateLogEntry() {
  const invalidate = useInvalidateHostel();
  return useMutation({
    mutationFn: (input: CreateGateLogInput) => gateLogService.create(input),
    onSuccess: invalidate,
  });
}
