/**
 * Hand-rolled SVG chart primitives — no charting library is installed in
 * this project, and none of these shapes need one. Colours follow a single
 * blue "data ramp" (strong → mid → weak → muted) rather than a categorical
 * palette, so a chart reads as one family instead of a rainbow.
 */

const DATA_STRONG = "#2563eb"; // tailwind blue-600
const DATA_MID = "#60a5fa"; // blue-400
const DATA_WEAK = "#bfdbfe"; // blue-200
const DATA_MUTED = "#d4dce6"; // slate-ish grey

export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const w = 56;
  const h = 24;
  const barW = w / data.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className ?? "h-6 w-14"} aria-hidden="true">
      {data.map((v, i) => {
        const barH = Math.max(2, (v / max) * h);
        const isLast = i === data.length - 1;
        return (
          <rect
            key={i}
            x={i * barW + 1}
            y={h - barH}
            width={Math.max(1.5, barW - 2)}
            height={barH}
            rx={1}
            fill={isLast ? DATA_STRONG : DATA_WEAK}
          />
        );
      })}
    </svg>
  );
}

interface SeriesPoint {
  label: string;
  value: number;
}

export function AreaLineChart({ data, height = 160 }: { data: SeriesPoint[]; height?: number }) {
  if (data.length === 0) return null;
  const w = 100;
  const h = height;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const stepX = data.length > 1 ? w / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = h - ((d.value - min) / range) * (h - 8) - 4;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={DATA_STRONG} stopOpacity={0.22} />
            <stop offset="100%" stopColor={DATA_STRONG} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaFill)" />
        <path d={linePath} fill="none" stroke={DATA_STRONG} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.6} fill={DATA_STRONG} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: DonutSlice[];
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 15.9155; // circumference == 100 at this radius, so % maps directly to dash length
  let cumulative = 0;

  return (
    // Stacked, not side-by-side: this renders inside dashboard cards whose
    // column width varies with the grid (as narrow as 1/3), and Tailwind's
    // sm: breakpoint reads viewport width, not container width — a row
    // layout would overflow in a narrow column even on a wide viewport.
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
          {total > 0 &&
            data.map((slice) => {
              const pct = (slice.value / total) * 100;
              const dash = `${pct} ${100 - pct}`;
              const offset = -cumulative;
              cumulative += pct;
              return (
                <circle
                  key={slice.label}
                  cx="18"
                  cy="18"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="4.5"
                  strokeDasharray={dash}
                  strokeDashoffset={offset}
                  pathLength={100}
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{centerValue}</span>
          {centerLabel && <span className="text-xs text-slate-500">{centerLabel}</span>}
        </div>
      </div>
      <ul className="flex flex-1 flex-col gap-2">
        {data.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: slice.color }} />
              {slice.label}
            </span>
            <span className="flex items-center gap-2 tabular-nums text-slate-900">
              <span className="font-semibold">{slice.value}</span>
              <span className="w-10 text-right text-xs text-slate-400">
                {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HorizontalBarChart({ data }: { data: SeriesPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm text-slate-600">{d.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GroupedBarChart({
  data,
  aLabel,
  bLabel,
  height = 180,
}: {
  data: { label: string; a: number; b: number }[];
  aLabel: string;
  bLabel: string;
  height?: number;
}) {
  const max = Math.max(...data.flatMap((d) => [d.a, d.b]), 1);
  return (
    <div className="flex items-end justify-between gap-4" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full items-end gap-1">
            <div
              className="w-4 rounded-t bg-blue-500"
              style={{ height: `${Math.max(2, (d.a / max) * (height - 24))}px` }}
              title={`${aLabel}: ${d.a}`}
            />
            <div
              className="w-4 rounded-t bg-blue-200"
              style={{ height: `${Math.max(2, (d.b / max) * (height - 24))}px` }}
              title={`${bLabel}: ${d.b}`}
            />
          </div>
          <span className="text-xs text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function VerticalBarChart({
  data,
  height = 180,
  format,
}: {
  data: SeriesPoint[];
  height?: number;
  format?: (value: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-3" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[11px] font-medium text-slate-500">
            {format ? format(d.value) : d.value}
          </span>
          <div
            className="w-full max-w-8 rounded-t bg-blue-600"
            style={{ height: `${Math.max(2, (d.value / max) * (height - 40))}px` }}
          />
          <span className="text-xs text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export { DATA_STRONG, DATA_MID, DATA_WEAK, DATA_MUTED };
