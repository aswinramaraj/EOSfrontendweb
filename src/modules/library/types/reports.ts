export type ReportKey =
  | "inventory"
  | "issued"
  | "returned"
  | "overdue"
  | "no-dues-clearance"
  | "accession-register";

export type ReportFileFormat = "pdf" | "excel";

export interface ReportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ReportTable {
  title: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
}

export interface ReportFilters {
  department_id?: number;
  from?: string;
  to?: string;
}

interface ReportDef {
  label: string;
  description: string;
  supports: { department: boolean; dateRange: boolean };
}

// Verified against reports.controller.ts/reports.service.ts: the backend
// silently ignores filters a report's method doesn't accept (e.g. inventory
// never receives from/to; no-dues-clearance takes no arguments at all).
// Driving the filter row off this map — rather than always showing a
// department + date-range bar — is what stops the UI from offering controls
// that quietly do nothing.
export const REPORT_DEFS: Record<ReportKey, ReportDef> = {
  inventory: {
    label: "Inventory",
    description: "Every title with copies, rack position, cost and current availability.",
    supports: { department: true, dateRange: false },
  },
  issued: {
    label: "Issued books",
    description: "Borrowings in the selected period with student, department and due date.",
    supports: { department: true, dateRange: true },
  },
  returned: {
    label: "Returned books",
    description: "Receipts at the counter, including renewals and late returns.",
    supports: { department: true, dateRange: true },
  },
  overdue: {
    label: "Overdue books",
    description: "Copies past due, grouped by days late and by department.",
    supports: { department: true, dateRange: false },
  },
  "no-dues-clearance": {
    label: "No-dues clearance list",
    description: "Members with books or fines still pending.",
    supports: { department: false, dateRange: false },
  },
  "accession-register": {
    label: "Accession register",
    description: "The statutory register of every copy added, with fund and vendor.",
    supports: { department: true, dateRange: false },
  },
};

export const REPORT_KEYS = Object.keys(REPORT_DEFS) as ReportKey[];
