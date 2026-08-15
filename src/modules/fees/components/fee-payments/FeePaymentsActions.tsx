import { EyeIcon, DotsVerticalIcon } from "@/shared/components/icons";

interface FeePaymentsActionsProps {
  onView?: () => void;
}

export function FeePaymentsActions({ onView }: FeePaymentsActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
      <button
        type="button"
        onClick={onView}
        aria-label="View student"
        className="flex h-7 w-7 items-center justify-center rounded-[var(--r-md)] text-[var(--text-tertiary)] hover:bg-[var(--c-gray-100)]"
      >
        <EyeIcon className="h-[15px] w-[15px]" />
      </button>
      <button
        type="button"
        aria-label="More actions"
        className="flex h-7 w-7 items-center justify-center rounded-[var(--r-md)] text-[var(--text-tertiary)] hover:bg-[var(--c-gray-100)]"
      >
        <DotsVerticalIcon className="h-[15px] w-[15px]" />
      </button>
    </div>
  );
}
