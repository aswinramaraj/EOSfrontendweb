"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDownloadReportBundle } from "@/modules/iqac/hooks/useReports";
import { ReportBuilderPanel } from "@/modules/iqac/components/reports/ReportBuilderPanel";
import { ReportPreviewTable } from "@/modules/iqac/components/reports/ReportPreviewTable";
import { VenueHistorySidebar } from "@/modules/iqac/components/reports/VenueHistorySidebar";
import type { IqacReportType } from "@/modules/iqac/types/reports";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function IqacReportsPage() {
  const [selectedTypes, setSelectedTypes] = useState<IqacReportType[]>(["venue_bookings"]);
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);
  const [historyDate, setHistoryDate] = useState(today());
  const { show } = useToast();

  const download = useDownloadReportBundle();

  function toggleType(type: IqacReportType) {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
    );
  }

  function handleDownload(format: "excel" | "pdf") {
    download.mutate(
      { types: selectedTypes, format, filters: { from, to } },
      {
        onSuccess: () => show("Report downloaded.", "success"),
        onError: (err) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  return (
    <div>
      <PageHeader title="Reports" description="Build a download across venue bookings and on-duty records." />

      <div className="mb-6">
        <ReportBuilderPanel
          selectedTypes={selectedTypes}
          onToggleType={toggleType}
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onDownload={handleDownload}
          isDownloading={download.isPending}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          {selectedTypes.length === 0 && (
            <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Select at least one report type above to preview it here.
            </p>
          )}
          {selectedTypes.map((type) => (
            <ReportPreviewTable key={type} type={type} filters={{ from, to }} />
          ))}
        </div>

        <VenueHistorySidebar date={historyDate} onDateChange={setHistoryDate} />
      </div>
    </div>
  );
}
