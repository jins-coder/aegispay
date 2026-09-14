import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decimalToAtomic, atomicToDecimal, isPositiveAtomic } from '../atomic-amount.js';

describe('AtomicAmount Utility Tests', () => {
  it('should correctly convert 10.000000 with 6 decimals to 10000000', () => {
    const result = decimalToAtomic('10.000000', 6);
    assert.equal(result, '10000000');
  });

  it('should correctly convert 0.5 with 6 decimals to 500000', () => {
    const result = decimalToAtomic('0.5', 6);
    assert.equal(result, '500000');
  });

  it('should correctly convert 1.25 with 18 decimals (EVM standard)', () => {
    const result = decimalToAtomic('1.25', 18);
    assert.equal(result, '1250000000000000000');
  });

  it('should strictly reject excess decimal precision (e.g. 10.0000001 with 6 decimals)', () => {
    assert.throws(
      () => decimalToAtomic('10.0000001', 6),
      /Excess decimal precision/
    );
  });

  it('should format atomic string back to decimal string', () => {
    const formatted = atomicToDecimal('10000000', 6);
    assert.equal(formatted, '10.000000');
  });

  it('should accurately test positive atomic values', () => {
    assert.equal(isPositiveAtomic('10000000'), true);
    assert.equal(isPositiveAtomic('0'), false);
  });
});
