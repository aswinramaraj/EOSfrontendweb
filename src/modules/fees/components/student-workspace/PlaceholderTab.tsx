export function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-200 text-center">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="text-xs text-zinc-400">Content coming soon.</p>
    </div>
  );
}
