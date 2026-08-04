import { apiClient } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import type {
  FeeStructure,
  FeeStructureAppliesTo,
  FeeStructureCreateValues,
  FeeStructureFormValues,
} from "../components/fee-structures/types";

interface RawFeeStructure {
  id: number;
  name: string;
  applies_to: FeeStructureAppliesTo;
  quota_id: number | null;
  academic_year: string;
  created_at: string;
}

function mapFeeStructure(raw: RawFeeStructure): FeeStructure {
  return {
    id: raw.id,
    name: raw.name,
    appliesTo: raw.applies_to,
    quotaId: raw.quota_id,
    academicYear: raw.academic_year,
    createdAt: raw.created_at,
  };
}

function toUpdatePayload(values: Partial<FeeStructureFormValues>) {
  return {
    ...(values.name !== undefined ? { name: values.name } : {}),
    ...(values.appliesTo !== undefined ? { applies_to: values.appliesTo } : {}),
    ...(values.quotaId !== undefined ? { quota_id: values.quotaId === null ? null : Number(values.quotaId) } : {}),
    ...(values.academicYear !== undefined ? { academic_year: values.academicYear } : {}),
  };
}

export const feeStructuresService = {
  async list() {
    const data = await apiClient.get<RawFeeStructure[]>("/fee-structures", tokenStorage.getToken());
    return data.map(mapFeeStructure);
  },

  async create(values: FeeStructureCreateValues) {
    const body = {
      name: values.name,
      applies_to: values.appliesTo,
      quota_id: values.quotaId === null ? null : Number(values.quotaId),
      academic_year: values.academicYear,
      items: values.items.map((item) => ({
        demand_category_id: Number(item.demandCategoryId),
        amount: Number(item.amount),
        ...(item.concessionAmount !== null ? { concession_amount: Number(item.concessionAmount) } : {}),
      })),
    };
    const data = await apiClient.post<RawFeeStructure>("/fee-structures", body, tokenStorage.getToken());
    return mapFeeStructure(data);
  },

  async update(id: number, values: FeeStructureFormValues) {
    const data = await apiClient.put<RawFeeStructure>(
      `/fee-structures/${Number(id)}`,
      toUpdatePayload(values),
      tokenStorage.getToken(),
    );
    return mapFeeStructure(data);
  },

  async patch(id: number, changes: Partial<FeeStructureFormValues>) {
    const data = await apiClient.patch<RawFeeStructure>(
      `/fee-structures/${Number(id)}`,
      toUpdatePayload(changes),
      tokenStorage.getToken(),
    );
    return mapFeeStructure(data);
  },

  remove(id: number) {
    return apiClient.delete<void>(`/fee-structures/${Number(id)}`, tokenStorage.getToken());
  },
};
