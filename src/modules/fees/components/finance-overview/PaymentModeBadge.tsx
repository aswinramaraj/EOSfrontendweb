const MODE_STYLES: Record<string, { label: string; bg: string; fg: string }> = {
  cash: { label: "Cash", bg: "var(--c-success-50)", fg: "var(--c-success-700)" },
  card: { label: "Card", bg: "var(--c-primary-50)", fg: "var(--c-primary-600)" },
  upi: { label: "UPI", bg: "#f5f3ff", fg: "#7c3aed" },
  dd: { label: "DD", bg: "var(--c-warning-50)", fg: "var(--c-warning-700)" },
  netbanking: { label: "Net Banking", bg: "var(--c-gray-100)", fg: "var(--text-secondary)" },
};

export function PaymentModeBadge({ mode }: { mode: string | null }) {
  if (!mode) return <span className="text-[var(--text-tertiary)]">—</span>;

  const style = MODE_STYLES[mode] ?? { label: mode, bg: "var(--c-gray-100)", fg: "var(--text-secondary)" };

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11.5px] font-medium"
      style={{ background: style.bg, color: style.fg }}
    >
      {style.label}
    </span>
  );
}
