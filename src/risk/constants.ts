import type { Sector } from "@/types";

/**
 * Illustrative MVP risk weights for the Mochaguard hackathon build.
 * These are NOT official industry-standard risk weights — they are a
 * transparent, hand-tuned starting point chosen to make each factor's
 * influence on the final score easy to explain to a user or a judge.
 */
export const RISK_WEIGHTS = {
  concentration: 30,
  volatility: 25,
  currencyExposure: 20,
  sectorConcentration: 15,
  portfolioFit: 10,
} as const;

/**
 * Risk level thresholds (inclusive lower bound). Configurable in one place
 * so the interpretation of a score can be tuned without touching the math.
 */
export const RISK_THRESHOLDS = [
  { max: 30, level: "LOW" as const },
  { max: 60, level: "MODERATE" as const },
  { max: 80, level: "HIGH" as const },
  { max: 100, level: "VERY HIGH" as const },
];

/**
 * Illustrative, deterministic base-volatility assumptions per sector, on a
 * 0-100 scale. This is DEMO / FALLBACK data, not a live market feed — it
 * exists so the risk engine can produce a consistent, explainable result
 * even with no market data provider configured. Clearly surfaced in the UI
 * as "Illustrative volatility assumption".
 */
export const BASE_VOLATILITY_BY_SECTOR: Record<Sector, number> = {
  Technology: 65,
  "Consumer Discretionary": 60,
  Financials: 45,
  Healthcare: 40,
  Energy: 55,
  Commodities: 50,
  Index: 35,
  Crypto: 90,
  Other: 50,
};

/** How strongly each additional unit of leverage amplifies volatility risk. */
export const LEVERAGE_VOLATILITY_COEFFICIENT = 0.06;

/**
 * Normalization caps for each ratio-based factor: the portfolio ratio at
 * which that factor's score reaches 100. Chosen to be transparent and easy
 * to reason about (e.g. "single-asset concentration maxes out risk at 50%
 * of the portfolio").
 */
export const NORMALIZATION_CAPS = {
  concentrationRatio: 0.5,
  currencyRatio: 0.6,
  sectorRatio: 0.6,
  fitOverlapRatio: 0.5,
} as const;

/** Weighting between ticker-overlap and sector-overlap inside Portfolio Fit. */
export const PORTFOLIO_FIT_WEIGHTS = {
  tickerOverlap: 0.7,
  sectorOverlap: 0.3,
} as const;
