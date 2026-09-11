import type { PlannedTrade, RiskResult } from "@/types";
import { generateHeadline, generateWhyRisky } from "@/risk/explanations";

export interface ExplanationRequest {
  portfolioValueBefore: number;
  trade: PlannedTrade;
  result: RiskResult;
  question?: string;
}

export interface ExplanationResponse {
  headline: string;
  reasons: string[];
  answer?: string;
  source: "ai" | "fallback";
}

/**
 * RiskExplanationService is the single entry point the UI calls for
 * natural-language explanations of a risk result. It never calculates
 * risk itself — the deterministic risk engine (src/risk/riskEngine.ts) has
 * already done that — it only narrates the structured result.
 *
 * If the AI backend (the /api/explain route, which uses ANTHROPIC_API_KEY)
 * is unavailable, unconfigured, or errors out for any reason, this service
 * transparently falls back to deterministic templates so the app never
 * breaks or stalls waiting on AI.
 */
export async function explainRisk(request: ExplanationRequest): Promise<ExplanationResponse> {
  try {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) throw new Error(`Explain API returned ${res.status}`);

    const data = await res.json();
    if (data?.disabled) {
      return fallbackExplanation(request);
    }

    return {
      headline: typeof data.headline === "string" ? data.headline : generateHeadline(request.result),
      reasons: Array.isArray(data.reasons) && data.reasons.length > 0
        ? data.reasons
        : generateWhyRisky(request.trade, request.result),
      answer: typeof data.answer === "string" ? data.answer : undefined,
      source: "ai",
    };
  } catch {
    return fallbackExplanation(request);
  }
}

function fallbackExplanation(request: ExplanationRequest): ExplanationResponse {
  return {
    headline: generateHeadline(request.result),
    reasons: generateWhyRisky(request.trade, request.result),
    answer: request.question
      ? "AI Q&A isn't available right now, but the Risk Breakdown above shows exactly which factors are driving your score, and the Why is it risky? section explains each one in plain language."
      : undefined,
    source: "fallback",
  };
}
