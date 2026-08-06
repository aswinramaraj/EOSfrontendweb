import { apiClient } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { CategoryBreakdownItem } from "../components/fee-payments-crud/category-breakdown.types";

interface RawCategoryBreakdownItem {
  fee_structure_item_id: number;
  demand_category_name: string | null;
  original_amount: number | string | null;
  already_paid: number | string | null;
  outstanding_amount: number | string | null;
  status: string | null;
}

function mapItem(raw: RawCategoryBreakdownItem): CategoryBreakdownItem {
  return {
    feeStructureItemId: raw.fee_structure_item_id,
    demandCategoryName: raw.demand_category_name ?? "—",
    originalAmount: Number(raw.original_amount ?? 0),
    alreadyPaid: Number(raw.already_paid ?? 0),
    outstandingAmount: Number(raw.outstanding_amount ?? 0),
    status: raw.status ?? "—",
  };
}

export const categoryBreakdownService = {
  async get(demandMappingId: number) {
    const data = await apiClient.get<RawCategoryBreakdownItem[]>(
      `/student-fee-demand-mappings/${Number(demandMappingId)}/category-breakdown`,
      tokenStorage.getToken(),
    );
    return data.map(mapItem);
  },
};
