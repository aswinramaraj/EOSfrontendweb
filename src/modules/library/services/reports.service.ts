import { apiClient, type BlobResponse } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { ReportFileFormat, ReportFilters, ReportKey, ReportTable } from "../types/reports";

export const reportsService = {
  // Omitting `format` entirely returns the JSON envelope (the default per
  // ReportQueryDto) — apiClient.get unwraps it exactly like every other
  // endpoint, since the controller's JSON branch manually replicates the
  // standard envelope shape.
  preview(key: ReportKey, filters: ReportFilters): Promise<ReportTable> {
    return apiClient.get<ReportTable>(
      `/library/reports/${key}${buildQuery(filters)}`,
      requireToken(),
    );
  },
  // Both preview and download build their query string from the same
  // filters object, so the file you download can never drift out of sync
  // with the table you previewed.
  download(key: ReportKey, format: ReportFileFormat, filters: ReportFilters): Promise<BlobResponse> {
    return apiClient.downloadBlob(
      `/library/reports/${key}${buildQuery({ ...filters, format })}`,
      requireToken(),
    );
  },
};
