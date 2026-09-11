import { NextRequest, NextResponse } from "next/server";
import { generateHeadline, generateWhyRisky } from "@/risk/explanations";
import type { PlannedTrade, RiskResult } from "@/types";

export const runtime = "nodejs";

interface ExplainRequestBody {
  portfolioValueBefore: number;
  trade: PlannedTrade;
  result: RiskResult;
  question?: string;
}

/**
 * POST /api/explain
 *
 * Takes the deterministic risk engine's structured output and asks an AI
 * model to narrate it in natural language. The AI is never given the
 * ability to change the score, invent portfolio data, or invent market
 * data — it only receives the already-computed numbers and is instructed
 * to explain them.
 *
 * If ANTHROPIC_API_KEY is not configured, this route immediately responds
 * with { disabled: true } and the client falls back to deterministic
 * template explanations (see src/services/riskExplanationService.ts).
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ disabled: true });
  }

  let body: ExplainRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { trade, result, question } = body;
  if (!trade || !result) {
    return NextResponse.json({ error: "Missing trade or result" }, { status: 400 });
  }

  const fallbackHeadline = generateHeadline(result);
  const fallbackReasons = generateWhyRisky(trade, result);

  const systemPrompt = `You are Mochaguard's risk-explanation layer. You are given an ALREADY-CALCULATED, deterministic risk score and its factor breakdown for a planned leveraged trade. Your only job is to explain this result clearly in plain language.

Rules you must follow:
- Never invent, adjust, or recalculate the risk score or any factor score. Use only the numbers provided.
- Never invent market prices, portfolio values, or data not provided to you.
- Never claim certainty about future price movement.
- Never recommend buying, selling, or holding anything, and never call anything "safe" or "guaranteed".
- Keep the tone factual and educational, like a risk-analysis tool, not a financial advisor.
- Respond with ONLY a JSON object of the shape {"headline": string, "reasons": string[]${question ? ', "answer": string' : ""}} and nothing else — no markdown fences, no preamble.`;

  const userPrompt = `Planned trade: ${JSON.stringify(trade)}
Risk result: ${JSON.stringify(result)}
${question ? `The user is asking: "${question}"` : "Generate the headline and the 'why is it risky' reasons for this result."}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 700,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ headline: fallbackHeadline, reasons: fallbackReasons, source: "fallback" });
    }

    const data = await response.json();
    const text = (data?.content ?? [])
      .map((block: { type: string; text?: string }) => (block.type === "text" ? block.text ?? "" : ""))
      .join("")
      .trim();

    const cleaned = text.replace(/^```json\s*|^```\s*|```$/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      headline: typeof parsed.headline === "string" ? parsed.headline : fallbackHeadline,
      reasons: Array.isArray(parsed.reasons) && parsed.reasons.length > 0 ? parsed.reasons : fallbackReasons,
      answer: typeof parsed.answer === "string" ? parsed.answer : undefined,
      source: "ai",
    });
  } catch {
    return NextResponse.json({ headline: fallbackHeadline, reasons: fallbackReasons, source: "fallback" });
  }
}
