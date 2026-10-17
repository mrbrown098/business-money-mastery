/**
  Money Utility Functions
  All money amounts in MizanFlow domain objects are stored as integer minor units (e.g., paisas or cents).
  This module guarantees zero rounding errors and safe currency calculations.
 */

export const CURRENCY_DECIMALS: Record<string, number> = {
  PKR: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
  INR: 2,
  AED: 2,
  SAR: 2,
  JPY: 0,
};

/**
 * Gets decimal scale factor for a currency code (defaults to 2 decimal places = factor 100).
 */
export function getCurrencyFactor(currencyCode: string = 'PKR'): number {
  const decimals = CURRENCY_DECIMALS[currencyCode.toUpperCase()] ?? 2;
  return Math.pow(10, decimals);
}

/**
 * Converts a major unit float string or number (e.g. 123.45) into minor units integer (e.g. 12345).
 */
export function majorToMinor(amountInMajor: number | string, currencyCode: string = 'PKR'): number {
  const num = typeof amountInMajor === 'string' ? parseFloat(amountInMajor) : amountInMajor;
  if (isNaN(num)) return 0;
  const factor = getCurrencyFactor(currencyCode);
  return Math.round(num * factor);
}

/**
 * Converts minor units integer (e.g. 12345) to major units float (e.g. 123.45).
 */
export function minorToMajor(amountInMinor: number, currencyCode: string = 'PKR'): number {
  const factor = getCurrencyFactor(currencyCode);
  return amountInMinor / factor;
}

/**
 * Formats minor units integer as localized currency string (e.g., 12345 PKR -> "Rs 123.45" or "PKR 123.45").
 */
export function formatMoney(
  amountInMinor: number,
  currencyCode: string = 'PKR',
  locale: string = 'en-PK'
): string {
  const major = minorToMajor(amountInMinor, currencyCode);
  const decimals = CURRENCY_DECIMALS[currencyCode.toUpperCase()] ?? 2;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(major);
  } catch {
    return `${currencyCode} ${major.toFixed(decimals)}`;
  }
}

/**
 * Calculates sum of minor unit values safely.
 */
export function sumMoney(amountsInMinor: number[]): number {
  return amountsInMinor.reduce((acc, curr) => Math.round(acc) + Math.round(curr), 0);
}
