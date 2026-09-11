# Mochaguard

Portfolio risk intelligence for leveraged trades on Mochatrade.

> "Mochaguard doesn't tell users what to buy — it helps them understand what they're about to risk."

Built for the **Mochatrade YC P26 Hackathon** by team **CodePool**, on top of the organizer's fork
(`Mochatrade-YC-P26-Mumbai-Hack`).

## Overview

Mochatrade gives Indian traders leveraged, perpetual-futures exposure to US equities. Mochaguard sits on top of that
experience as a **pre-trade risk-analysis layer**: before a trader places a leveraged position, Mochaguard shows
them exactly how that trade would change their portfolio's risk, why, and lets them experiment with the trade size
and leverage to see the risk change in real time.

Mochaguard is **not** a stock predictor, a buy/sell signal generator, a portfolio tracker, or a chatbot. It answers
one question: *"What am I actually risking if I place this trade?"*

## Problem

Leveraged trading tools show P&L, margin, and liquidation price — but rarely show a trader how a *new* trade
interacts with the portfolio they *already* hold. A trader might already be heavily concentrated in one stock, one
sector, or one foreign currency, and a new leveraged position can quietly compound that risk without the platform
ever surfacing it.

## Solution

Mochaguard runs every planned trade through a small, fully deterministic risk engine that scores five factors —
concentration, volatility, currency exposure, sector concentration, and portfolio fit — combines them into a single
0–100 score, and explains the result in plain language. A "What-if" panel lets the trader adjust trade size,
leverage, or direction and see the score recalculate instantly, side by side with the original.

## Features

- **Portfolio builder** — add, edit, delete holdings (asset, ticker, quantity, value, sector, currency), with
  validation and live totals, sector exposure, and currency exposure.
- **Planned trade form** — ticker, direction, amount, leverage (1x/2x/5x/10x/20x), sector, currency.
- **Deterministic risk engine** — five weighted factors, 0–100 score, LOW/MODERATE/HIGH/VERY HIGH bucketing.
- **Risk breakdown** — per-factor score, weight, and contribution to the total, shown as bars.
- **"Why is it risky?"** — human-readable explanations generated from the actual calculated factors, either via an
  optional AI layer or a deterministic template fallback that always works.
- **What-if scenario** — live sliders/toggles for amount, leverage, and direction, with a Before/After comparison
  and a plain-language explanation of what changed and why.
- **Demo portfolio** — one click loads a realistic six-holding demo portfolio and a pre-filled leveraged NVDA trade,
  clearly labeled as demo data, so a judge can see the full flow in under a minute.
- **Analysis history** — the last 10 analyzed trades, for quick reference.
- Responsive, dark, fintech-styled dashboard with loading/empty/error states and accessible controls.

## Risk Engine

The risk engine (`src/risk/riskEngine.ts`) is **deterministic** — it contains no AI and no randomness. The exact
same portfolio and trade will always produce the exact same score. This is intentional and covered by tests
(`src/risk/riskEngine.test.ts`).

**The weights below are illustrative hackathon-MVP weights and are not intended to represent industry-standard
risk methodology.**

| Factor | Weight | What it measures |
|---|---|---|
| Concentration | 30% | How much of the portfolio, after the trade, sits in this one asset. |
| Volatility | 25% | Sector-based volatility assumption, amplified by the chosen leverage. |
| Currency Exposure | 20% | How much of the portfolio, after the trade, is foreign-currency (non-INR) denominated. |
| Sector Concentration | 15% | How much of the portfolio, after the trade, sits in this one sector. |
| Portfolio Fit | 10% | Whether the trade duplicates an existing position/sector (higher risk) or diversifies away from it (lower risk). |

Each factor is computed as a ratio of "exposure after the trade" to "total portfolio value after the trade," then
normalized against a configurable cap (e.g. concentration risk reaches 100/100 once a single asset would represent
50% of the portfolio). All caps and weights live in one file, `src/risk/constants.ts`, so they can be re-tuned
without touching the calculation logic.

Volatility uses an **illustrative, sector-based fallback assumption** (`BASE_VOLATILITY_BY_SECTOR` in
`constants.ts`) rather than a live market-data feed — this is clearly surfaced in the UI as a fallback assumption,
not real-time data, per the hackathon's "don't fabricate live data" requirement. The structure supports swapping in
a real market-data provider later without changing the engine's public shape.

