import type { Currency, Direction, Holding, PlannedTrade, Sector } from "@/types";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const MAX_REASONABLE_VALUE = 1_000_000_000_000; // 1 trillion INR ceiling, sanity guard

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export interface HoldingDraft {
  asset: string;
  ticker: string;
  quantity: string;
  currentValue: string;
  sector: Sector | "";
  currency: Currency | "";
}

export function validateHoldingDraft(draft: HoldingDraft): ValidationResult {
  const errors: Record<string, string> = {};

  if (!draft.asset.trim()) errors.asset = "Asset name is required.";
  if (!draft.ticker.trim()) {
    errors.ticker = "Ticker is required.";
  } else if (!/^[A-Za-z0-9.\-]{1,12}$/.test(draft.ticker.trim())) {
    errors.ticker = "Ticker looks invalid — use letters/numbers only, up to 12 characters.";
  }

  const quantity = Number(draft.quantity);
  if (draft.quantity.trim() === "" || Number.isNaN(quantity)) {
    errors.quantity = "Enter a valid quantity.";
  } else if (quantity <= 0) {
    errors.quantity = "Quantity must be greater than zero.";
  } else if (quantity > MAX_REASONABLE_VALUE) {
    errors.quantity = "That quantity looks unrealistically large.";
  }

  const currentValue = Number(draft.currentValue);
  if (draft.currentValue.trim() === "" || Number.isNaN(currentValue)) {
    errors.currentValue = "Enter a valid current value.";
  } else if (currentValue <= 0) {
    errors.currentValue = "Current value must be greater than zero.";
  } else if (currentValue > MAX_REASONABLE_VALUE) {
    errors.currentValue = "That value looks unrealistically large.";
  }

  if (!draft.sector) errors.sector = "Select a sector.";
  if (!draft.currency) errors.currency = "Select a currency.";

  return { valid: Object.keys(errors).length === 0, errors };
}

export function draftToHolding(draft: HoldingDraft, id: string): Holding {
  return {
    id,
    asset: draft.asset.trim(),
    ticker: draft.ticker.trim().toUpperCase(),
    quantity: Number(draft.quantity),
    currentValue: Number(draft.currentValue),
    sector: draft.sector as Sector,
    currency: draft.currency as Currency,
  };
}

export interface TradeDraft {
  asset: string;
  ticker: string;
  direction: Direction;
  amount: string;
  leverage: number;
  sector: Sector | "";
  currency: Currency | "";
}

export function validateTradeDraft(draft: TradeDraft): ValidationResult {
  const errors: Record<string, string> = {};

  if (!draft.asset.trim()) errors.asset = "Asset name is required.";
  if (!draft.ticker.trim()) {
    errors.ticker = "Ticker is required.";
  } else if (!/^[A-Za-z0-9.\-]{1,12}$/.test(draft.ticker.trim())) {
    errors.ticker = "Ticker looks invalid — use letters/numbers only, up to 12 characters.";
  }

  const amount = Number(draft.amount);
  if (draft.amount.trim() === "" || Number.isNaN(amount)) {
    errors.amount = "Enter a valid trade amount.";
  } else if (amount <= 0) {
    errors.amount = "Trade amount must be greater than zero.";
  } else if (amount > MAX_REASONABLE_VALUE) {
    errors.amount = "That amount looks unrealistically large.";
  }

  if (!isPositiveFiniteNumber(draft.leverage) || draft.leverage < 1 || draft.leverage > 125) {
    errors.leverage = "Leverage must be between 1x and 125x.";
  }

  if (!draft.sector) errors.sector = "Select a sector.";
  if (!draft.currency) errors.currency = "Select a currency.";

  return { valid: Object.keys(errors).length === 0, errors };
}

export function draftToTrade(draft: TradeDraft): PlannedTrade {
  return {
    asset: draft.asset.trim(),
    ticker: draft.ticker.trim().toUpperCase(),
    direction: draft.direction,
    amount: Number(draft.amount),
    leverage: draft.leverage,
    sector: draft.sector as Sector,
    currency: draft.currency as Currency,
  };
}
