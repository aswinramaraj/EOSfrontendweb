import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  CreateHostelInput,
  Hostel,
  HostelListParams,
  UpdateHostelInput,
} from "../types/hostels";

export const hostelsService = {
  list(params: HostelListParams = {}): Promise<Hostel[]> {
    return apiClient.get<Hostel[]>(`/hostel/hostels${buildQuery(params)}`, requireToken());
  },
  create(input: CreateHostelInput): Promise<Hostel> {
    return apiClient.post<Hostel>("/hostel/hostels", input, requireToken());
  },
  update(id: number, input: UpdateHostelInput): Promise<Hostel> {
    return apiClient.patch<Hostel>(`/hostel/hostels/${id}`, input, requireToken());
  },
  remove(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/hostel/hostels/${id}`, requireToken());
  },
};
