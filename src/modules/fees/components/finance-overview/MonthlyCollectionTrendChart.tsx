import { memo, useMemo, useState } from "react";
import { formatCurrency } from "../fee-payments/format";
import { ChartCard } from "./ChartCard";
import { ChartEmptyState } from "./ChartEmptyState";
import type { MonthlyCollectionPoint } from "./types";

const WIDTH = 360;
const HEIGHT = 180;
const PADDING_LEFT = 44;
const PADDING_RIGHT = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;
const GRID_LINES = 4;

function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    path += ` Q ${current.x} ${current.y} ${midX} ${(current.y + next.y) / 2}`;
    path += ` Q ${next.x} ${next.y} ${next.x} ${next.y}`;
  }
  return path;
}

export const MonthlyCollectionTrendChart = memo(function MonthlyCollectionTrendChart({
  data,
}: {
  data: MonthlyCollectionPoint[];
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { points, linePath, areaPath, maxValue, gridLines } = useMemo(() => {
    if (data.length === 0) {
      return {
        points: [] as Array<MonthlyCollectionPoint & { x: number; y: number }>,
        linePath: "",
        areaPath: "",
        maxValue: 0,
        gridLines: [] as Array<{ y: number; value: number }>,
      };
    }

    const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const max = Math.max(...data.map((point) => point.totalCollected), 1);
    const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;

    const computedPoints = data.map((point, index) => ({
      x: PADDING_LEFT + step * index,
      y: PADDING_TOP + plotHeight - (point.totalCollected / max) * plotHeight,
      ...point,
    }));

    const line = buildSmoothPath(computedPoints);
    const area = `${line} L ${computedPoints[computedPoints.length - 1].x} ${PADDING_TOP + plotHeight} L ${computedPoints[0].x} ${PADDING_TOP + plotHeight} Z`;

    const lines = Array.from({ length: GRID_LINES + 1 }, (_, i) => {
      const value = (max / GRID_LINES) * (GRID_LINES - i);
      return { y: PADDING_TOP + (plotHeight / GRID_LINES) * i, value };
    });

    return { points: computedPoints, linePath: line, areaPath: area, maxValue: max, gridLines: lines };
  }, [data]);

  if (data.length === 0) {
    return (
      <ChartCard title="Monthly Collection Trend">
        <ChartEmptyState
          label="No collection trend yet"
          description="Monthly totals will appear as payments are recorded."
        />
      </ChartCard>
    );
  }

  const summary = data.map((point) => `${point.month}: ${formatCurrency(point.totalCollected)}`).join(", ");
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <ChartCard title="Monthly Collection Trend">
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-44 w-full"
          role="img"
          aria-label={`Monthly collection trend: ${summary}`}
        >
          <defs>
            <linearGradient id="monthly-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--c-primary-200)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--c-primary-200)" stopOpacity={0} />
            </linearGradient>
          </defs>

          {gridLines.map((line) => (
            <g key={line.value}>
              <line
                x1={PADDING_LEFT}
                y1={line.y}
                x2={WIDTH - PADDING_RIGHT}
                y2={line.y}
                stroke="var(--c-gray-100)"
                strokeWidth={1}
              />
              <text x={PADDING_LEFT - 8} y={line.y + 3} textAnchor="end" fontSize={9} fill="var(--text-tertiary)">
                {maxValue >= 1000 ? `${Math.round(line.value / 1000)}K` : Math.round(line.value)}
              </text>
            </g>
          ))}

          <path d={areaPath} fill="url(#monthly-trend-fill)" />
          <path d={linePath} fill="none" stroke="var(--c-primary-500)" strokeWidth={2} strokeLinecap="round" />

          {points.map((point, index) => (
            <g key={point.month}>
              <text x={point.x} y={HEIGHT - 8} textAnchor="middle" fontSize={9} fill="var(--text-tertiary)">
                {point.month}
              </text>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoverIndex === index ? 5 : 3}
                fill="white"
                stroke="var(--c-primary-600)"
                strokeWidth={2}
                className="transition-[r] duration-150"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={10}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              />
            </g>
          ))}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-full flex-col rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-white px-2.5 py-1.5 text-[12px] shadow-[var(--shadow-md)]"
            style={{
              left: `${(hovered.x / WIDTH) * 100}%`,
              top: `${(hovered.y / HEIGHT) * 100}%`,
              marginTop: "-8px",
            }}
          >
            <span className="font-medium text-[var(--text-primary)]">{hovered.month}</span>
            <span className="text-[var(--text-tertiary)] tabular-nums">{formatCurrency(hovered.totalCollected)}</span>
          </div>
        )}
      </div>
    </ChartCard>
  );
});
