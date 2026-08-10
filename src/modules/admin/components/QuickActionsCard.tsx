import type { ComponentType, SVGProps } from "react";
import { ChevronRightIcon } from "@/shared/components/icons";
import { DashboardCard } from "./DashboardCard";

interface QuickAction {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  note: string;
}

export function QuickActionsCard({ actions }: { actions: QuickAction[] }) {
  return (
    <DashboardCard title="Quick actions" bodyClassName="flex flex-col gap-1 p-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            disabled
            title={`${action.label} — module planned`}
            className="flex w-full cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-left"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-slate-400">{action.label}</span>
              <span className="block truncate text-xs text-slate-400">{action.note}</span>
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
          </button>
        );
      })}
    </DashboardCard>
  );
}
