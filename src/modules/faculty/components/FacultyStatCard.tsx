import type { ComponentType, SVGProps } from "react";

type Tone = "blue" | "green" | "amber" | "purple" | "red";

const TONE_STYLES: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-600",
  red: "bg-red-50 text-red-600",
};

interface FacultyStatCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: Tone;
}

// Distinct from the shared StatCard (icon+value side by side, label below) —
// this list page's design puts the label and a small tinted icon on one
// row, then the big number below, so it gets its own component rather than
// bending the shared one (which Library's dashboard also relies on).
export function FacultyStatCard({ label, value, icon: Icon, tone }: FacultyStatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE_STYLES[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
