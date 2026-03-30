import { DimensionScore } from "@/models/types";

interface RadarChartProps {
  data: DimensionScore[];
}

export const RadarChart = ({ data }: RadarChartProps) => {
  const size = 340;
  const center = size / 2;
  const radius = 118;
  const levels = [20, 40, 60, 80, 100];

  const pointFor = (index: number, value: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const scaledRadius = (radius * value) / 100;

    return {
      x: center + Math.cos(angle) * scaledRadius,
      y: center + Math.sin(angle) * scaledRadius
    };
  };

  const polygon = data
    .map((point, index) => {
      const coords = pointFor(index, point.score, data.length);
      return `${coords.x},${coords.y}`;
    })
    .join(" ");

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-[340px] w-[340px]">
        {levels.map((level) => {
          const ring = data
            .map((_, index) => {
              const coords = pointFor(index, level, data.length);
              return `${coords.x},${coords.y}`;
            })
            .join(" ");

          return (
            <polygon
              key={level}
              points={ring}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {data.map((point, index) => {
          const outer = pointFor(index, 100, data.length);
          return (
            <g key={point.label}>
              <line
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255,255,255,0.08)"
              />
              <text
                x={outer.x}
                y={outer.y}
                fill="rgba(226,232,240,0.9)"
                fontSize="11"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {point.label}
              </text>
            </g>
          );
        })}

        <polygon
          points={polygon}
          fill="rgba(46, 197, 206, 0.28)"
          stroke="rgba(46, 197, 206, 0.95)"
          strokeWidth="2.5"
        />
        {data.map((point, index) => {
          const coords = pointFor(index, point.score, data.length);
          return <circle key={`${point.label}-${index}`} cx={coords.x} cy={coords.y} r="4" fill="#2ec5ce" />;
        })}
      </svg>

      <div className="space-y-3">
        {data.map((point) => (
          <div key={point.label} className="rounded-3xl border border-white/8 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm text-slate-300">{point.label}</span>
              <span className="text-sm font-semibold text-white">{point.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/8">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-accent to-gold"
                style={{ width: `${point.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
