import type { ComponentType, SVGProps } from "react";

type Accent = "blue" | "green" | "red" | "violet" | "amber" | "slate";
type Variant = "primary" | "secondary" | "info";

interface KPICardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent: Accent;
  variant?: Variant;
}

const ACCENTS: Record<Accent, { bg: string; fg: string }> = {
  blue: { bg: "var(--c-primary-50)", fg: "var(--c-primary-600)" },
  green: { bg: "var(--c-success-50)", fg: "var(--c-success-600)" },
  red: { bg: "var(--c-danger-50)", fg: "var(--c-danger-600)" },
  violet: { bg: "#f5f3ff", fg: "#7c3aed" },
  amber: { bg: "var(--c-warning-50)", fg: "var(--c-warning-600)" },
  slate: { bg: "var(--c-gray-100)", fg: "var(--text-secondary)" },
};

export function KPICard({ label, value, subtitle, icon: Icon, accent, variant = "secondary" }: KPICardProps) {
  const tone = ACCENTS[accent];

  if (variant === "info") {
    return (
      <div
        role="group"
        aria-label={`${label}: ${value}. ${subtitle}`}
        className="flex items-center gap-3 rounded-[var(--r-xl)] border border-[var(--border-subtle)] bg-white px-4 py-3.5 shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: tone.bg, color: tone.fg }}
        >
          <Icon className="h-[15px] w-[15px]" />
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-[11.5px] font-medium uppercase tracking-[0.03em] text-[var(--text-tertiary)]">
            {label}
          </p>
          <p className="finance-fade-in text-[19px] font-semibold leading-[1.15] text-[var(--text-primary)] tabular-nums">
            {value}
          </p>
        </div>
      </div>
    );
  }

  const isPrimary = variant === "primary";

  return (
    <div
      role="group"
      aria-label={`${label}: ${value}. ${subtitle}`}
      className={`flex flex-col justify-between rounded-[var(--r-xl)] border p-4 shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${
        isPrimary ? "min-h-[152px] border-[var(--c-primary-100)] bg-[var(--c-primary-50)]" : "min-h-[140px] border-[var(--border-subtle)] bg-white"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: isPrimary ? "white" : tone.bg, color: tone.fg }}
        >
          <Icon className="h-[15px] w-[15px]" />
        </span>
        <p className="text-[12.5px] font-medium uppercase tracking-[0.03em] text-[var(--text-tertiary)]">{label}</p>
      </div>

      <p
        className={`finance-fade-in mt-3 font-semibold leading-[1.1] tracking-[-0.015em] text-[var(--text-primary)] tabular-nums ${
          isPrimary ? "text-[32px]" : "text-[26px]"
        }`}
      >
        {value}
      </p>

      <div className="mt-1 flex items-center gap-1.5">
        <p className="text-[12px] text-[var(--text-tertiary)]">{subtitle}</p>
        {isPrimary && (
          <span className="flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium text-[var(--c-primary-600)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-success-600)]" aria-hidden="true" />
            realtime
          </span>
        )}
      </div>
    </div>
  );
}
