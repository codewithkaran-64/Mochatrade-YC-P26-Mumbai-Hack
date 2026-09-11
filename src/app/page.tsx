"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Disclaimer } from "@/components/Disclaimer";
import { DemoButton } from "@/components/DemoButton";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { PortfolioBuilder } from "@/components/PortfolioBuilder";
import { PlannedTradeForm } from "@/components/PlannedTradeForm";
import { RiskGauge } from "@/components/RiskGauge";
import { RiskBreakdown } from "@/components/RiskBreakdown";
import { WhyRisky } from "@/components/WhyRisky";
import { WhatIfScenario } from "@/components/WhatIfScenario";
import { AnalysisHistory } from "@/components/AnalysisHistory";
import { EmptyState } from "@/components/EmptyState";
import { useMochaguard } from "@/hooks/useMochaguard";
import { explainRisk } from "@/services/riskExplanationService";
import type { PlannedTrade } from "@/types";

export default function Home() {
  const {
    hydrated,
    portfolio,
    totals,
    trade,
    result,
    history,
    isDemo,
    addHolding,
    updateHolding,
    deleteHolding,
    clearPortfolio,
    loadDemo,
    analyzeTrade,
  } = useMochaguard();

  const [explanation, setExplanation] = useState<{
    headline: string;
    reasons: string[];
    source: "ai" | "fallback";
  } | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);

  useEffect(() => {
    if (!trade || !result) {
      setExplanation(null);
      return;
    }
    let cancelled = false;
    setExplanationLoading(true);
    explainRisk({ portfolioValueBefore: totals.totalValue, trade, result }).then((res) => {
      if (!cancelled) {
        setExplanation(res);
        setExplanationLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trade, result]);

  function handleAnalyze(newTrade: PlannedTrade) {
    analyzeTrade(newTrade);
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-base-950">
        <img src="/logo-icon.png" alt="Mochaguard" className="h-14 w-14 animate-pulse rounded-xl shadow-glow" />
        <p className="text-sm text-ink-500">Loading Mochaguard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-950">
      <Header />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-100">
              {result ? "Portfolio Risk Intelligence" : "Understand the risk before you place the trade."}
            </h2>
            <p className="text-sm text-ink-400">
              Mochaguard doesn&apos;t tell you what to buy — it helps you understand what you&apos;re about to risk.
            </p>
          </div>
          <DemoButton onLoadDemo={loadDemo} hasPortfolio={portfolio.length > 0} onClear={clearPortfolio} />
        </section>

        <PortfolioSummary totals={totals} holdingsCount={portfolio.length} isDemo={isDemo} />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <PortfolioBuilder
              holdings={portfolio}
              onAdd={addHolding}
              onUpdate={updateHolding}
              onDelete={deleteHolding}
            />

            {result && trade ? (
              <>
                <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
                  <RiskGauge score={result.totalScore} level={result.riskLevel} />
                  <RiskBreakdown factors={result.factors} />
                </div>
                <WhyRisky
                  reasons={explanation?.reasons ?? []}
                  source={explanation?.source ?? "fallback"}
                  loading={explanationLoading}
                />
              </>
            ) : (
              <EmptyState
                title="No analysis yet"
                description="Fill in a planned trade and click Analyze Trade, or load the demo portfolio to see a full risk analysis in seconds."
              />
            )}

            {history.length > 0 && <AnalysisHistory history={history} />}
          </div>

          <div className="space-y-6">
            <PlannedTradeForm initialTrade={trade} onAnalyze={handleAnalyze} hasPortfolio={portfolio.length > 0} />

            {result && trade && (
              <WhatIfScenario
                portfolio={portfolio}
                baseTrade={trade}
                baseResult={result}
                onApply={handleAnalyze}
              />
            )}
          </div>
        </div>
      </main>

      <Disclaimer />
    </div>
  );
}
