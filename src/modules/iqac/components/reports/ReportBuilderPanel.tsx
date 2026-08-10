import { Button } from "@/shared/components/ui/Button";
import { CheckIcon, DownloadIcon } from "@/shared/components/icons";
import { IQAC_REPORT_DEFS, IQAC_REPORT_TYPES, type IqacReportType } from "../../types/reports";

interface ReportBuilderPanelProps {
  selectedTypes: IqacReportType[];
  onToggleType: (type: IqacReportType) => void;
  from?: string;
  to?: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onDownload: (format: "excel" | "pdf") => void;
  isDownloading: boolean;
}

export function ReportBuilderPanel({
  selectedTypes,
  onToggleType,
  from,
  to,
  onFromChange,
  onToChange,
  onDownload,
  isDownloading,
}: ReportBuilderPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Build a download</p>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {IQAC_REPORT_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type);
          const def = IQAC_REPORT_DEFS[type];
          return (
            <button
              key={type}
              onClick={() => onToggleType(type)}
              className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-left transition-colors ${
                isSelected ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                }`}
              >
                {isSelected && <CheckIcon className="h-3 w-3" />}
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">{def.label}</span>
                <span className="block text-xs text-slate-500">{def.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-44">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Start date</p>
          <input
            type="date"
            value={from ?? ""}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="w-44">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">End date</p>
          <input
            type="date"
            value={to ?? ""}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex-1" />
        <Button
          variant="primary"
          disabled={selectedTypes.length === 0}
          isPending={isDownloading}
          onClick={() => onDownload("excel")}
        >
          <DownloadIcon className="h-4 w-4" /> Download Excel
        </Button>
        <Button
          variant="secondary"
          disabled={selectedTypes.length === 0}
          isPending={isDownloading}
          onClick={() => onDownload("pdf")}
        >
          <DownloadIcon className="h-4 w-4" /> Download PDF
        </Button>
      </div>
    </section>
  );
}
