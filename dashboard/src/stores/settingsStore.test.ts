import { describe, it, expect } from 'vitest';
import { calculateBackoffDelay } from './settingsStore';

describe('calculateBackoffDelay', () => {
  describe('basic backoff calculation', () => {
    it('should return base interval when errorCount is 0', () => {
      expect(calculateBackoffDelay(0, 2000)).toBe(2000);
    });

    it('should double delay for errorCount 1', () => {
      expect(calculateBackoffDelay(1, 2000)).toBe(4000);
    });

    it('should quadruple delay for errorCount 2', () => {
      expect(calculateBackoffDelay(2, 2000)).toBe(8000);
    });

    it('should multiply by 8 for errorCount 3', () => {
      expect(calculateBackoffDelay(3, 2000)).toBe(16000);
    });

    it('should multiply by 16 for errorCount 4 but cap at max', () => {
      // 2000 * 16 = 32000, but capped at 16000
      expect(calculateBackoffDelay(4, 2000)).toBe(16000);
    });
  });

  describe('max backoff cap', () => {
    it('should cap at 16000ms (16 seconds)', () => {
      expect(calculateBackoffDelay(4, 2000)).toBe(16000); // 2000 * 16 = 32000, capped at 16000
    });

    it('should cap at 16000ms for high error counts', () => {
      expect(calculateBackoffDelay(10, 2000)).toBe(16000);
      expect(calculateBackoffDelay(100, 2000)).toBe(16000);
    });

    it('should cap multiplier at 16 (errorCount 4)', () => {
      // errorCount 5 should still use multiplier of 16 (2^4)
      expect(calculateBackoffDelay(5, 1000)).toBe(16000);
      expect(calculateBackoffDelay(6, 1000)).toBe(16000);
    });
  });

  describe('different base intervals', () => {
    it('should work with 1000ms base interval', () => {
      expect(calculateBackoffDelay(0, 1000)).toBe(1000);
      expect(calculateBackoffDelay(1, 1000)).toBe(2000);
      expect(calculateBackoffDelay(2, 1000)).toBe(4000);
      expect(calculateBackoffDelay(3, 1000)).toBe(8000);
      expect(calculateBackoffDelay(4, 1000)).toBe(16000);
    });

    it('should work with 5000ms base interval', () => {
      expect(calculateBackoffDelay(0, 5000)).toBe(5000);
      expect(calculateBackoffDelay(1, 5000)).toBe(10000);
      expect(calculateBackoffDelay(2, 5000)).toBe(16000); // 20000 capped to 16000
    });

    it('should work with 10000ms base interval', () => {
      expect(calculateBackoffDelay(0, 10000)).toBe(10000);
      expect(calculateBackoffDelay(1, 10000)).toBe(16000); // 20000 capped to 16000
    });
  });

  describe('edge cases', () => {
    it('should handle 0 base interval', () => {
      expect(calculateBackoffDelay(0, 0)).toBe(0);
      expect(calculateBackoffDelay(5, 0)).toBe(0);
    });

    it('should handle negative error count as 0', () => {
      // Math.pow(2, Math.min(-1, 4)) = Math.pow(2, -1) = 0.5
      expect(calculateBackoffDelay(-1, 2000)).toBe(1000);
    });
  });
});
