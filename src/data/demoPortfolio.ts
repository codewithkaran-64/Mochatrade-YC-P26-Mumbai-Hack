import type { Holding, PlannedTrade } from "@/types";

/**
 * Demo portfolio used by the "Load Demo Portfolio" button. All values are
 * illustrative/demo figures for presentation purposes — not live prices.
 */
export const DEMO_PORTFOLIO: Holding[] = [
  {
    id: "demo-aapl",
    asset: "Apple Inc.",
    ticker: "AAPL",
    quantity: 15,
    currentValue: 300000,
    sector: "Technology",
    currency: "USD",
  },
  {
    id: "demo-nvda",
    asset: "NVIDIA Corp.",
    ticker: "NVDA",
    quantity: 10,
    currentValue: 150000,
    sector: "Technology",
    currency: "USD",
  },
  {
    id: "demo-msft",
    asset: "Microsoft Corp.",
    ticker: "MSFT",
    quantity: 8,
    currentValue: 220000,
    sector: "Technology",
    currency: "USD",
  },
  {
    id: "demo-tsla",
    asset: "Tesla Inc.",
    ticker: "TSLA",
    quantity: 6,
    currentValue: 130000,
    sector: "Consumer Discretionary",
    currency: "USD",
  },
  {
    id: "demo-amzn",
    asset: "Amazon.com Inc.",
    ticker: "AMZN",
    quantity: 12,
    currentValue: 160000,
    sector: "Consumer Discretionary",
    currency: "USD",
  },
  {
    id: "demo-hdfc",
    asset: "HDFC Bank Ltd.",
    ticker: "HDFCBANK",
    quantity: 200,
    currentValue: 340000,
    sector: "Financials",
    currency: "INR",
  },
];

/** Demo planned trade: a leveraged add-on to an existing NVDA position. */
export const DEMO_TRADE: PlannedTrade = {
  asset: "NVIDIA Corp.",
  ticker: "NVDA",
  direction: "LONG",
  amount: 100000,
  leverage: 5,
  sector: "Technology",
  currency: "USD",
};
