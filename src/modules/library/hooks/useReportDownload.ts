import { useMutation } from "@tanstack/react-query";
import { saveBlob } from "@/shared/lib/download-file";
import { reportsService } from "../services/reports.service";
import type { ReportFileFormat, ReportFilters, ReportKey } from "../types/reports";

function fallbackFilename(key: ReportKey, format: ReportFileFormat): string {
  const isoDate = new Date().toISOString().slice(0, 10);
  return `${key}-${isoDate}.${format === "excel" ? "xlsx" : "pdf"}`;
}

interface DownloadArgs {
  key: ReportKey;
  format: ReportFileFormat;
  filters: ReportFilters;
}

// A mutation, not a query — a download is a one-shot side effect with no
// cacheable result. As a query it would hold multi-MB blobs in the Query
// cache until GC and re-download on any invalidation; as a mutation it just
// gives per-call isPending and an onError hook.
export function useReportDownload() {
  return useMutation({
    mutationFn: async ({ key, format, filters }: DownloadArgs) => {
      const { blob, filename } = await reportsService.download(key, format, filters);
      saveBlob(blob, filename ?? fallbackFilename(key, format));
    },
  });
}
