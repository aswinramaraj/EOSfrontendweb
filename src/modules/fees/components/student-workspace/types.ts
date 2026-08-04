export interface StudentProfile {
  studentId: number;
  name: string;
  registerNumber: string;
  programme: string;
  department: string;
  batch: string;
  quota: string;
}

export interface StudentFeeSummary {
  totalDemand: number;
  totalPaid: number;
  totalOutstanding: number;
  collectionPercent: number;
}

export interface DemandSummaryItem {
  studentFeeDemandMappingId: number;
  feeStructureId: number;
  feeStructureName: string;
  appliesTo: string;
  academicYear: string;
  semester: number;
  totalAmount: number;
}

export interface PaymentSummary {
  paymentCount: number;
  totalPaid: number;
  lastPaymentDate: string | null;
}

export interface WorkspaceTabItem {
  key: string;
  label: string;
}
