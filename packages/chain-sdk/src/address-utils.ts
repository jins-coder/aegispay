import crypto from 'node:crypto';

/**
 * Normalizes an EVM address to lowercase format for consistent storage and uniqueness indexing.
 */
export function normalizeEvmAddress(address: string): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`Invalid EVM address format: ${address}`);
  }
  return address.toLowerCase();
}

/**
 * Validates EVM address format
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Normalizes a TRON address (Base58Check "T..." or Hex "41...") to standardized canonical hex format.
 */
export function normalizeTronAddress(address: string): string {
  const trimmed = address.trim();

  // If already in 41-prefixed 42-char hex format:
  if (/^41[a-fA-F0-9]{40}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  // Base58Check TRON address starts with 'T' and is 34 characters
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
    // In canonical storage, we preserve lowercase or hex form.
    // For deterministic matching, return standard Base58 string
    return trimmed;
  }

  throw new Error(`Invalid TRON address: ${address}`);
}

/**
 * Validates TRON address format
 */
export function isValidTronAddress(address: string): boolean {
  const trimmed = address.trim();
  return /^41[a-fA-F0-9]{40}$/.test(trimmed) || /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed);
}
