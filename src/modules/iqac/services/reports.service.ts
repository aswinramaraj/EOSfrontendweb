import { apiClient, type BlobResponse } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { IqacReportFilters, IqacReportFormat, IqacReportTable, IqacReportType, VenueHistoryEvent } from "../types/reports";

const REPORT_PATHS: Record<IqacReportType, string> = {
  venue_bookings: "venue-bookings",
  student_ods: "student-ods",
  faculty_ods: "faculty-ods",
};

export const iqacReportsService = {
  preview(type: IqacReportType, filters: IqacReportFilters): Promise<IqacReportTable> {
    return apiClient.get<IqacReportTable>(
      `/iqac/reports/${REPORT_PATHS[type]}${buildQuery(filters)}`,
      requireToken(),
    );
  },
  downloadBundle(
    types: IqacReportType[],
    format: IqacReportFormat,
    filters: IqacReportFilters,
  ): Promise<BlobResponse> {
    return apiClient.downloadBlob(
      `/iqac/reports/bundle${buildQuery({ ...filters, types: types.join(","), format })}`,
      requireToken(),
    );
  },
  venueHistory(date: string): Promise<VenueHistoryEvent[]> {
    return apiClient.get<VenueHistoryEvent[]>(
      `/iqac/reports/venue-history${buildQuery({ date })}`,
      requireToken(),
    );
  },
};
