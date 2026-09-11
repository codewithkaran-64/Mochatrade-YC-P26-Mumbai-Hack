import type {
  Holding,
  PlannedTrade,
  RiskFactorResult,
  RiskFactors,
  RiskLevel,
  RiskResult,
} from "@/types";
import {
  BASE_VOLATILITY_BY_SECTOR,
  LEVERAGE_VOLATILITY_COEFFICIENT,
  NORMALIZATION_CAPS,
  PORTFOLIO_FIT_WEIGHTS,
  RISK_THRESHOLDS,
  RISK_WEIGHTS,
} from "./constants";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sumBy<T>(items: T[], predicate: (item: T) => boolean, value: (item: T) => number): number {
  return items.filter(predicate).reduce((total, item) => total + value(item), 0);
}

export function riskLevelForScore(score: number): RiskLevel {
  const bucket = RISK_THRESHOLDS.find((t) => score <= t.max);
  return bucket ? bucket.level : "VERY HIGH";
}

function factor(score: number, weight: number, label: string): RiskFactorResult {
  const clamped = clamp(score, 0, 100);
  return {
    score: round1(clamped),
    weight,
    contribution: round1((clamped * weight) / 100),
    label,
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Calculates portfolio risk for a planned leveraged trade, deterministically.
 *
 * Same inputs will always produce the same output — there is no randomness
 * and no AI involved in this calculation. AI, where enabled, only explains
 * this result in natural language after the fact.
 */
export function calculateRisk(portfolio: Holding[], trade: PlannedTrade): RiskResult {
  const totalPortfolioValueBefore = sumBy(portfolio, () => true, (h) => h.currentValue);
  const safeTradeAmount = Math.max(0, trade.amount || 0);
  const totalPortfolioValueAfter = totalPortfolioValueBefore + safeTradeAmount;

  const existingAssetExposure = sumBy(portfolio, (h) => h.ticker === trade.ticker, (h) => h.currentValue);
  const newAssetExposure = existingAssetExposure + safeTradeAmount;

  const existingSectorExposure = sumBy(portfolio, (h) => h.sector === trade.sector, (h) => h.currentValue);
  const newSectorExposure = existingSectorExposure + safeTradeAmount;

  const existingForeignExposure = sumBy(portfolio, (h) => h.currency !== "INR", (h) => h.currentValue);
  const newForeignExposure = existingForeignExposure + (trade.currency !== "INR" ? safeTradeAmount : 0);

  // --- A. Concentration risk ---
  const concentrationRatio =
    totalPortfolioValueAfter > 0 ? newAssetExposure / totalPortfolioValueAfter : 0;
  const concentrationScore = (concentrationRatio / NORMALIZATION_CAPS.concentrationRatio) * 100;

  // --- B. Volatility risk ---
  const baseVolatilityAssumption = BASE_VOLATILITY_BY_SECTOR[trade.sector] ?? BASE_VOLATILITY_BY_SECTOR.Other;
  const safeLeverage = Math.max(1, trade.leverage || 1);
  const leverageMultiplier = 1 + (safeLeverage - 1) * LEVERAGE_VOLATILITY_COEFFICIENT;
  const volatilityScore = baseVolatilityAssumption * leverageMultiplier;

  // --- C. Currency exposure risk ---
  const currencyRatio = totalPortfolioValueAfter > 0 ? newForeignExposure / totalPortfolioValueAfter : 0;
  const currencyScore = (currencyRatio / NORMALIZATION_CAPS.currencyRatio) * 100;

  // --- D. Sector concentration risk ---
  const sectorRatio = totalPortfolioValueAfter > 0 ? newSectorExposure / totalPortfolioValueAfter : 0;
  const sectorScore = (sectorRatio / NORMALIZATION_CAPS.sectorRatio) * 100;

  // --- E. Portfolio fit ---
  const tickerOverlapRatio = totalPortfolioValueBefore > 0 ? existingAssetExposure / totalPortfolioValueBefore : 0;
  const sectorOverlapRatio = totalPortfolioValueBefore > 0 ? existingSectorExposure / totalPortfolioValueBefore : 0;
  const normalizedTickerOverlap = clamp(tickerOverlapRatio / NORMALIZATION_CAPS.fitOverlapRatio, 0, 1);
  const normalizedSectorOverlap = clamp(sectorOverlapRatio / NORMALIZATION_CAPS.fitOverlapRatio, 0, 1);
  const fitScore =
    (normalizedTickerOverlap * PORTFOLIO_FIT_WEIGHTS.tickerOverlap +
      normalizedSectorOverlap * PORTFOLIO_FIT_WEIGHTS.sectorOverlap) *
    100;

  const factors: RiskFactors = {
    concentration: factor(concentrationScore, RISK_WEIGHTS.concentration, "Concentration"),
    volatility: factor(volatilityScore, RISK_WEIGHTS.volatility, "Volatility"),
    currencyExposure: factor(currencyScore, RISK_WEIGHTS.currencyExposure, "Currency Exposure"),
    sectorConcentration: factor(sectorScore, RISK_WEIGHTS.sectorConcentration, "Sector Concentration"),
    portfolioFit: factor(fitScore, RISK_WEIGHTS.portfolioFit, "Portfolio Fit"),
  };

  const totalScore = Math.round(
    factors.concentration.contribution +
      factors.volatility.contribution +
      factors.currencyExposure.contribution +
      factors.sectorConcentration.contribution +
      factors.portfolioFit.contribution,
  );

  const clampedTotal = clamp(totalScore, 0, 100);

  return {
    totalScore: clampedTotal,
    riskLevel: riskLevelForScore(clampedTotal),
    factors,
    inputs: {
      totalPortfolioValueBefore,
      totalPortfolioValueAfter,
      existingAssetExposure,
      newAssetExposure,
      existingSectorExposure,
      newSectorExposure,
      existingForeignExposure,
      newForeignExposure,
      baseVolatilityAssumption,
      volatilityDataSource: "fallback-assumption",
    },
    calculatedAt: new Date().toISOString(),
  };
}
