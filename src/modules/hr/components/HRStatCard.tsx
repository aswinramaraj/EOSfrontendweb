import type { ComponentType, SVGProps } from "react";
import { HOVERABLE } from "./ui/hoverable";

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
      className={`flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-5 text-left ${HOVERABLE} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <span className="relative shrink-0">
          {cornerDot && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#2655DA]" />}
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClassName}`}>
            <Icon className="h-4 w-4" />
          </span>
        </span>
      </div>
      <p className="mt-3 text-[32px] font-black leading-none tracking-tight text-slate-900">{value}</p>
      {caption && <p className="mt-2 text-xs text-slate-500">{caption}</p>}
      {progressPercent !== undefined && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </Wrapper>
  );
}
