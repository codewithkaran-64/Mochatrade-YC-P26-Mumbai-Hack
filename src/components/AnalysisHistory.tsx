import type { AnalysisHistoryEntry } from "@/types";
import { formatINR } from "@/utils/formatters";
import { EmptyState } from "./EmptyState";

function levelColor(level: AnalysisHistoryEntry["result"]["riskLevel"]): string {
  switch (level) {
    case "LOW":
      return "#2fbf83";
    case "MODERATE":
      return "#e2b93b";
    case "HIGH":
      return "#e2823b";
    default:
      return "#e2483b";
  }
}

export function AnalysisHistory({ history }: { history: AnalysisHistoryEntry[] }) {
  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <h2 className="text-sm font-semibold text-ink-100">Recent Analysis</h2>
      </div>
      <div className="p-5">
        {history.length === 0 ? (
          <EmptyState title="No analyses yet" description="Analyzed trades will appear here for quick reference." />
        ) : (
          <ul className="divide-y divide-base-700">
            {history.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink-100">
                    {entry.trade.ticker} · {entry.trade.direction} · {entry.trade.leverage}x
                  </p>
                  <p className="text-xs text-ink-500">
                    {formatINR(entry.trade.amount)} · {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-ink-100">{entry.result.totalScore}</p>
                  <p className="text-xs" style={{ color: levelColor(entry.result.riskLevel) }}>
                    {entry.result.riskLevel}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
