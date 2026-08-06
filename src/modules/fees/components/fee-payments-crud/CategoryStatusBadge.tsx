const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  paid: { bg: "var(--c-success-50)", fg: "var(--c-success-700)" },
  partial: { bg: "var(--c-warning-50)", fg: "var(--c-warning-700)" },
  pending: { bg: "var(--c-danger-50)", fg: "var(--c-danger-700)" },
};

const NEUTRAL_TONE = { bg: "var(--c-gray-100)", fg: "var(--text-secondary)" };

export function CategoryStatusBadge({ status }: { status: string }) {
  const tone = STATUS_STYLES[status.toLowerCase()] ?? NEUTRAL_TONE;

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium capitalize"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {status || "—"}
    </span>
  );
}
