export type PillTone = "green" | "amber" | "red" | "blue" | "slate";

const TONE_STYLES: Record<PillTone, string> = {
  green: "bg-success-tint text-success",
  amber: "bg-warning-tint text-warning",
  red: "bg-danger-tint text-danger",
  blue: "bg-primary-tint text-primary-strong",
  slate: "bg-slate-100 text-slate-600",
};

interface StatusPillProps {
  tone: PillTone;
  children: React.ReactNode;
}

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${TONE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}
