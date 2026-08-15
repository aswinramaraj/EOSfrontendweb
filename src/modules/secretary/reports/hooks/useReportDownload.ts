import { useMutation } from "@tanstack/react-query";
import { saveBlob } from "@/shared/lib/download-file";
import { secretaryReportsService } from "../services/reports.service";
import type { ReportFileFormat, SecretaryReportFilters, SecretaryReportKey } from "../types";

function fallbackFilename(key: SecretaryReportKey, format: ReportFileFormat): string {
  const isoDate = new Date().toISOString().slice(0, 10);
  return `${key}-${isoDate}.${format === "excel" ? "xlsx" : "pdf"}`;
}

interface DownloadArgs {
  key: SecretaryReportKey;
  format: ReportFileFormat;
  filters: SecretaryReportFilters;
}

// A mutation, not a query — a download is a one-shot side effect with no
// cacheable result (same reasoning as the library module's useReportDownload).
export function useReportDownload() {
  return useMutation({
    mutationFn: async ({ key, format, filters }: DownloadArgs) => {
      const { blob, filename } = await secretaryReportsService.download(key, format, filters);
      saveBlob(blob, filename ?? fallbackFilename(key, format));
    },
  });
}
