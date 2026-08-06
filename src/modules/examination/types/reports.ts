export type ReportKey =
  | "examination-schedule"
  | "hall-allocation"
  | "seat-allocation"
  | "invigilator-duty"
  | "malpractice"
  | "result-analysis"
  | "rank-holders"
  | "revaluation";

export type ReportFileFormat = "excel" | "pdf" | "csv";

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
