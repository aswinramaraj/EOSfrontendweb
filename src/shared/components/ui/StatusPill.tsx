export type PillTone = "green" | "amber" | "red" | "blue" | "slate";

const TONE_STYLES: Record<PillTone, string> = {
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  slate: "bg-slate-100 text-slate-600",
};

interface StatusPillProps {
  tone: PillTone;
  children: React.ReactNode;
}

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide ${TONE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}
