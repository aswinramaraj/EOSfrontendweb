export function FinanceOverviewLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-[var(--sp-4)] sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-[var(--r-xl)] border border-[var(--border-subtle)] bg-white p-[var(--sp-4)] shadow-[var(--shadow-xs)]"
          >
            <div className="h-3 w-24 animate-pulse rounded-full bg-[var(--c-gray-100,#f1f5f9)]" />
            <div className="h-6 w-32 animate-pulse rounded-full bg-[var(--c-gray-100,#f1f5f9)]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-[var(--sp-4)] lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex h-56 flex-col gap-3 rounded-[var(--r-xl)] border border-[var(--border-subtle)] bg-white p-[var(--sp-4)] shadow-[var(--shadow-xs)]"
          >
            <div className="h-3 w-40 animate-pulse rounded-full bg-[var(--c-gray-100,#f1f5f9)]" />
            <div className="mt-2 flex-1 animate-pulse rounded-[var(--r-lg)] bg-[var(--c-gray-50,#f8fafc)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
