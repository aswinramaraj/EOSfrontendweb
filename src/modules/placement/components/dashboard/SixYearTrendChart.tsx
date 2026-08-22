import type { TrendPoint } from "../../types";

interface SixYearTrendChartProps {
  data: TrendPoint[];
}

const WIDTH = 300;
const HEIGHT = 110;
const PAD_X = 10;
const PAD_Y = 15;

/** Exact values transcribed from Placement Module v2.dc.html's Six-year trend block (point math generalized to handle any N, not the mockup's hardcoded 6). */
export function SixYearTrendChart({ data }: SixYearTrendChartProps) {
  const max = Math.max(...data.map((d) => d.rate), 1);
  const min = Math.min(...data.map((d) => d.rate), 0);
  const span = max - min || 1;

  const points = data.map((d, i) => {
    const x = data.length > 1 ? PAD_X + (i / (data.length - 1)) * (WIDTH - PAD_X * 2) : WIDTH / 2;
    const y = HEIGHT - PAD_Y - ((d.rate - min) / span) * (HEIGHT - PAD_Y * 2);
    return { x, y, ...d };
  });

  const linePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPoints = `${PAD_X},92 ${linePoints} ${WIDTH - PAD_X},92`;

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 14, fontWeight: 650 }}>Six-year trend</div>
      <div style={{ fontSize: 11.5, color: "#8b95a6", marginTop: 2 }}>Placement percentage by cycle</div>

      {data.length === 0 ? (
        <p style={{ marginTop: 24, fontSize: 13, color: "#96a0b0" }}>Not enough batch history yet.</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" style={{ width: "100%", height: 118, marginTop: 12 }}>
            <line x1="0" y1="92" x2={WIDTH} y2="92" stroke="#e6eaf1" strokeWidth={1} />
            <line x1="0" y1="50" x2={WIDTH} y2="50" stroke="#eef1f6" strokeWidth={1} />
            <polyline points={areaPoints} fill="#eef3fe" stroke="none" />
            <polyline points={linePoints} fill="none" stroke="#1f4fd8" strokeWidth={2.4} strokeLinejoin="round" />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={3.2} fill="#fff" stroke="#1f4fd8" strokeWidth={2} />
            ))}
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            {data.map((d) => (
              <div key={d.cycle} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 10.5, fontWeight: 500 }}>{d.rate}%</div>
                <div style={{ fontSize: 9.5, color: "#96a0b0", marginTop: 2 }}>{d.cycle}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
