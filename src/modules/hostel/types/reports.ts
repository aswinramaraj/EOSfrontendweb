export type HostelReportKey = "occupancy" | "fee-arrears" | "leave-audit" | "complaint-sla";
export type HostelReportFileFormat = "pdf" | "excel";

export interface HostelReportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface HostelReportTable {
  title: string;
  columns: HostelReportColumn[];
  rows: Record<string, unknown>[];
}

export interface HostelReportFilters {
  hostel_id?: number;
  from?: string;
  to?: string;
}

interface HostelReportDef {
  label: string;
  description: string;
  supports: { hostel: boolean; dateRange: boolean };
}

// Verified against the backend's hostel/reports service: only leave-audit
// accepts from/to — the other three silently ignore a date range, so the
// filter row is driven off this map rather than always showing one.
export const HOSTEL_REPORT_DEFS: Record<HostelReportKey, HostelReportDef> = {
  occupancy: {
    label: "Occupancy",
    description: "Beds and rooms per hostel block.",
    supports: { hostel: true, dateRange: false },
  },
  "fee-arrears": {
    label: "Fee collection & arrears",
    description: "Per-resident hostel fee position.",
    supports: { hostel: true, dateRange: false },
  },
  "leave-audit": {
    label: "Leave / gate audit",
    description: "Every outing request in the period.",
    supports: { hostel: true, dateRange: true },
  },
  "complaint-sla": {
    label: "Complaint SLA",
    description: "Every complaint, its resolution state and timing.",
    supports: { hostel: true, dateRange: false },
  },
};

export const HOSTEL_REPORT_KEYS = Object.keys(HOSTEL_REPORT_DEFS) as HostelReportKey[];
