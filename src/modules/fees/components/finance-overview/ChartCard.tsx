import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="flex h-full flex-col rounded-[var(--r-xl)] border border-[var(--border-subtle)] bg-white p-3.5 shadow-[var(--shadow-xs)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)]">
      <h4 className="text-[13.5px] font-semibold text-[var(--text-primary)]">{title}</h4>
      <div className="mt-3 flex flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}
