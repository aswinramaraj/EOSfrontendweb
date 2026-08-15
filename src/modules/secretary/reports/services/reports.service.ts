import { apiClient, type BlobResponse } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  ReportFileFormat,
  ReportTable,
  SecretaryReportFilters,
  SecretaryReportKey,
  SecretaryReportsSummary,
} from "../types";

export const secretaryReportsService = {
  // Omitting `format` returns the JSON envelope (the default per
  // SecretaryReportQueryDto) — apiClient.get unwraps it exactly like every
  // other endpoint, since the controller's JSON branch manually replicates
  // the standard envelope shape (it opts out of the interceptor for the
  // binary branches).
  preview(key: SecretaryReportKey, filters: SecretaryReportFilters): Promise<ReportTable> {
    return apiClient.get<ReportTable>(
      `/me/secretary/reports/${key}${buildQuery(filters)}`,
      requireToken(),
    );
  },

  // Both preview and download build their query string from the same
  // filters object, so the file you download can never drift out of sync
  // with the table you previewed.
  download(
    key: SecretaryReportKey,
    format: ReportFileFormat,
    filters: SecretaryReportFilters,
  ): Promise<BlobResponse> {
    return apiClient.downloadBlob(
      `/me/secretary/reports/${key}${buildQuery({ ...filters, format })}`,
      requireToken(),
    );
  },

  summary(): Promise<SecretaryReportsSummary> {
    return apiClient.get<SecretaryReportsSummary>(
      "/me/secretary/reports/summary",
      requireToken(),
    );
  },
};
