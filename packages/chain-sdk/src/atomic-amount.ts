import { AtomicAmount } from './types.js';

/**
 * Converts a decimal user input string (e.g. "10.000000", "0.5") to exact atomic integer string.
 * Strictly throws if the decimal string contains excess precision beyond the allowed decimals.
 * Rejects negative values, scientific notation, and invalid characters.
 */
export function decimalToAtomic(decimalStr: string, decimals: number): AtomicAmount {
  if (typeof decimalStr !== 'string') {
    throw new Error('Decimal amount must be a string');
  }

  const trimmed = decimalStr.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Invalid decimal amount format: "${decimalStr}"`);
  }

  const [integerPart, fractionalPart = ''] = trimmed.split('.');

  if (fractionalPart.length > decimals) {
    throw new Error(
      `Excess decimal precision: received ${fractionalPart.length} decimal places, max allowed is ${decimals}`
    );
  }

  const paddedFractional = fractionalPart.padEnd(decimals, '0');
  const combinedStr = integerPart + paddedFractional;
  const atomicValue = BigInt(combinedStr);

  return atomicValue.toString();
}

/**
 * Formats an atomic integer amount string to human-readable fixed decimal format.
 */
export function atomicToDecimal(atomicStr: AtomicAmount, decimals: number): string {
  if (!/^\d+$/.test(atomicStr)) {
    throw new Error(`Invalid atomic amount string: "${atomicStr}"`);
  }

  const atomicVal = BigInt(atomicStr);
  const baseStr = atomicVal.toString().padStart(decimals + 1, '0');

  const integerPart = baseStr.slice(0, baseStr.length - decimals);
  const fractionalPart = baseStr.slice(baseStr.length - decimals);

  if (decimals === 0) {
    return integerPart;
  }

  return `${integerPart}.${fractionalPart}`;
}

/**
 * Validates whether an atomic amount is strictly positive (> 0)
 */
export function isPositiveAtomic(atomicStr: AtomicAmount): boolean {
  try {
    const val = BigInt(atomicStr);
    return val > 0n;
  } catch {
    return false;
  }
}
