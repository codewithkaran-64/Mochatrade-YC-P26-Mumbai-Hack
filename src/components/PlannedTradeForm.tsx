"use client";

import { useEffect, useState } from "react";
import type { Direction, PlannedTrade } from "@/types";
import { CURRENCIES, SECTORS } from "@/types";
import { draftToTrade, validateTradeDraft, type TradeDraft } from "@/utils/validation";
import { LeverageSelector } from "./LeverageSelector";
import { classNames } from "@/utils/formatters";

interface PlannedTradeFormProps {
  initialTrade: PlannedTrade | null;
  onAnalyze: (trade: PlannedTrade) => void;
  hasPortfolio: boolean;
}

function tradeToDraft(trade: PlannedTrade | null): TradeDraft {
  if (!trade) {
    return { asset: "", ticker: "", direction: "LONG", amount: "", leverage: 5, sector: "", currency: "" };
  }
  return {
    asset: trade.asset,
    ticker: trade.ticker,
    direction: trade.direction,
    amount: String(trade.amount),
    leverage: trade.leverage,
    sector: trade.sector,
    currency: trade.currency,
  };
}

export function PlannedTradeForm({ initialTrade, onAnalyze, hasPortfolio }: PlannedTradeFormProps) {
  const [draft, setDraft] = useState<TradeDraft>(() => tradeToDraft(initialTrade));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep the form in sync when a demo trade is loaded externally.
  useEffect(() => {
    if (initialTrade) setDraft(tradeToDraft(initialTrade));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTrade?.ticker, initialTrade?.amount, initialTrade?.leverage, initialTrade?.direction, initialTrade?.sector, initialTrade?.currency]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateTradeDraft(draft);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    onAnalyze(draftToTrade(draft));
  }

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <h2 className="text-sm font-semibold text-ink-100">Planned Trade</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Asset</label>
            <input
                  autoComplete="off"
              className={`input ${errors.asset ? "input-error" : ""}`}
              placeholder="e.g. NVIDIA"
              value={draft.asset}
              onChange={(e) => setDraft({ ...draft, asset: e.target.value })}
            />
            {errors.asset && <p className="mt-1 text-xs text-risk-veryhigh">{errors.asset}</p>}
          </div>
          <div>
            <label className="label">Ticker</label>
            <input
                  autoComplete="off"
              className={`input ${errors.ticker ? "input-error" : ""}`}
              placeholder="e.g. NVDA"
              value={draft.ticker}
              onChange={(e) => setDraft({ ...draft, ticker: e.target.value.toUpperCase() })}
            />
            {errors.ticker && <p className="mt-1 text-xs text-risk-veryhigh">{errors.ticker}</p>}
          </div>
        </div>

        <div>
          <label className="label">Direction</label>
          <div className="grid grid-cols-2 gap-2">
            {(["LONG", "SHORT"] as Direction[]).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setDraft({ ...draft, direction: dir })}
                className={classNames(
                  "rounded-lg border px-3 py-2 text-sm font-semibold transition-all",
                  draft.direction === dir
                    ? dir === "LONG"
                      ? "border-risk-low bg-risk-low/15 text-risk-low"
                      : "border-risk-veryhigh bg-risk-veryhigh/15 text-risk-veryhigh"
                    : "border-base-600 bg-base-900 text-ink-400 hover:text-ink-200",
                )}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Planned trade amount (INR)</label>
            <input
                  autoComplete="off"
              className={`input ${errors.amount ? "input-error" : ""}`}
              placeholder="e.g. 50000"
              inputMode="decimal"
              value={draft.amount}
              onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
            />
            {errors.amount && <p className="mt-1 text-xs text-risk-veryhigh">{errors.amount}</p>}
          </div>
          <div>
            <label className="label">Sector</label>
            <select
              className={`input ${errors.sector ? "input-error" : ""}`}
              value={draft.sector}
              onChange={(e) => setDraft({ ...draft, sector: e.target.value as TradeDraft["sector"] })}
            >
              <option value="">Select sector</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.sector && <p className="mt-1 text-xs text-risk-veryhigh">{errors.sector}</p>}
          </div>
        </div>

        <div>
          <label className="label">Currency</label>
          <select
            className={`input ${errors.currency ? "input-error" : ""} sm:w-48`}
            value={draft.currency}
            onChange={(e) => setDraft({ ...draft, currency: e.target.value as TradeDraft["currency"] })}
          >
            <option value="">Select currency</option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.currency && <p className="mt-1 text-xs text-risk-veryhigh">{errors.currency}</p>}
        </div>

        <LeverageSelector
          value={draft.leverage}
          onChange={(v) => setDraft({ ...draft, leverage: v })}
          error={errors.leverage}
        />

        <button type="submit" className="btn-primary w-full">
          Analyze Trade
        </button>
        {!hasPortfolio && (
          <p className="text-center text-xs text-ink-500">
            No existing holdings yet — Mochaguard will still analyze this trade on its own.
          </p>
        )}
      </form>
    </div>
  );
}
