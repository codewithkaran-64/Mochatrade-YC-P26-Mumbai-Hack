export type Currency = "INR" | "USD";

export type Sector =
  | "Technology"
  | "Consumer Discretionary"
  | "Financials"
  | "Healthcare"
  | "Energy"
  | "Commodities"
  | "Index"
  | "Crypto"
  | "Other";

export const SECTORS: Sector[] = [
  "Technology",
  "Consumer Discretionary",
  "Financials",
  "Healthcare",
  "Energy",
  "Commodities",
  "Index",
  "Crypto",
  "Other",
];

export const CURRENCIES: Currency[] = ["INR", "USD"];

export type Direction = "LONG" | "SHORT";

export const LEVERAGE_STEPS = [1, 2, 5, 10, 20] as const;
export type LeverageStep = (typeof LEVERAGE_STEPS)[number];

/** A single existing holding in the user's portfolio. */
export interface Holding {
  id: string;
  asset: string;
  ticker: string;
  quantity: number;
  /** Current market value of this holding, expressed in INR. */
  currentValue: number;
  sector: Sector;
  currency: Currency;
}

/** A trade the user is considering placing, not yet executed. */
export interface PlannedTrade {
  asset: string;
  ticker: string;
  direction: Direction;
  /** Planned trade / margin amount, expressed in INR. */
  amount: number;
  leverage: number;
  sector: Sector;
  currency: Currency;
}

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "VERY HIGH";

export interface RiskFactorResult {
  /** 0-100 */
  score: number;
  /** Weight of this factor in the final score, as a percentage (e.g. 30). */
  weight: number;
  /** score * weight / 100 — this factor's contribution to the total score. */
  contribution: number;
  /** Human-readable label for the factor. */
  label: string;
}

export interface RiskFactors {
  concentration: RiskFactorResult;
  volatility: RiskFactorResult;
  currencyExposure: RiskFactorResult;
  sectorConcentration: RiskFactorResult;
  portfolioFit: RiskFactorResult;
}

export interface RiskInputsSnapshot {
  totalPortfolioValueBefore: number;
  totalPortfolioValueAfter: number;
  existingAssetExposure: number;
  newAssetExposure: number;
  existingSectorExposure: number;
  newSectorExposure: number;
  existingForeignExposure: number;
  newForeignExposure: number;
  baseVolatilityAssumption: number;
  volatilityDataSource: "fallback-assumption";
}

export interface RiskResult {
  totalScore: number;
  riskLevel: RiskLevel;
  factors: RiskFactors;
  inputs: RiskInputsSnapshot;
  calculatedAt: string;
}

export interface AnalysisHistoryEntry {
  id: string;
  timestamp: string;
  trade: PlannedTrade;
  result: RiskResult;
}
