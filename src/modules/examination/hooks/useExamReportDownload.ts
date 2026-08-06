import { useMutation } from "@tanstack/react-query";
import { saveBlob } from "@/shared/lib/download-file";
import { examReportsService } from "../services/reports.service";
import type { ReportFileFormat, ReportKey } from "../types/reports";

function fallbackFilename(key: ReportKey, format: ReportFileFormat): string {
  const isoDate = new Date().toISOString().slice(0, 10);
  const ext = format === "excel" ? "xlsx" : format === "csv" ? "csv" : "pdf";
  return `${key}-${isoDate}.${ext}`;
}

interface DownloadArgs {
  key: ReportKey;
  format: ReportFileFormat;
  examId: number;
}

// A mutation, not a query — a download is a one-shot side effect, not a
// cacheable result (see Library's identical useReportDownload for why).
export function useExamReportDownload() {
  return useMutation({
    mutationFn: async ({ key, format, examId }: DownloadArgs) => {
      const { blob, filename } = await examReportsService.download(key, format, examId);
      saveBlob(blob, filename ?? fallbackFilename(key, format));
    },
  });
}
