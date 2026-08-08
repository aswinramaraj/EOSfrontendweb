import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facultyService } from "../services/faculty.service";
import { facultyKeys } from "../query-keys";
import type { UpdateOwnProfileInput } from "../types";

export function useOwnProfile() {
  return useQuery({
    queryKey: facultyKeys.all,
    queryFn: () => facultyService.getOwnProfile(),
  });
}

export function useUpdateOwnProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOwnProfileInput) => facultyService.updateOwnProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: facultyKeys.all }),
  });
}
