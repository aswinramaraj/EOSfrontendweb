export type SecretaryReportKey =
  | "product-requests"
  | "service-requests"
  | "venue-bookings"
  | "media-requests"
  | "attendance";

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

export interface SecretaryReportFilters {
  from?: string;
  to?: string;
  status?: string;
}

export interface SecretaryReportsSummary {
  requests_this_month: number;
  pending_approvals: number;
  upcoming_bookings: number;
}

interface ReportDef {
  label: string;
  description: string;
  /** Real status values for this resource's enum — see the matching backend service. */
  statusOptions: string[];
}

// Verified against SecretaryReportsController/SecretaryReportsService: every
// report accepts from/to/status uniformly (all five are "my own data" scoped
// to the caller), only the valid status values differ per underlying table.
export const SECRETARY_REPORT_DEFS: Record<SecretaryReportKey, ReportDef> = {
  "product-requests": {
    label: "POP requests",
    description: "Product order proposals you've submitted.",
    statusOptions: ["draft", "pending", "approved", "rejected"],
  },
  "service-requests": {
    label: "SOP requests",
    description: "Service order proposals you've submitted.",
    statusOptions: ["draft", "pending", "approved", "rejected"],
  },
  "venue-bookings": {
    label: "Venue bookings",
    description: "Venue bookings you've requested.",
    statusOptions: ["pending", "approved", "rejected", "alternative_offered"],
  },
  "media-requests": {
    label: "Media requests",
    description: "Media coverage requests you've submitted.",
    statusOptions: ["pending", "approved", "rejected", "delivered"],
  },
  attendance: {
    label: "Attendance sheets",
    description: "Attendance you've personally marked.",
    statusOptions: ["present", "absent", "on_duty"],
  },
};

export const SECRETARY_REPORT_KEYS = Object.keys(SECRETARY_REPORT_DEFS) as SecretaryReportKey[];
