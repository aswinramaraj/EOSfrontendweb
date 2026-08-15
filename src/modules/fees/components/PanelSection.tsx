import type { ReactNode } from "react";

interface PanelSectionProps {
  description: string;
  action?: ReactNode;
  children: ReactNode;
}

// Shared enterprise-card wrapper for the CRUD panels (Demand, Quota, Fee
// Structures, Fee Structure Items) — same border/shadow/radius tokens
// already used by Fee Payments and Finance Overview, so every tab in the
// module reads as one consistent product instead of some tabs having a
// polished card treatment and others being bare text on the page background.
export function PanelSection({ description, action, children }: PanelSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-[var(--text-tertiary)]">{description}</p>
        {action}
      </div>

      <div className="rounded-[var(--r-xl)] border border-[var(--border-subtle)] bg-white p-[var(--sp-4)] shadow-[var(--shadow-xs)]">
        {children}
      </div>
    </div>
  );
}
