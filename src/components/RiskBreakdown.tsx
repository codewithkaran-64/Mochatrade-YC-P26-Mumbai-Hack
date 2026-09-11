import type { RiskFactorResult, RiskFactors } from "@/types";

function barColor(score: number): string {
  if (score <= 30) return "#2fbf83";
  if (score <= 60) return "#e2b93b";
  if (score <= 80) return "#e2823b";
  return "#e2483b";
}

function FactorRow({ factor }: { factor: RiskFactorResult }) {
  const color = barColor(factor.score);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium text-ink-200">{factor.label}</span>
        <span className="font-mono text-xs text-ink-400">
          {factor.score.toFixed(0)}/100 · weight {factor.weight}% · contributes {factor.contribution.toFixed(1)}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-base-900">
        <div
          className="h-full origin-left animate-bar-grow rounded-full"
          style={{ width: `${factor.score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function RiskBreakdown({ factors }: { factors: RiskFactors }) {
  const items = [
    factors.concentration,
    factors.volatility,
    factors.currencyExposure,
    factors.sectorConcentration,
    factors.portfolioFit,
  ];

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <h2 className="text-sm font-semibold text-ink-100">Risk Breakdown</h2>
        <span className="text-xs text-ink-500">What is causing my risk?</span>
      </div>
      <div className="space-y-4 p-5">
        {items.map((f) => (
          <FactorRow key={f.label} factor={f} />
        ))}
        <p className="pt-1 text-xs text-ink-500">
          Volatility uses an illustrative fallback assumption by sector, not a live market feed — see the README for
          details.
        </p>
      </div>
    </div>
  );
}
