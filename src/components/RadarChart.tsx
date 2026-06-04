"use client";

interface DataPoint {
  label: string;
  value: number; // 0–100
  color: string;
}

interface RadarChartProps {
  data: DataPoint[];
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export function RadarChart({ data, size = 200 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = data.length;
  const startAngle = -Math.PI / 2;

  const angles = data.map((_, i) => startAngle + (2 * Math.PI * i) / n);

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  const gridPolygon = (scale: number) =>
    angles.map((a) => {
      const p = polarToCartesian(cx, cy, maxR * scale, a);
      return `${p.x},${p.y}`;
    }).join(" ");

  // Data polygon
  const dataPolygon = data
    .map((d, i) => {
      const r = (d.value / 100) * maxR;
      const p = polarToCartesian(cx, cy, r, angles[i]);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Grid rings */}
      {rings.map((scale, ri) => (
        <polygon
          key={ri}
          points={gridPolygon(scale)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}

      {/* Spokes */}
      {angles.map((a, i) => {
        const outer = polarToCartesian(cx, cy, maxR, a);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        );
      })}

      {/* Data fill */}
      <polygon
        points={dataPolygon}
        fill="rgba(59,130,246,0.15)"
        stroke="rgba(59,130,246,0.6)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {data.map((d, i) => {
        const r = (d.value / 100) * maxR;
        const p = polarToCartesian(cx, cy, r, angles[i]);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={d.color}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const labelR = maxR + 22;
        const p = polarToCartesian(cx, cy, labelR, angles[i]);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={d.color}
            fontSize={10}
            fontWeight={600}
          >
            {d.label}
            {" "}
            <tspan fill="rgba(255,255,255,0.5)" fontWeight={400}>{d.value}</tspan>
          </text>
        );
      })}
    </svg>
  );
}
