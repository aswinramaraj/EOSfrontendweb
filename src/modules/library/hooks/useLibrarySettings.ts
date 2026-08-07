import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settings.service";
import { libraryKeys } from "../query-keys";
import type { UpdateLibrarySettingsInput } from "../types/settings";

export function useLibrarySettings() {
  return useQuery({
    queryKey: libraryKeys.settings(),
    queryFn: settingsService.get,
  });
}

export function useUpdateLibrarySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateLibrarySettingsInput) => settingsService.update(input),
    onSuccess: (data) => {
      queryClient.setQueryData(libraryKeys.settings(), data);
    },
  });
}
