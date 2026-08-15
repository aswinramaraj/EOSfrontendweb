const SKELETON_ROWS = 6;

export function LoadingState() {
  return (
    <div className="flex flex-col gap-3 py-2">
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-2 py-2">
          <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-zinc-100" />
          <span className="h-3 w-32 animate-pulse rounded bg-zinc-100" />
          <span className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
          <span className="h-3 w-28 animate-pulse rounded bg-zinc-100" />
          <span className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
          <span className="ml-auto h-3 w-16 animate-pulse rounded bg-zinc-100" />
        </div>
      ))}
    </div>
  );
}
