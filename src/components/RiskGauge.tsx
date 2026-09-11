import type { RiskLevel } from "@/types";

const LEVEL_COLOR: Record<RiskLevel, string> = {
  LOW: "#2fbf83",
  MODERATE: "#e2b93b",
  HIGH: "#e2823b",
  "VERY HIGH": "#e2483b",
};

const LEVEL_BG: Record<RiskLevel, string> = {
  LOW: "rgba(47,191,131,0.12)",
  MODERATE: "rgba(226,185,59,0.12)",
  HIGH: "rgba(226,130,59,0.12)",
  "VERY HIGH": "rgba(226,72,59,0.12)",
};

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  headline?: string;
}

export function RiskGauge({ score, level, headline }: RiskGaugeProps) {
  const radius = 72;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const dashOffset = circumference * (1 - clamped / 100);
  const color = LEVEL_COLOR[level];

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <h2 className="text-sm font-semibold text-ink-100">Overall Risk</h2>
        <span className="chip" style={{ backgroundColor: LEVEL_BG[level], color }}>
          {level}
        </span>
      </div>
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="relative" style={{ width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200" role="img" aria-label={`Risk score ${clamped} out of 100, ${level}`}>
            <circle cx="100" cy="100" r={radius} fill="none" stroke="#1b2430" strokeWidth={stroke} />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 100 100)"
              style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tabular-nums text-ink-100">{Math.round(clamped)}</span>
            <span className="text-xs text-ink-500">/ 100</span>
          </div>
        </div>
        {headline && <p className="max-w-xs text-center text-sm text-ink-300">{headline}</p>}
      </div>
    </div>
  );
}
