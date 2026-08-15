export type KnownDueStatus = "Paid" | "Partial" | "Pending";
// The backend can return any string for due_status — the badge must render
// whatever it sends, not just these three known values.
export type DueStatus = KnownDueStatus | string;

export interface FeePaymentRow {
  id: string;
  studentName: string;
  registerNo: string;
  programme: string;
  department: string;
  batch: string;
  academicYear: string;
  totalDemand: number;
  paidAmount: number;
  outstanding: number;
  dueStatus: DueStatus;
  lastPayment: string | null;
}

export interface FeePaymentFiltersState {
  programme: string;
  department: string;
  academicYear: string;
  batch: string;
  dueStatus: string;
}

export const ALL_FILTER_VALUE = "All";
