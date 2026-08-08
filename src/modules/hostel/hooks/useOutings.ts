import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { outingsService } from "../services/outings.service";
import { hostelKeys } from "../query-keys";
import { useInvalidateHostel } from "./useInvalidateHostel";
import type { OutingDecision, OutingListParams } from "../types/outings";

export function useOutings(params: OutingListParams) {
  return useQuery({
    queryKey: hostelKeys.outings.list(params),
    queryFn: () => outingsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useDecideOuting() {
  const invalidate = useInvalidateHostel();
  return useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: OutingDecision }) =>
      outingsService.decide(id, decision),
    onSuccess: invalidate,
  });
}
