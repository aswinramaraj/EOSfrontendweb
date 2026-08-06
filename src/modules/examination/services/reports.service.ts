import { apiClient, type BlobResponse } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { ReportFileFormat, ReportKey, ReportTable } from "../types/reports";

export const examReportsService = {
  // Omitting `format` returns the JSON envelope (the controller's default
  // branch), which apiClient.get unwraps exactly like any other endpoint.
  preview(key: ReportKey, examId: number): Promise<ReportTable> {
    return apiClient.get<ReportTable>(
      `/exams/reports/${key}${buildQuery({ exam_id: examId })}`,
      requireToken(),
    );
  },
  download(key: ReportKey, format: ReportFileFormat, examId: number): Promise<BlobResponse> {
    return apiClient.downloadBlob(
      `/exams/reports/${key}${buildQuery({ exam_id: examId, format })}`,
      requireToken(),
    );
  },
};
