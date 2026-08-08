import { useMutation, useQuery } from "@tanstack/react-query";
import { saveBlob } from "@/shared/lib/download-file";
import { iqacReportsService } from "../services/reports.service";
import { iqacKeys } from "../query-keys";
import type { IqacReportFilters, IqacReportFormat, IqacReportType } from "../types/reports";

export function useIqacReportPreview(type: IqacReportType, filters: IqacReportFilters) {
  return useQuery({
    queryKey: iqacKeys.reports.preview(type, filters),
    queryFn: () => iqacReportsService.preview(type, filters),
    staleTime: 60_000,
  });
}

export function useVenueHistory(date: string | null) {
  return useQuery({
    queryKey: iqacKeys.reports.venueHistory(date ?? ""),
    queryFn: () => iqacReportsService.venueHistory(date as string),
    enabled: date !== null,
  });
}

function fallbackFilename(format: IqacReportFormat): string {
  const isoDate = new Date().toISOString().slice(0, 10);
  return `iqac-report-bundle-${isoDate}.${format === "excel" ? "xlsx" : "pdf"}`;
}

interface DownloadBundleArgs {
  types: IqacReportType[];
  format: IqacReportFormat;
  filters: IqacReportFilters;
}

// A mutation, not a query - a download is a one-shot side effect with no
// cacheable result, same reasoning as hostel/library's useReportDownload.
export function useDownloadReportBundle() {
  return useMutation({
    mutationFn: async ({ types, format, filters }: DownloadBundleArgs) => {
      const { blob, filename } = await iqacReportsService.downloadBundle(types, format, filters);
      saveBlob(blob, filename ?? fallbackFilename(format));
    },
  });
}
