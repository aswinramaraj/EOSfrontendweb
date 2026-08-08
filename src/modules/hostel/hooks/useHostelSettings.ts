import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hostelSettingsService } from "../services/settings.service";
import { hostelKeys } from "../query-keys";
import type { UpdateHostelSettingsInput } from "../types/settings";

export function useHostelSettings() {
  return useQuery({
    queryKey: hostelKeys.settings(),
    queryFn: hostelSettingsService.get,
  });
}

export function useUpdateHostelSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateHostelSettingsInput) => hostelSettingsService.update(input),
    onSuccess: (data) => {
      queryClient.setQueryData(hostelKeys.settings(), data);
    },
  });
}
