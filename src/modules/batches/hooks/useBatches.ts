import { useQuery } from "@tanstack/react-query";
import { batchesService } from "../services/batches.service";

export function useBatches() {
  return useQuery({
    queryKey: ["batches"],
    queryFn: batchesService.list,
    staleTime: 5 * 60_000,
  });
}
