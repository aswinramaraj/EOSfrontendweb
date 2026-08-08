import { useMutation } from "@tanstack/react-query";
import { saveBlob } from "@/shared/lib/download-file";
import { reportsService } from "../services/reports.service";
import type { ReportExportFormat, ReportView } from "../types";

function fallbackFilename(view: ReportView, format: ReportExportFormat): string {
  const isoDate = new Date().toISOString().slice(0, 10);
  return `${view}-wise-placement-report-${isoDate}.${format === "excel" ? "xlsx" : "pdf"}`;
}

interface DownloadArgs {
  view: ReportView;
  format: ReportExportFormat;
  batchId?: number;
  department?: string;
}

// A mutation, not a query — a download is a one-shot side effect with no
// cacheable result (see the library module's useReportDownload for the
// same reasoning).
export function useReportDownload() {
  return useMutation({
    mutationFn: async ({ view, format, batchId, department }: DownloadArgs) => {
      const { blob, filename } = await reportsService.download(view, format, batchId, department);
      saveBlob(blob, filename ?? fallbackFilename(view, format));
    },
  });
}
