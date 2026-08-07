import { apiClient, type BlobResponse } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  HostelReportFileFormat,
  HostelReportFilters,
  HostelReportKey,
  HostelReportTable,
} from "../types/reports";

export const hostelReportsService = {
  preview(key: HostelReportKey, filters: HostelReportFilters): Promise<HostelReportTable> {
    return apiClient.get<HostelReportTable>(
      `/hostel/reports/${key}${buildQuery(filters)}`,
      requireToken(),
    );
  },
  download(
    key: HostelReportKey,
    format: HostelReportFileFormat,
    filters: HostelReportFilters,
  ): Promise<BlobResponse> {
    return apiClient.downloadBlob(
      `/hostel/reports/${key}${buildQuery({ ...filters, format })}`,
      requireToken(),
    );
  },
};
