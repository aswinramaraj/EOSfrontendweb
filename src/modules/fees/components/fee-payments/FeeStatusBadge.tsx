import type { DueStatus, KnownDueStatus } from "./types";

const STATUS_STYLES: Record<KnownDueStatus, { bg: string; fg: string; dot: string }> = {
  Paid: { bg: "var(--c-success-50)", fg: "var(--c-success-700)", dot: "var(--c-success-600)" },
  Partial: { bg: "var(--c-warning-50)", fg: "var(--c-warning-700)", dot: "var(--c-warning-600)" },
  Pending: { bg: "var(--c-danger-50)", fg: "var(--c-danger-700)", dot: "var(--c-danger-600)" },
};

const NEUTRAL_TONE = { bg: "var(--c-gray-100, #f1f5f9)", fg: "var(--text-secondary, #4b5768)", dot: "var(--text-tertiary, #667085)" };

function isKnownStatus(status: DueStatus): status is KnownDueStatus {
  return status === "Paid" || status === "Partial" || status === "Pending";
}

export function FeeStatusBadge({ status }: { status: DueStatus }) {
  const tone = isKnownStatus(status) ? STATUS_STYLES[status] : NEUTRAL_TONE;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[6px] px-2 py-[3px] text-[12px] font-medium"
      style={{ background: tone.bg, color: tone.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.dot }} />
      {status || "—"}
    </span>
  );
}
