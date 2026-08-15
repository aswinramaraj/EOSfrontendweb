import { apiClient } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { FeeStructureItem, FeeStructureItemFormValues } from "../components/fee-structure-items/types";

interface RawFeeStructureItem {
  id: number;
  fee_structure_id: number;
  demand_category_id: number;
  amount: number | string;
}

function mapItem(raw: RawFeeStructureItem): FeeStructureItem {
  return {
    id: raw.id,
    feeStructureId: raw.fee_structure_id,
    demandCategoryId: raw.demand_category_id,
    amount: Number(raw.amount),
  };
}

export const feeStructureItemsService = {
  async list() {
    const data = await apiClient.get<RawFeeStructureItem[]>("/fee-structure-items", tokenStorage.getToken());
    return data.map(mapItem);
  },

  async create(values: FeeStructureItemFormValues) {
    const data = await apiClient.post<RawFeeStructureItem>(
      `/fee-structures/${Number(values.feeStructureId)}/items`,
      {
        demand_category_id: Number(values.demandCategoryId),
        amount: Number(values.amount),
      },
      tokenStorage.getToken(),
    );
    return mapItem(data);
  },

  async update(id: number, values: FeeStructureItemFormValues) {
    // Backend UpdateFeeStructureItemDto only accepts demand_category_id and amount.
    // fee_structure_id is rejected ("property fee_structure_id should not exist").
    const data = await apiClient.put<RawFeeStructureItem>(
      `/fee-structure-items/${Number(id)}`,
      {
        demand_category_id: Number(values.demandCategoryId),
        amount: Number(values.amount),
      },
      tokenStorage.getToken(),
    );
    return mapItem(data);
  },

  async patch(id: number, changes: Partial<FeeStructureItemFormValues>) {
    const body: Record<string, number> = {};
    if (changes.demandCategoryId !== undefined) body.demand_category_id = Number(changes.demandCategoryId);
    if (changes.amount !== undefined) body.amount = Number(changes.amount);

    const data = await apiClient.patch<RawFeeStructureItem>(
      `/fee-structure-items/${Number(id)}`,
      body,
      tokenStorage.getToken(),
    );
    return mapItem(data);
  },

  remove(id: number) {
    return apiClient.delete<void>(`/fee-structure-items/${Number(id)}`, tokenStorage.getToken());
  },
};
