export type HRPillTone = "blue" | "red" | "amber" | "green" | "slate" | "purple" | "cyan";

const TONE_STYLES: Record<HRPillTone, string> = {
  blue: "bg-[#EEF2FF] text-[#2655DA]",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-green-50 text-green-700",
  slate: "bg-slate-100 text-slate-600",
  purple: "bg-purple-50 text-purple-700",
  cyan: "bg-cyan-50 text-cyan-700",
};

interface HRPillProps {
  tone: HRPillTone;
  children: React.ReactNode;
  className?: string;
}

/** Category/type badge for taxonomies the shared `StatusPill`'s 5 approval-
 *  style tones don't cover — announcement categories (EMERGENCY/HR/ACADEMIC),
 *  calendar-event types (Instruction/Assessment/Holiday/Placement), etc. */
export function HRPill({ tone, children, className = "" }: HRPillProps) {
  return (
    <span
      className={`inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
