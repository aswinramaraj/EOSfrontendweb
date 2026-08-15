import { apiClient } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { FeeConcession, FeeConcessionFormValues } from "../components/fee-concessions/types";

interface RawFeeConcession {
  id: number;
  fee_structure_id: number;
  concession_amount: number | string;
  is_settled: boolean;
  settled_date: string | null;
}

function mapConcession(raw: RawFeeConcession): FeeConcession {
  return {
    id: raw.id,
    concessionAmount: Number(raw.concession_amount),
    isSettled: raw.is_settled,
    settledDate: raw.settled_date,
  };
}

export const feeConcessionsService = {
  async list() {
    const data = await apiClient.get<RawFeeConcession[]>("/fee-concessions", tokenStorage.getToken());
    return data.map(mapConcession);
  },

  async getById(id: number) {
    const data = await apiClient.get<RawFeeConcession>(`/fee-concessions/${Number(id)}`, tokenStorage.getToken());
    return mapConcession(data);
  },

  async listByFeeStructure(feeStructureId: number) {
    const data = await apiClient.get<RawFeeConcession[]>(
      `/fee-structures/${Number(feeStructureId)}/concessions`,
      tokenStorage.getToken(),
    );
    return data.map(mapConcession);
  },

  // fee_structure_id comes from the URL only. concession_amount is the only body field
  // accepted by Create — is_settled/settled_date have no write path there.
  async create(feeStructureId: number, concessionAmount: number) {
    const data = await apiClient.post<RawFeeConcession>(
      `/fee-structures/${Number(feeStructureId)}/concessions`,
      { concession_amount: Number(concessionAmount) },
      tokenStorage.getToken(),
    );
    return mapConcession(data);
  },

  // Update accepts concession_amount (required) plus is_settled/settled_date (optional).
  async update(id: number, values: FeeConcessionFormValues) {
    const data = await apiClient.put<RawFeeConcession>(
      `/fee-concessions/${Number(id)}`,
      {
        concession_amount: Number(values.concessionAmount),
        is_settled: values.isSettled,
        settled_date: values.settledDate,
      },
      tokenStorage.getToken(),
    );
    return mapConcession(data);
  },

  async patch(id: number, changes: Partial<FeeConcessionFormValues>) {
    const data = await apiClient.patch<RawFeeConcession>(
      `/fee-concessions/${Number(id)}`,
      {
        ...(changes.concessionAmount !== undefined ? { concession_amount: Number(changes.concessionAmount) } : {}),
        ...(changes.isSettled !== undefined ? { is_settled: changes.isSettled } : {}),
        ...(changes.settledDate !== undefined ? { settled_date: changes.settledDate } : {}),
      },
      tokenStorage.getToken(),
    );
    return mapConcession(data);
  },

  remove(id: number) {
    return apiClient.delete<void>(`/fee-concessions/${Number(id)}`, tokenStorage.getToken());
  },
};
