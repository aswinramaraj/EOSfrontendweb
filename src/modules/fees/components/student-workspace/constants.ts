import type { WorkspaceTabItem } from "./types";

// "Receipts" and "Notes" were removed — Payment History already lets staff
// select rows and print a receipt directly, so a separate Receipts tab was
// redundant, and Notes had no backing feature.
export const WORKSPACE_TABS: WorkspaceTabItem[] = [
  { key: "receive-payment", label: "Receive Payment" },
  { key: "demand-details", label: "Demand Details" },
  { key: "payment-history", label: "Payment History" },
  { key: "fee-concessions", label: "Fee Concessions" },
  { key: "education-loan-dd", label: "Education Loan DD" },
];
