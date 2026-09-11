/** Formats a number as Indian Rupees using the en-IN locale grouping (e.g. ₹1,50,000). */
export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formats a 0-1 ratio as a percentage string, e.g. 0.417 -> "41.7%". */
export function formatPercent(ratio: number, decimals = 1): string {
  if (!Number.isFinite(ratio)) return "0%";
  return `${(ratio * 100).toFixed(decimals)}%`;
}

/** Formats a leverage multiple, e.g. 5 -> "5x". */
export function formatLeverage(leverage: number): string {
  return `${leverage}x`;
}

export function formatScore(score: number): string {
  return `${Math.round(score)}`;
}

export function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
