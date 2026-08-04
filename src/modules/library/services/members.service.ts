import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type { LibraryMember, MemberListParams } from "../types/members";

export const membersService = {
  list(params: MemberListParams = {}): Promise<Paginated<LibraryMember>> {
    return apiClient.get<Paginated<LibraryMember>>(
      `/library/members${buildQuery(params)}`,
      requireToken(),
    );
  },
};
