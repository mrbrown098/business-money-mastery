import { describe, it, expect } from 'vitest';
import { majorToMinor, minorToMajor, formatMoney, sumMoney, getCurrencyFactor } from '../utils/money';

describe('Money Utilities', () => {
  it('correctly calculates factor based on currency', () => {
    expect(getCurrencyFactor('PKR')).toBe(100);
    expect(getCurrencyFactor('USD')).toBe(100);
    expect(getCurrencyFactor('JPY')).toBe(1);
  });

  it('converts major floating units to minor integer units accurately', () => {
    expect(majorToMinor(123.45, 'PKR')).toBe(12345);
    expect(majorToMinor('99.99', 'PKR')).toBe(9999);
    expect(majorToMinor(0.1 + 0.2, 'PKR')).toBe(30); // Handled float inaccuracy
    expect(majorToMinor(500, 'JPY')).toBe(500);
  });

  it('converts minor integer units to major units', () => {
    expect(minorToMajor(12345, 'PKR')).toBe(123.45);
    expect(minorToMajor(500, 'JPY')).toBe(500);
  });

  it('formats minor amounts to localized string', () => {
    const formattedPKR = formatMoney(12345, 'PKR');
    expect(formattedPKR).toContain('123.45');

    const formattedUSD = formatMoney(5000, 'USD', 'en-US');
    expect(formattedUSD).toContain('50.00');
  });

  it('sums minor unit values safely', () => {
    expect(sumMoney([1000, 2500, 350])).toBe(3850);
    expect(sumMoney([])).toBe(0);
  });
});
