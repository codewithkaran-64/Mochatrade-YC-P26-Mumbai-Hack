import { describe, expect, it } from "vitest";
import { calculateRisk, riskLevelForScore } from "./riskEngine";
import type { Holding, PlannedTrade } from "@/types";

const basePortfolio: Holding[] = [
  { id: "1", asset: "NVIDIA", ticker: "NVDA", quantity: 10, currentValue: 150000, sector: "Technology", currency: "USD" },
  { id: "2", asset: "Apple", ticker: "AAPL", quantity: 5, currentValue: 100000, sector: "Technology", currency: "USD" },
  { id: "3", asset: "HDFC Bank", ticker: "HDFCBANK", quantity: 100, currentValue: 250000, sector: "Financials", currency: "INR" },
];

const baseTrade: PlannedTrade = {
  asset: "NVIDIA",
  ticker: "NVDA",
  direction: "LONG",
  amount: 100000,
  leverage: 5,
  sector: "Technology",
  currency: "USD",
};

describe("riskLevelForScore", () => {
  it("buckets scores into the documented thresholds", () => {
    expect(riskLevelForScore(0)).toBe("LOW");
    expect(riskLevelForScore(30)).toBe("LOW");
    expect(riskLevelForScore(31)).toBe("MODERATE");
    expect(riskLevelForScore(60)).toBe("MODERATE");
    expect(riskLevelForScore(61)).toBe("HIGH");
    expect(riskLevelForScore(80)).toBe("HIGH");
    expect(riskLevelForScore(81)).toBe("VERY HIGH");
    expect(riskLevelForScore(100)).toBe("VERY HIGH");
  });
});

describe("calculateRisk - empty / invalid portfolio", () => {
  it("handles an empty portfolio without crashing", () => {
    const result = calculateRisk([], baseTrade);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(Number.isNaN(result.totalScore)).toBe(false);
  });

  it("handles a zero-amount trade without dividing by zero", () => {
    const result = calculateRisk([], { ...baseTrade, amount: 0 });
    expect(Number.isNaN(result.totalScore)).toBe(false);
    // No capital is actually placed at risk, so concentration, currency,
    // sector, and portfolio-fit all resolve to zero. Volatility is a
    // property of the sector/leverage choice itself, independent of size,
    // so it stays nonzero — but its 25% weight keeps the total score low.
    expect(result.factors.concentration.score).toBe(0);
    expect(result.factors.sectorConcentration.score).toBe(0);
    expect(result.factors.portfolioFit.score).toBe(0);
    expect(result.totalScore).toBeLessThan(25);
  });

  it("clamps negative trade amounts to zero exposure instead of going negative", () => {
    const result = calculateRisk(basePortfolio, { ...baseTrade, amount: -50000 });
    expect(result.inputs.newAssetExposure).toBeGreaterThanOrEqual(result.inputs.existingAssetExposure);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
  });
});

describe("calculateRisk - concentration", () => {
  it("produces higher concentration risk for a larger trade in an already-held asset", () => {
    const small = calculateRisk(basePortfolio, { ...baseTrade, amount: 20000 });
    const large = calculateRisk(basePortfolio, { ...baseTrade, amount: 200000 });
    expect(large.factors.concentration.score).toBeGreaterThan(small.factors.concentration.score);
    expect(large.totalScore).toBeGreaterThan(small.totalScore);
  });

  it("keeps concentration low for a small trade in a brand-new asset", () => {
    const result = calculateRisk(basePortfolio, {
      ...baseTrade,
      ticker: "GOLD",
      asset: "Gold",
      sector: "Commodities",
      amount: 10000,
    });
    expect(result.factors.concentration.score).toBeLessThan(20);
  });
});

describe("calculateRisk - leverage / volatility", () => {
  it("increases volatility score as leverage increases, all else equal", () => {
    const low = calculateRisk(basePortfolio, { ...baseTrade, leverage: 1 });
    const high = calculateRisk(basePortfolio, { ...baseTrade, leverage: 20 });
    expect(high.factors.volatility.score).toBeGreaterThan(low.factors.volatility.score);
  });

  it("never exceeds 100 for volatility even at extreme leverage", () => {
    const result = calculateRisk(basePortfolio, { ...baseTrade, leverage: 1000 });
    expect(result.factors.volatility.score).toBeLessThanOrEqual(100);
  });
});

describe("calculateRisk - currency exposure", () => {
  it("scores higher currency risk for a USD trade than an equivalent INR trade", () => {
    const usd = calculateRisk(basePortfolio, { ...baseTrade, currency: "USD" });
    const inr = calculateRisk(basePortfolio, { ...baseTrade, currency: "INR" });
    expect(usd.factors.currencyExposure.score).toBeGreaterThan(inr.factors.currencyExposure.score);
  });
});

describe("calculateRisk - sector concentration", () => {
  it("raises sector risk when the trade adds to an already-dominant sector", () => {
    const result = calculateRisk(basePortfolio, { ...baseTrade, sector: "Technology" });
    const diversifying = calculateRisk(basePortfolio, { ...baseTrade, sector: "Healthcare", ticker: "PFE", asset: "Pfizer" });
    expect(result.factors.sectorConcentration.score).toBeGreaterThan(diversifying.factors.sectorConcentration.score);
  });
});

describe("calculateRisk - portfolio fit / diversification", () => {
  it("scores a duplicating trade higher on portfolio fit than a diversifying trade", () => {
    const duplicating = calculateRisk(basePortfolio, baseTrade);
    const diversifying = calculateRisk(basePortfolio, {
      ...baseTrade,
      ticker: "XOM",
      asset: "ExxonMobil",
      sector: "Energy",
    });
    expect(duplicating.factors.portfolioFit.score).toBeGreaterThan(diversifying.factors.portfolioFit.score);
  });
});

describe("calculateRisk - what-if scenario", () => {
  it("reduces total risk when the trade amount is reduced", () => {
    const before = calculateRisk(basePortfolio, { ...baseTrade, amount: 100000 });
    const after = calculateRisk(basePortfolio, { ...baseTrade, amount: 50000 });
    expect(after.totalScore).toBeLessThan(before.totalScore);
  });

  it("reduces total risk when leverage is reduced", () => {
    const before = calculateRisk(basePortfolio, { ...baseTrade, leverage: 10 });
    const after = calculateRisk(basePortfolio, { ...baseTrade, leverage: 2 });
    expect(after.totalScore).toBeLessThan(before.totalScore);
  });
});

describe("calculateRisk - determinism", () => {
  it("returns identical results for identical inputs, every time", () => {
    const r1 = calculateRisk(basePortfolio, baseTrade);
    const r2 = calculateRisk(basePortfolio, baseTrade);
    const r3 = calculateRisk(basePortfolio, baseTrade);
    expect(r1.totalScore).toBe(r2.totalScore);
    expect(r2.totalScore).toBe(r3.totalScore);
    expect(r1.factors).toEqual(r2.factors);
    expect(JSON.stringify(r1.factors)).toBe(JSON.stringify(r3.factors));
  });
});