## Architecture

```
src/
  app/                 # Next.js App Router
    api/explain/       # Server route: AI explanation, with safe fallback signaling
    page.tsx           # The dashboard (composes everything below)
    layout.tsx, globals.css
  components/          # UI only — no risk math lives here
  risk/                # Deterministic risk engine (source of truth) + explanation templates + tests
  services/            # RiskExplanationService — AI-or-fallback abstraction
  hooks/               # useMochaguard — app state, localStorage persistence
  data/                # Demo portfolio/trade (clearly labeled as demo)
  utils/               # Formatting, validation, storage helpers
  types/               # Shared TypeScript types
```

**Data storage:** the starting repository had no backend or database, so Mochaguard keeps the MVP simple: portfolio,
planned trade, and analysis history persist to the browser's `localStorage` (`src/utils/storage.ts`). All reads are
funneled through `useMochaguard`, so swapping in a real backend later means changing that one hook, not the UI.

## Tech Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict mode)
- **Tailwind CSS** for styling — no UI component library, hand-built fintech-styled components
- **Vitest** for the risk-engine test suite
- No database — client-side state + `localStorage` (see above)
- Optional: **Anthropic API** for the AI explanation layer (server-side only, never exposed to the browser)

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` if you want to enable the optional AI explanation layer:

```bash
cp .env.example .env
```

| Variable | Required? | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Enables AI-narrated "Why is it risky?" explanations via `/api/explain`. If unset, the app automatically uses deterministic template explanations — nothing breaks. |

## Running Locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm run start
```

## Testing

```bash
npm run test
```

Runs the Vitest suite covering: empty/invalid portfolio, low/high concentration, high leverage, currency exposure,
sector concentration, a diversifying trade, the what-if scenario, and a determinism check (same inputs always
produce the same score).

## Demo Instructions

1. Open the app.
2. Click **Load Demo Portfolio** — this populates six demo holdings and a pre-filled leveraged NVDA trade, and
   immediately shows the risk score.
3. Point out the **Risk Breakdown** — concentration and currency exposure are the dominant drivers because the
   portfolio is already NVDA/Tech/USD-heavy.
4. Read **Why is it risky?** — the explanation is generated from the same numbers shown in the breakdown.
5. Open **What-if Scenario**, drag the trade amount down (e.g. ₹1,00,000 → ₹50,000) and/or reduce leverage, and
   watch **Before/After** update instantly with an explanation of what changed.
6. Optionally click **Apply this scenario as my planned trade** to lock in the reduced-risk version and see it land
   in **Recent Analysis**.

## AI Integration

`src/services/riskExplanationService.ts` is the single entry point the UI calls (`explainRisk`). It calls the
server route `src/app/api/explain/route.ts`, which:

- Returns `{ disabled: true }` immediately if `ANTHROPIC_API_KEY` is not set.
- Otherwise sends the **already-calculated** risk result (never the raw portfolio math itself) to the model with
  strict instructions: never recalculate the score, never invent data, never recommend a trade, never claim
  certainty — only narrate the numbers it's given.
- Falls back to the deterministic templates on any error, timeout, or malformed AI response.

The AI is exclusively an explanation layer. It cannot influence the risk score.

## Fallback Behavior

Every AI-touched feature has a deterministic counterpart in `src/risk/explanations.ts`
(`generateHeadline`, `generateWhyRisky`, `generateWhatIfExplanation`) that runs whenever AI is unavailable or fails.
The app is fully functional — portfolio, planned trade, risk score, breakdown, why-is-it-risky, and what-if — with
zero environment variables configured.

## Disclaimer

Mochaguard provides educational risk analysis and does not provide financial advice or guarantee investment
outcomes. The risk weights and volatility assumptions used are illustrative hackathon-MVP choices, not
industry-standard risk methodology. Demo/illustrative data is labeled as such throughout the UI.

## Future Improvements

- Real market-data provider for live volatility instead of the sector-based fallback assumption.
- Backend + database for multi-device portfolio sync (the current `useMochaguard` hook is already structured so
  this is a localized change).
- Risk Q&A chat ("Why did my risk increase?", "What happens if I reduce leverage?") using the same
  `RiskExplanationService` abstraction with a `question` field already wired into the API route.
- Historical risk-over-time charting from the analysis history that's already being recorded.
- Authentication and per-user persistence.
