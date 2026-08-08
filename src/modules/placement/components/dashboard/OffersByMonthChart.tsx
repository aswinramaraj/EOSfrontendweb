interface OffersByMonthChartProps {
  data: { month: string; count: number }[];
}

// Fixed, content-appropriate height — this card intentionally does NOT
// stretch to match its taller sibling (the department list can run to a
// dozen+ rows). A bar chart stretched to that height looks absurd with only
// 1-2 months of data; a normal dashboard just lets cards differ in height.
const CHART_HEIGHT = "h-56";

export function OffersByMonthChart({ data }: OffersByMonthChartProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-base font-bold text-slate-900">Offers by month</h3>
      <p className="mt-0.5 text-sm text-slate-500">Rolled out across all drives</p>

      <div className="mt-4 border-t border-slate-100" />

      {data.length === 0 ? (
        <div className={`${CHART_HEIGHT} flex items-center justify-center text-sm text-slate-400`}>
          No offers rolled out yet.
        </div>
      ) : (
        <div className={`${CHART_HEIGHT} mt-6 flex items-end justify-center gap-4 sm:gap-6`}>
          <MonthBars data={data} />
        </div>
      )}
    </div>
  );
}

function MonthBars({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const peakIndex = data.reduce((best, d, i) => (d.count > data[best].count ? i : best), 0);

  return (
    <>
      {data.map((d, i) => (
        <div key={d.month} className="flex h-full w-16 flex-col items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{d.count}</span>
          {/* This wrapper is the % height reference for the bar below — a flex
              item (h-full inside a row) resolves a definite size, unlike a
              plain auto-height block, which is what let the bar collapse to
              ~0 height before. */}
          <div className="flex w-full flex-1 items-end justify-center">
            <div
              className={`w-full max-w-14 rounded-t-lg ${i === peakIndex ? "bg-blue-600" : "bg-blue-100"}`}
              style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-500">{d.month}</span>
        </div>
      ))}
    </>
  );
}
