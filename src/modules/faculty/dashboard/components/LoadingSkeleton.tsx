interface LoadingSkeletonProps {
  rows?: number;
}

/** No spinner — flat animated skeleton rows, matching the rest of the ERP. */
export function LoadingSkeleton({ rows = 4 }: LoadingSkeletonProps) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}
