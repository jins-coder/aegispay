import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEvmAddress, isValidEvmAddress, normalizeTronAddress, isValidTronAddress } from '../address-utils.js';

describe('Address Normalization Tests', () => {
  it('should normalize EVM addresses to lowercase', () => {
    const raw = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const normalized = normalizeEvmAddress(raw);
    assert.equal(normalized, '0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
    assert.equal(isValidEvmAddress(raw), true);
  });

  it('should reject malformed EVM addresses', () => {
    assert.equal(isValidEvmAddress('0x123'), false);
    assert.throws(() => normalizeEvmAddress('0xInvalidHexAddress'), /Invalid EVM address/);
  });

  it('should validate and handle TRON Base58Check and Hex addresses', () => {
    const base58 = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
    const hex = '41f1737e6f80ca02b66236b2adbb082b24e4c27a2c';

    assert.equal(isValidTronAddress(base58), true);
    assert.equal(isValidTronAddress(hex), true);
    assert.equal(normalizeTronAddress(hex), hex.toLowerCase());
  });
});
