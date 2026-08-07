import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { hostelFeesService } from "../services/fees.service";
import { hostelKeys } from "../query-keys";
import type { HostelFeeListParams } from "../types/fees";

export function useHostelFees(params: HostelFeeListParams) {
  return useQuery({
    queryKey: hostelKeys.fees.list(params),
    queryFn: () => hostelFeesService.list(params),
    placeholderData: keepPreviousData,
  });
}
