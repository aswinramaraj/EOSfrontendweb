import { useMutation } from "@tanstack/react-query";
import { saveBlob } from "@/shared/lib/download-file";
import { hostelReportsService } from "../services/reports.service";
import type { HostelReportFileFormat, HostelReportFilters, HostelReportKey } from "../types/reports";

function fallbackFilename(key: HostelReportKey, format: HostelReportFileFormat): string {
  const isoDate = new Date().toISOString().slice(0, 10);
  return `${key}-${isoDate}.${format === "excel" ? "xlsx" : "pdf"}`;
}

interface DownloadArgs {
  key: HostelReportKey;
  format: HostelReportFileFormat;
  filters: HostelReportFilters;
}

// A mutation, not a query — same reasoning as library's useReportDownload:
// a download is a one-shot side effect with no cacheable result.
export function useHostelReportDownload() {
  return useMutation({
    mutationFn: async ({ key, format, filters }: DownloadArgs) => {
      const { blob, filename } = await hostelReportsService.download(key, format, filters);
      saveBlob(blob, filename ?? fallbackFilename(key, format));
    },
  });
}
