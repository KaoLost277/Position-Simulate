// Display formatting helpers. No React, no DOM.

// Group thousands without the 32-bit truncation of bitwise tricks, and never
// emit NaN/Infinity.
export function formatNumber(value, maximumFractionDigits = 2) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

// Percent values are shown as whole numbers by default.
export function formatPercent(fraction, maximumFractionDigits = 0) {
  if (typeof fraction !== "number" || !Number.isFinite(fraction)) return "—";
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(fraction * 100)}%`;
}
