export type FeeStructureAppliesTo = "quota" | "hostel" | "transport";

export interface FeeStructure {
  id: number;
  name: string;
  appliesTo: FeeStructureAppliesTo;
  quotaId: number | null;
  academicYear: string;
  createdAt: string;
}

export interface FeeStructureFormValues {
  name: string;
  appliesTo: FeeStructureAppliesTo;
  quotaId: number | null;
  academicYear: string;
}

export interface FeeStructureItemInput {
  demandCategoryId: number;
  amount: number;
  concessionAmount: number | null;
}

export interface FeeStructureCreateValues extends FeeStructureFormValues {
  items: FeeStructureItemInput[];
}
