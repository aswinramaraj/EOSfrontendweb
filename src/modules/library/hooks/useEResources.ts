import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { eResourcesService } from "../services/e-resources.service";
import { libraryKeys } from "../query-keys";
import type { EResourceListParams } from "../types/e-resources";

export function useEResources(params: EResourceListParams) {
  return useQuery({
    queryKey: libraryKeys.eResources.list(params),
    queryFn: () => eResourcesService.list(params),
    placeholderData: keepPreviousData,
  });
}
