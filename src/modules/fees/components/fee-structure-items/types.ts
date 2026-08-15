export interface FeeStructureItem {
  id: number;
  feeStructureId: number;
  demandCategoryId: number;
  amount: number;
}

export interface FeeStructureItemFormValues {
  feeStructureId: number;
  demandCategoryId: number;
  amount: number;
}
