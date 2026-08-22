// Shared skeleton-loading primitives for the HR module — one consistent
// shimmer look (soft indigo blocks on a white card) instead of every page
// inventing its own spinner/"Loading…" text.

function bar(className: string) {
  return <div className={`animate-pulse rounded-full bg-[#EEF2FF] ${className}`} />;
}

function block(className: string) {
  return <div className={`animate-pulse rounded-lg bg-[#EEF2FF] ${className}`} />;
}

export function HRStatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      {bar("h-3 w-20")}
      {bar("mt-3 h-6 w-14")}
    </div>
  );
}

export function HRStatGridSkeleton({ count = 4 }: { count?: number }) {
  if (count === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <HRStatCardSkeleton key={i} />
      ))}
    </div>
  );
}

const CARD_ROW_COLS: Record<number, string> = {
  1: "sm:grid-cols-1 lg:grid-cols-1",
  2: "sm:grid-cols-2 lg:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function HRCardRowSkeleton({ count = 3, contentClassName = "h-40" }: { count?: number; contentClassName?: string }) {
  if (count === 0) return null;
  return (
    <div className={`grid grid-cols-1 gap-5 ${CARD_ROW_COLS[count] ?? CARD_ROW_COLS[3]}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
          {bar("h-3 w-24")}
          {block(`mt-4 ${contentClassName}`)}
        </div>
      ))}
    </div>
  );
}

export function HRBlockSkeleton({ contentClassName = "h-64" }: { contentClassName?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      {bar("h-3 w-64")}
      {block(`mt-4 ${contentClassName}`)}
    </div>
  );
}

/** Row-shaped skeleton for bordered list containers (requests, payroll,
 *  payslips, documents-pf) — mirrors the real row's avatar + two text lines
 *  + trailing chip layout so the loading state doesn't jump in height once
 *  real rows land. */
export function HRListRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
          {block("h-9 w-9 shrink-0 rounded-full")}
          <div className="min-w-0 flex-1">
            {bar("h-3.5 w-40")}
            {bar("mt-2 h-3 w-24")}
          </div>
          {bar("h-5 w-16 shrink-0")}
        </div>
      ))}
    </div>
  );
}

/** Stacked, independently-bordered row cards (payroll's per-record cards,
 *  as opposed to the single bordered list container HRListRowsSkeleton
 *  mimics) — same shimmer, different container shape. */
export function HRStackedRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
          {block("h-10 w-full")}
        </div>
      ))}
    </div>
  );
}

/** Grid-of-profile-cards skeleton (Faculty Directory's grid view) — avatar
 *  circle + name bar + a 2x2 meta grid, matching FacultyDirectoryCard's
 *  real shape so the grid doesn't reflow once real cards land. */
export function HRDirectoryCardsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            {block("h-11 w-11 shrink-0 rounded-full")}
            <div className="min-w-0 flex-1">
              {bar("h-3.5 w-32")}
              {bar("mt-2 h-3 w-14")}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j}>
                {bar("h-2.5 w-16")}
                {bar("mt-1.5 h-3 w-20")}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Grid of review/score cards (Employee Reviews list) — circular score
 *  stand-in + name/role lines + a trailing status-pill-shaped bar. */
export function HRScoreCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-4">
            {block("h-16 w-16 shrink-0 rounded-full")}
            <div className="min-w-0 flex-1">
              {bar("h-3.5 w-32")}
              {bar("mt-2 h-3 w-20")}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            {bar("h-5 w-20")}
            {bar("h-3 w-24")}
          </div>
        </div>
      ))}
    </div>
  );
}

interface HRPageSkeletonProps {
  /** Stat cards across the top — 0 to omit. */
  statCount?: number;
  /** Mid-page card row — 0 to omit. */
  cardCount?: number;
  cardContentClassName?: string;
  /** Trailing full-width block (table/list stand-in) — 0 to omit. */
  blockCount?: number;
  blockContentClassName?: string;
}

/** Generic whole-page loading placeholder — stat row + card row + a full
 *  width block — composed to roughly match the shape of most HR pages
 *  (header is real/rendered immediately, only the data-dependent body
 *  below it is replaced by this while the query is in flight). */
export function HRPageSkeleton({
  statCount = 4,
  cardCount = 3,
  cardContentClassName = "h-40",
  blockCount = 1,
  blockContentClassName = "h-56",
}: HRPageSkeletonProps) {
  return (
    <div className="flex flex-col gap-5">
      <HRStatGridSkeleton count={statCount} />
      <HRCardRowSkeleton count={cardCount} contentClassName={cardContentClassName} />
      {Array.from({ length: blockCount }).map((_, i) => (
        <HRBlockSkeleton key={i} contentClassName={blockContentClassName} />
      ))}
    </div>
  );
}
