import { InboxIcon } from "@/shared/components/icons";

export function ChartEmptyState({ label, description }: { label: string; description?: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-1.5 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--c-gray-100)] text-[var(--text-tertiary)]">
        <InboxIcon className="h-4 w-4" />
      </span>
      <p className="text-[13px] font-medium text-[var(--text-primary)]">{label}</p>
      {description && <p className="max-w-[220px] text-[12px] text-[var(--text-tertiary)]">{description}</p>}
    </div>
  );
}
