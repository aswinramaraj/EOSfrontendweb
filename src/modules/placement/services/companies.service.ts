import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Company, CompanyListParams, CreateCompanyInput, Paginated, UpdateCompanyInput } from "../types";

// Shape returned by the real `companies` table/DTOs — snake_case, no `id`
// omission helpers. Mapped to/from the frontend's camelCase Company below.
interface BackendCompany {
  id: number;
  name: string;
  profile_info: string | null;
  created_at: string;
}

interface BackendPaginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function toCompany(c: BackendCompany): Company {
  return { id: c.id, name: c.name, profileInfo: c.profile_info ?? undefined, createdAt: c.created_at };
}

export const companiesService = {
  async list(params: CompanyListParams = {}): Promise<Paginated<Company>> {
    const page = params.page ?? 1;
    const pageSize = params.page_size ?? 4;

    const res = await apiClient.get<BackendPaginated<BackendCompany>>(
      `/companies${buildQuery({ search: params.q, page, limit: pageSize })}`,
      requireToken(),
    );

    return {
      page: res.meta.page,
      page_size: res.meta.limit,
      total: res.meta.total,
      data: res.data.map(toCompany),
    };
  },

  async create(input: CreateCompanyInput): Promise<Company> {
    const company = await apiClient.post<BackendCompany>(
      "/companies",
      { name: input.name, profile_info: input.profileInfo },
      requireToken(),
    );
    return toCompany(company);
  },

  async update(id: number, input: UpdateCompanyInput): Promise<Company> {
    const company = await apiClient.patch<BackendCompany>(
      `/companies/${id}`,
      { name: input.name, profile_info: input.profileInfo },
      requireToken(),
    );
    return toCompany(company);
  },

  remove(id: number): Promise<{ id: number }> {
    return apiClient.delete<{ id: number }>(`/companies/${id}`, requireToken());
  },
};
