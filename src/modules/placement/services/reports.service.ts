import { apiClient, type BlobResponse } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import { placementStatsService } from "./placement-stats.service";
import type { ReportExportFormat, ReportsSummary, ReportView } from "../types";

export const reportsService = {
  async summary(batchId?: number): Promise<ReportsSummary> {
    const stats = await placementStatsService.get(batchId);

    return {
      updatedOn: new Date().toISOString().slice(0, 10),
      eligibleStudents: stats.eligibleStudentsTotal,
      // No historical snapshot to compare against yet.
      eligibleStudentsYoy: 0,
      placed: stats.studentsPlaced,
      placedYoyPct: 0,
      placementRate: stats.placementRate,
      highestLpa: stats.highestPackageLpa,
      averageLpa: stats.averagePackageLpa,
      classWise: stats.classWise,
      departmentWise: stats.departmentWise,
    };
  },

  // Same batch/view/department-drilldown the page is showing gets baked
  // into the export, so the downloaded file can never drift out of sync
  // with what's on screen.
  download(
    view: ReportView,
    format: ReportExportFormat,
    batchId?: number,
    department?: string,
  ): Promise<BlobResponse> {
    return apiClient.downloadBlob(
      `/drives/reports/export${buildQuery({ view, format, batch_id: batchId, department })}`,
      requireToken(),
    );
  },
};
