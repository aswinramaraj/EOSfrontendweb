import { ChevronLeftIcon, HistoryIcon, PencilIcon, TrashIcon } from "@/shared/components/icons";

export type HistoryStatus = "draft" | "pending" | "approved" | "rejected" | "delivered";

const STATUS_STYLE: Record<HistoryStatus, { bg: string; fg: string }> = {
  draft: { bg: "#F1F5F9", fg: "#475569" },
  pending: { bg: "#F1F5F9", fg: "#475569" },
  approved: { bg: "#DBEAFE", fg: "#1D4ED8" },
  delivered: { bg: "#DBEAFE", fg: "#1D4ED8" },
  rejected: { bg: "#FEF2F2", fg: "#B91C1C" },
};

export interface HistoryRow {
  id: number;
  title: string;
  qty?: string;
  date: string;
  status: HistoryStatus;
  editable?: boolean;
}

interface RequestHistoryTableProps {
  title: string;
  subtitle: string;
  columnLabel: string;
  qtyLabel?: string;
  rows: HistoryRow[];
  emptyMessage: string;
  onBack: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function RequestHistoryTable({
  title,
  subtitle,
  columnLabel,
  qtyLabel,
  rows,
  emptyMessage,
  onBack,
  onEdit,
  onDelete,
}: RequestHistoryTableProps) {
  const showActions = Boolean(onEdit || onDelete);

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-6 flex items-center gap-3.5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-[10px] border border-[#E3E8EF] px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Back
        </button>
        <div className="flex-1 text-center">
          <div className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">My History</div>
          <div className="text-sm text-slate-600">{subtitle}</div>
        </div>
        <div className="w-[86px]" />
      </div>

      <div className="rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-[10px] border-b border-[#E3E8EF] px-5 py-4">
          <HistoryIcon className="h-[17px] w-[17px] text-blue-600" />
          <div className="text-[15.5px] font-semibold text-slate-900">{title}</div>
        </div>
        <div className="overflow-x-auto px-5 pb-[18px]">
          <div
            className="grid min-w-[600px] items-center gap-3 border-b border-slate-100 pb-2 pt-3.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-slate-600"
            style={{
              gridTemplateColumns: `110px minmax(140px,1fr) ${qtyLabel ? "110px " : ""}110px 100px${showActions ? " 70px" : ""}`,
            }}
          >
            <span>Request ID</span>
            <span>{columnLabel}</span>
            {qtyLabel && <span>{qtyLabel}</span>}
            <span>Submitted</span>
            <span className="text-right">Status</span>
            {showActions && <span />}
          </div>

          {rows.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">{emptyMessage}</p>
          )}

          {rows.map((row) => {
            const style = STATUS_STYLE[row.status];
            return (
              <div
                key={row.id}
                className="grid min-w-[600px] items-center gap-3 border-b border-slate-100 py-3.5 text-[14.5px]"
                style={{
                  gridTemplateColumns: `110px minmax(140px,1fr) ${qtyLabel ? "110px " : ""}110px 100px${showActions ? " 70px" : ""}`,
                }}
              >
                <span className="font-semibold text-blue-700">#{row.id}</span>
                <span className="text-slate-900">{row.title}</span>
                {qtyLabel && <span className="text-slate-600">{row.qty ?? ""}</span>}
                <span className="text-slate-600">{row.date}</span>
                <span className="text-right">
                  <span
                    className="inline-block rounded-full px-[11px] py-[3px] text-xs font-semibold"
                    style={{ background: style.bg, color: style.fg }}
                  >
                    {row.status}
                  </span>
                </span>
                {showActions && (
                  <span className="flex justify-end gap-2.5">
                    {row.editable && onEdit && (
                      <button
                        onClick={() => onEdit(row.id)}
                        className="text-slate-400 hover:text-blue-700"
                        aria-label="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    {row.editable && onDelete && (
                      <button
                        onClick={() => onDelete(row.id)}
                        className="text-slate-400 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
