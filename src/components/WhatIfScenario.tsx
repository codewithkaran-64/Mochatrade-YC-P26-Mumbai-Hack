"use client";

import { useMemo, useState } from "react";
import type { Direction, Holding, PlannedTrade, RiskResult } from "@/types";
import { LEVERAGE_STEPS } from "@/types";
import { calculateRisk } from "@/risk/riskEngine";
import { generateWhatIfExplanation } from "@/risk/explanations";
import { formatINR } from "@/utils/formatters";
import { classNames } from "@/utils/formatters";

interface WhatIfScenarioProps {
  portfolio: Holding[];
  baseTrade: PlannedTrade;
  baseResult: RiskResult;
  onApply: (trade: PlannedTrade) => void;
}

function levelColor(level: RiskResult["riskLevel"]): string {
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

export function WhatIfScenario({ portfolio, baseTrade, baseResult, onApply }: WhatIfScenarioProps) {
  const [amount, setAmount] = useState(baseTrade.amount);
  const [leverage, setLeverage] = useState(baseTrade.leverage);
  const [direction, setDirection] = useState<Direction>(baseTrade.direction);

  const scenarioTrade: PlannedTrade = useMemo(
    () => ({ ...baseTrade, amount, leverage, direction }),
    [baseTrade, amount, leverage, direction],
  );

  const scenarioResult = useMemo(() => calculateRisk(portfolio, scenarioTrade), [portfolio, scenarioTrade]);

  const delta = scenarioResult.totalScore - baseResult.totalScore;
  const explanation = useMemo(
    () => generateWhatIfExplanation(baseResult, scenarioResult),
    [baseResult, scenarioResult],
  );

  const maxAmountForSlider = Math.max(baseTrade.amount * 3, 100000);

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <h2 className="text-sm font-semibold text-ink-100">What-if Scenario</h2>
        <span className="text-xs text-ink-500">Change the trade, recalculate instantly</span>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label className="label !mb-0">Trade Amount</label>
            <span className="font-mono text-sm text-ink-200">{formatINR(amount)}</span>
          </div>
          <input
            type="range"
            min={1000}
            max={maxAmountForSlider}
            step={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-accent-500"
            aria-label="Planned trade amount"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label className="label !mb-0">Leverage</label>
            <span className="font-mono text-sm text-ink-200">{leverage}x</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {LEVERAGE_STEPS.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setLeverage(step)}
                className={classNames(
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                  leverage === step
                    ? "border-accent-500 bg-accent-500/15 text-accent-400"
                    : "border-base-600 bg-base-900 text-ink-400 hover:text-ink-200",
                )}
              >
                {step}x
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Direction</label>
          <div className="grid grid-cols-2 gap-2">
            {(["LONG", "SHORT"] as Direction[]).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setDirection(dir)}
                className={classNames(
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                  direction === dir
                    ? "border-accent-500 bg-accent-500/15 text-accent-400"
                    : "border-base-600 bg-base-900 text-ink-400 hover:text-ink-200",
                )}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-base-600 bg-base-900/60 p-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-ink-500">Before</p>
            <p className="text-2xl font-bold text-ink-100">{baseResult.totalScore}</p>
            <p className="text-xs" style={{ color: levelColor(baseResult.riskLevel) }}>
              {baseResult.riskLevel}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-ink-500">After</p>
            <p className="text-2xl font-bold text-ink-100">{scenarioResult.totalScore}</p>
            <p className="text-xs" style={{ color: levelColor(scenarioResult.riskLevel) }}>
              {scenarioResult.riskLevel}
            </p>
          </div>
          <div className="col-span-2 border-t border-base-700 pt-3 text-center">
            <p className="text-xs uppercase tracking-wide text-ink-500">Risk Change</p>
            <p
              className={classNames(
                "text-lg font-bold",
                delta > 0 ? "text-risk-veryhigh" : delta < 0 ? "text-risk-low" : "text-ink-300",
              )}
            >
              {delta > 0 ? "+" : ""}
              {delta}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-ink-400">{explanation}</p>

        <button type="button" className="btn-secondary w-full" onClick={() => onApply(scenarioTrade)}>
          Apply this scenario as my planned trade
        </button>
      </div>
    </div>
  );
}
