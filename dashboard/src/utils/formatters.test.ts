import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCompactNumber } from './formatters';

describe('formatCurrency', () => {
  describe('basic formatting', () => {
    it('should format whole numbers with 2 decimal places', () => {
      expect(formatCurrency(100)).toBe('$100.00');
    });

    it('should format decimal numbers', () => {
      expect(formatCurrency(99.99)).toBe('$99.99');
    });

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(99.999)).toBe('$100.00');
      expect(formatCurrency(99.994)).toBe('$99.99');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('large numbers', () => {
    it('should format thousands with commas', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format millions', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should format very large numbers', () => {
      expect(formatCurrency(123456789.12)).toBe('$123,456,789.12');
    });
  });

  describe('small numbers', () => {
    it('should format cents', () => {
      expect(formatCurrency(0.01)).toBe('$0.01');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    it('should format small decimals', () => {
      expect(formatCurrency(0.001)).toBe('$0.00');
      expect(formatCurrency(0.005)).toBe('$0.01'); // rounds up
    });
  });

  describe('negative numbers', () => {
    it('should format negative values', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });
  });

  describe('edge cases', () => {
    it('should handle very small positive numbers', () => {
      expect(formatCurrency(0.004)).toBe('$0.00');
    });

    it('should handle Number.MAX_SAFE_INTEGER', () => {
      const result = formatCurrency(Number.MAX_SAFE_INTEGER);
      expect(result).toContain('$');
      expect(result).toContain(',');
    });
  });
});

describe('formatCompactNumber', () => {
  describe('small numbers (no suffix)', () => {
    it('should format numbers under 1000 without suffix', () => {
      expect(formatCompactNumber(0)).toBe('0');
      expect(formatCompactNumber(1)).toBe('1');
      expect(formatCompactNumber(100)).toBe('100');
      expect(formatCompactNumber(999)).toBe('999');
    });
  });

  describe('thousands (K suffix)', () => {
    it('should format thousands with K suffix', () => {
      expect(formatCompactNumber(1000)).toBe('1K');
      expect(formatCompactNumber(1500)).toBe('1.5K');
      expect(formatCompactNumber(2000)).toBe('2K');
    });

    it('should round to 1 decimal place', () => {
      expect(formatCompactNumber(1234)).toBe('1.2K');
      expect(formatCompactNumber(1250)).toBe('1.3K'); // rounds up
      expect(formatCompactNumber(9999)).toBe('10K');
    });

    it('should format tens of thousands', () => {
      expect(formatCompactNumber(10000)).toBe('10K');
      expect(formatCompactNumber(15000)).toBe('15K');
      expect(formatCompactNumber(99999)).toBe('100K');
    });

    it('should format hundreds of thousands', () => {
      expect(formatCompactNumber(100000)).toBe('100K');
      expect(formatCompactNumber(500000)).toBe('500K');
      expect(formatCompactNumber(999999)).toBe('1M');
    });
  });

  describe('millions (M suffix)', () => {
    it('should format millions with M suffix', () => {
      expect(formatCompactNumber(1000000)).toBe('1M');
      expect(formatCompactNumber(1500000)).toBe('1.5M');
      expect(formatCompactNumber(2000000)).toBe('2M');
    });

    it('should format tens of millions', () => {
      expect(formatCompactNumber(10000000)).toBe('10M');
      expect(formatCompactNumber(50000000)).toBe('50M');
    });

    it('should format hundreds of millions', () => {
      expect(formatCompactNumber(100000000)).toBe('100M');
      expect(formatCompactNumber(999000000)).toBe('999M');
    });
  });

  describe('billions (B suffix)', () => {
    it('should format billions with B suffix', () => {
      expect(formatCompactNumber(1000000000)).toBe('1B');
      expect(formatCompactNumber(1500000000)).toBe('1.5B');
    });
  });

  describe('decimal inputs', () => {
    it('should handle decimal numbers', () => {
      expect(formatCompactNumber(1234.56)).toBe('1.2K');
      expect(formatCompactNumber(999.99)).toBe('1K');
    });
  });

  describe('negative numbers', () => {
    it('should format negative thousands', () => {
      expect(formatCompactNumber(-1000)).toBe('-1K');
      expect(formatCompactNumber(-1500)).toBe('-1.5K');
    });

    it('should format negative millions', () => {
      expect(formatCompactNumber(-1000000)).toBe('-1M');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(formatCompactNumber(0)).toBe('0');
    });

    it('should handle very large numbers', () => {
      expect(formatCompactNumber(1000000000000)).toBe('1T');
    });
  });
});
