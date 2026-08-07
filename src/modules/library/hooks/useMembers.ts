import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { membersService } from "../services/members.service";
import { libraryKeys } from "../query-keys";
import type { MemberListParams } from "../types/members";

export function useMembers(params: MemberListParams) {
  return useQuery({
    queryKey: libraryKeys.members.list(params),
    queryFn: () => membersService.list(params),
    placeholderData: keepPreviousData,
  });
}
