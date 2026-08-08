import { useQueryClient } from "@tanstack/react-query";
import { hostelKeys } from "../query-keys";

// Same policy as library's useInvalidateLibrary: circulation-ish actions
// (deciding an outing, logging a gate entry, settling a complaint) can shift
// the dashboard summary, residents' status, and other lists all at once —
// invalidating the whole module is deliberate, not lazy.
export function useInvalidateHostel() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: hostelKeys.all });
}
