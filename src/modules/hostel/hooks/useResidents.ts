import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { residentsService } from "../services/residents.service";
import { hostelKeys } from "../query-keys";
import type { ResidentListParams } from "../types/residents";

export function useResidents(params: ResidentListParams) {
  return useQuery({
    queryKey: hostelKeys.residents.list(params),
    queryFn: () => residentsService.list(params),
    placeholderData: keepPreviousData,
  });
}
