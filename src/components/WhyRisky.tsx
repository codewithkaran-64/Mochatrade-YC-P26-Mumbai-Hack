interface WhyRiskyProps {
  reasons: string[];
  source: "ai" | "fallback";
  loading?: boolean;
}

export function WhyRisky({ reasons, source, loading }: WhyRiskyProps) {
  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <h2 className="text-sm font-semibold text-ink-100">Why is it risky?</h2>
        <span className="chip bg-base-800 text-ink-400">
          {source === "ai" ? "AI-narrated" : "Deterministic explanation"}
        </span>
      </div>
      <div className="space-y-3 p-5">
        {loading ? (
          <div className="space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-base-700" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-base-700" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-base-700" />
          </div>
        ) : reasons.length === 0 ? (
          <p className="text-sm text-ink-500">Analyze a trade to see why it carries the risk it does.</p>
        ) : (
          <ul className="space-y-3">
            {reasons.map((reason, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
