import type { PortfolioTotals } from "@/hooks/useMochaguard";
import { formatINR, formatPercent } from "@/utils/formatters";

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#5ea8ff",
  "Consumer Discretionary": "#f0a35e",
  Financials: "#7ee0a8",
  Healthcare: "#f06fa8",
  Energy: "#e2b93b",
  Commodities: "#c39bf0",
  Index: "#8f9bab",
  Crypto: "#f0605e",
  Other: "#6b7686",
};

interface PortfolioSummaryProps {
  totals: PortfolioTotals;
  holdingsCount: number;
  isDemo: boolean;
}

export function PortfolioSummary({ totals, holdingsCount, isDemo }: PortfolioSummaryProps) {
  const sectorEntries = Object.entries(totals.sectorExposure).sort((a, b) => b[1] - a[1]);
  const currencyEntries = Object.entries(totals.currencyExposure).sort((a, b) => b[1] - a[1]);

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <h2 className="text-sm font-semibold text-ink-100">Portfolio Summary</h2>
        {isDemo && <span className="chip bg-accent-500/15 text-accent-400">Demo data</span>}
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <div>
          <p className="label">Portfolio Value</p>
          <p className="text-2xl font-bold tracking-tight text-ink-100">{formatINR(totals.totalValue)}</p>
          <p className="mt-1 text-xs text-ink-500">{holdingsCount} holding{holdingsCount === 1 ? "" : "s"}</p>
        </div>

        <div>
          <p className="label">Sector Exposure</p>
          {sectorEntries.length === 0 ? (
            <p className="text-xs text-ink-500">No holdings yet.</p>
          ) : (
            <div className="space-y-1.5">
              {sectorEntries.map(([sector, value]) => {
                const pct = totals.totalValue > 0 ? value / totals.totalValue : 0;
                return (
                  <div key={sector} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: SECTOR_COLORS[sector] ?? SECTOR_COLORS.Other }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate text-ink-300">{sector}</span>
                    <span className="font-mono text-ink-400">{formatPercent(pct, 0)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <p className="label">Currency Exposure</p>
          {currencyEntries.length === 0 ? (
            <p className="text-xs text-ink-500">No holdings yet.</p>
          ) : (
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-base-900">
              {currencyEntries.map(([currency, value]) => {
                const pct = totals.totalValue > 0 ? (value / totals.totalValue) * 100 : 0;
                return (
                  <div
                    key={currency}
                    className={currency === "INR" ? "bg-risk-low" : "bg-accent-500"}
                    style={{ width: `${pct}%` }}
                    title={`${currency}: ${formatPercent(pct / 100)}`}
                  />
                );
              })}
            </div>
          )}
          <div className="mt-2 flex gap-4 text-xs text-ink-400">
            {currencyEntries.map(([currency, value]) => (
              <span key={currency} className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${currency === "INR" ? "bg-risk-low" : "bg-accent-500"}`}
                  aria-hidden="true"
                />
                {currency}: {formatPercent(totals.totalValue > 0 ? value / totals.totalValue : 0, 0)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
