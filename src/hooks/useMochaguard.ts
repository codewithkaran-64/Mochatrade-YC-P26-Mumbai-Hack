"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnalysisHistoryEntry, Holding, PlannedTrade, RiskResult } from "@/types";
import { calculateRisk } from "@/risk/riskEngine";
import { DEMO_PORTFOLIO, DEMO_TRADE } from "@/data/demoPortfolio";
import { loadFromStorage, saveToStorage } from "@/utils/storage";

const PORTFOLIO_KEY = "portfolio";
const TRADE_KEY = "trade";
const HISTORY_KEY = "history";
const MAX_HISTORY = 10;

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface PortfolioTotals {
  totalValue: number;
  sectorExposure: Record<string, number>;
  currencyExposure: Record<string, number>;
}

function computeTotals(portfolio: Holding[]): PortfolioTotals {
  const totalValue = portfolio.reduce((sum, h) => sum + h.currentValue, 0);
  const sectorExposure: Record<string, number> = {};
  const currencyExposure: Record<string, number> = {};

  for (const holding of portfolio) {
    sectorExposure[holding.sector] = (sectorExposure[holding.sector] ?? 0) + holding.currentValue;
    currencyExposure[holding.currency] = (currencyExposure[holding.currency] ?? 0) + holding.currentValue;
  }

  return { totalValue, sectorExposure, currencyExposure };
}

export function useMochaguard() {
  const [hydrated, setHydrated] = useState(false);
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [trade, setTrade] = useState<PlannedTrade | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [isDemo, setIsDemo] = useState(false);

  // Hydrate from localStorage once on mount (client-only).
  useEffect(() => {
    setPortfolio(loadFromStorage<Holding[]>(PORTFOLIO_KEY, []));
    setTrade(loadFromStorage<PlannedTrade | null>(TRADE_KEY, null));
    setHistory(loadFromStorage<AnalysisHistoryEntry[]>(HISTORY_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveToStorage(PORTFOLIO_KEY, portfolio);
  }, [portfolio, hydrated]);

  useEffect(() => {
    if (hydrated) saveToStorage(TRADE_KEY, trade);
  }, [trade, hydrated]);

  useEffect(() => {
    if (hydrated) saveToStorage(HISTORY_KEY, history);
  }, [history, hydrated]);

  const totals = useMemo(() => computeTotals(portfolio), [portfolio]);

  const result: RiskResult | null = useMemo(() => {
    if (!trade) return null;
    return calculateRisk(portfolio, trade);
  }, [portfolio, trade]);

  const addHolding = useCallback((holding: Holding) => {
    setPortfolio((prev) => [...prev, holding]);
    setIsDemo(false);
  }, []);

  const updateHolding = useCallback((id: string, updated: Omit<Holding, "id">) => {
    setPortfolio((prev) => prev.map((h) => (h.id === id ? { ...updated, id } : h)));
  }, []);

  const deleteHolding = useCallback((id: string) => {
    setPortfolio((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const clearPortfolio = useCallback(() => {
    setPortfolio([]);
    setTrade(null);
    setIsDemo(false);
  }, []);

  const loadDemo = useCallback(() => {
    setPortfolio(DEMO_PORTFOLIO.map((h) => ({ ...h, id: makeId() })));
    setTrade({ ...DEMO_TRADE });
    setIsDemo(true);
  }, []);

  const analyzeTrade = useCallback(
    (newTrade: PlannedTrade) => {
      setTrade(newTrade);
      const computed = calculateRisk(portfolio, newTrade);
      setHistory((prev) => {
        const entry: AnalysisHistoryEntry = {
          id: makeId(),
          timestamp: new Date().toISOString(),
          trade: newTrade,
          result: computed,
        };
        return [entry, ...prev].slice(0, MAX_HISTORY);
      });
    },
    [portfolio],
  );

  return {
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
  };
}
