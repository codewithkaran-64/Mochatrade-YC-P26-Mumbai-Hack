import type { PlannedTrade, RiskResult } from "@/types";
import { formatINR, formatPercent } from "@/utils/formatters";

/**
 * Deterministic, template-based "Why is it risky?" explanations, generated
 * directly from the risk engine's structured output. This is the reliable
 * fallback used whenever the AI explanation layer is unavailable, and it is
 * good enough to stand on its own — the app never depends on AI to explain
 * a result.
 */
export function generateWhyRisky(trade: PlannedTrade, result: RiskResult): string[] {
  const { factors, inputs } = result;
  const reasons: string[] = [];

  const newAssetShare = inputs.totalPortfolioValueAfter > 0
    ? inputs.newAssetExposure / inputs.totalPortfolioValueAfter
    : 0;

  if (factors.concentration.score >= 40) {
    reasons.push(
      `Your planned ${trade.ticker} position brings your total exposure to that single asset to about ` +
      `${formatPercent(newAssetShare)} of your portfolio (${formatINR(inputs.newAssetExposure)} of ` +
      `${formatINR(inputs.totalPortfolioValueAfter)}). Concentrating this much value in one asset means a move ` +
      `against you has an outsized effect on your overall portfolio.`,
    );
  } else {
    reasons.push(
      `This trade keeps your exposure to ${trade.ticker} relatively contained at about ` +
      `${formatPercent(newAssetShare)} of your portfolio, which limits concentration risk from this single position.`,
    );
  }

  if (factors.volatility.score >= 50) {
    reasons.push(
      `Using ${trade.leverage}× leverage on a ${trade.sector} position means a relatively small move in the ` +
      `underlying asset can have a much larger effect on the margin allocated to this trade. Higher leverage ` +
      `amplifies both gains and losses, which is reflected in the volatility score.`,
    );
  }

  const newForeignShare = inputs.totalPortfolioValueAfter > 0
    ? inputs.newForeignExposure / inputs.totalPortfolioValueAfter
    : 0;
  if (trade.currency !== "INR" && factors.currencyExposure.score >= 40) {
    reasons.push(
      `The planned trade increases your foreign-currency (USD) exposure relative to your INR-based portfolio to ` +
      `about ${formatPercent(newForeignShare)}. Because your portfolio is anchored in rupees, this introduces ` +
      `additional currency sensitivity on top of the underlying asset's own price risk.`,
    );
  }

  const newSectorShare = inputs.totalPortfolioValueAfter > 0
    ? inputs.newSectorExposure / inputs.totalPortfolioValueAfter
    : 0;
  if (factors.sectorConcentration.score >= 40) {
    reasons.push(
      `${trade.sector} already makes up a meaningful share of your holdings. After this trade, sector exposure ` +
      `rises to about ${formatPercent(newSectorShare)} of your portfolio, so a downturn affecting that sector ` +
      `would not be offset by the rest of your holdings.`,
    );
  }

  if (factors.portfolioFit.score >= 50) {
    reasons.push(
      `This trade largely duplicates a position you already hold rather than adding diversification. Trades ` +
      `that overlap heavily with existing holdings tend to increase — rather than spread out — your overall risk.`,
    );
  } else if (factors.portfolioFit.score <= 20) {
    reasons.push(
      `On the positive side, this trade adds exposure outside your current largest holdings, which has a ` +
      `diversifying effect and slightly reduces the portfolio-fit component of your risk score.`,
    );
  }

  return reasons;
}

/** A single short headline summarizing the dominant risk driver. */
export function generateHeadline(result: RiskResult): string {
  const entries = Object.entries(result.factors) as [string, { score: number; label: string }][];
  const top = entries.reduce((a, b) => (b[1].score > a[1].score ? b : a));
  const [, topFactor] = top;

  const levelPhrase: Record<RiskResult["riskLevel"], string> = {
    LOW: "This trade carries relatively low incremental risk to your portfolio.",
    MODERATE: "This trade carries a moderate amount of incremental risk to your portfolio.",
    HIGH: "This trade meaningfully increases your portfolio's risk.",
    "VERY HIGH": "This trade substantially increases your portfolio's risk.",
  };

  return `${levelPhrase[result.riskLevel]} The largest driver is ${topFactor.label.toLowerCase()} (${topFactor.score}/100).`;
}

export function generateWhatIfExplanation(before: RiskResult, after: RiskResult): string {
  const delta = after.totalScore - before.totalScore;
  if (delta === 0) {
    return "This change did not move the overall risk score — the underlying factors roughly offset each other.";
  }

  const direction = delta > 0 ? "increased" : "decreased";
  const factorDeltas = (Object.keys(before.factors) as (keyof RiskResult["factors"])[])
    .map((key) => ({
      label: before.factors[key].label,
      delta: after.factors[key].score - before.factors[key].score,
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const biggest = factorDeltas[0];
  const biggestPhrase = biggest && Math.abs(biggest.delta) >= 1
    ? ` mainly because ${biggest.label.toLowerCase()} ${biggest.delta > 0 ? "rose" : "fell"} by ${Math.abs(biggest.delta).toFixed(1)} points`
    : "";

  return `Risk ${direction} by ${Math.abs(delta)} point${Math.abs(delta) === 1 ? "" : "s"}${biggestPhrase}.`;
}
