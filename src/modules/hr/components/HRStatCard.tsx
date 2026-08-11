import type { ComponentType, SVGProps } from "react";

interface HRStatCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName: string;
  value: string | number;
  label: string;
  caption?: string;
  cornerDot?: boolean;
  onClick?: () => void;
  progressPercent?: number;
}

export function HRStatCard({
  icon: Icon,
  iconClassName,
  value,
  label,
  caption,
  cornerDot,
  onClick,
  progressPercent,
}: HRStatCardProps) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`relative flex h-full w-full flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 text-left ${
        onClick ? "cursor-pointer hover:border-blue-200 hover:shadow-sm" : ""
      }`}
    >
      {cornerDot && <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-red-500" />}
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        {caption && <p className="mt-0.5 text-xs text-slate-500">{caption}</p>}
        {progressPercent !== undefined && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        )}
      </div>
    </Wrapper>
  );
}
