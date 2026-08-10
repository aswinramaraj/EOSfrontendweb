import { useQuery } from "@tanstack/react-query";
import { quotasService } from "../services/quotas.service";

export function useQuotas() {
  return useQuery({
    queryKey: ["quotas"],
    queryFn: quotasService.list,
    staleTime: 5 * 60_000,
  });
}
