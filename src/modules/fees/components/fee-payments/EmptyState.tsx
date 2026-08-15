import { InboxIcon } from "@/shared/components/icons";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "No fee payments found",
  description = "Try adjusting your search or filters.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        <InboxIcon className="h-6 w-6" />
      </span>
      <p className="text-sm font-medium text-zinc-700">{title}</p>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  );
}
