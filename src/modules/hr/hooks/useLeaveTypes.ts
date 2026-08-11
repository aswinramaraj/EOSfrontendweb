import { useQuery } from "@tanstack/react-query";
import { leaveTypesService } from "../services/leave-types.service";
import { hrKeys } from "../query-keys";

export function useLeaveTypes() {
  return useQuery({
    queryKey: [...hrKeys.all, "leave-types"],
    queryFn: () => leaveTypesService.list(),
    staleTime: 5 * 60 * 1000,
  });
}
