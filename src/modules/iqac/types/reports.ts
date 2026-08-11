export type IqacReportType = "venue_bookings" | "student_ods" | "faculty_ods";
export type IqacReportFormat = "excel" | "pdf";

export interface IqacReportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface IqacReportTable {
  title: string;
  columns: IqacReportColumn[];
  rows: Record<string, unknown>[];
}

export interface IqacReportFilters {
  from?: string;
  to?: string;
  department_id?: number;
}

export const IQAC_REPORT_DEFS: Record<IqacReportType, { label: string; description: string }> = {
  venue_bookings: {
    label: "Venue bookings",
    description: "Every venue booking request in the period, with its decision.",
  },
  student_ods: {
    label: "Student on-duty",
    description: "Student on-duty requests, mentor status and document verification.",
  },
  faculty_ods: {
    label: "Faculty on-duty",
    description: "Faculty on-duty requests, HoD/HR status and document verification.",
  },
};

export const IQAC_REPORT_TYPES = Object.keys(IQAC_REPORT_DEFS) as IqacReportType[];

export interface VenueHistoryEvent {
  time: string;
  venue: string;
  what: string;
  kind: string;
}
