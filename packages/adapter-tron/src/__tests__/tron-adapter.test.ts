import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TronChainAdapter } from '../tron-adapter.js';
import { NetworkManifest } from '@aegispay/chain-sdk';

describe('TRON Adapter Conformance Tests', () => {
  const manifest: NetworkManifest = {
    id: 'tron-nile',
    name: 'TRON Nile Testnet',
    family: 'tron',
    chainId: '201910292',
    environment: 'testnet',
    nativeAssetSymbol: 'TRX',
    confirmationDepth: 19,
    isPaused: false,
    isEnabled: true
  };

  const adapter = new TronChainAdapter(manifest);

  it('should validate and normalize TRON addresses', () => {
    const base58 = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
    assert.equal(adapter.validateAddress(base58), true);
    assert.equal(adapter.normalizeAddress(base58), base58);
  });

  it('should derive deterministic watch-only test addresses for TRON', async () => {
    const addr1 = await adapter.deriveWatchAddress({ networkId: manifest.id, derivationIndex: 1 });
    const addr2 = await adapter.deriveWatchAddress({ networkId: manifest.id, derivationIndex: 2 });
    const addr1Repeat = await adapter.deriveWatchAddress({ networkId: manifest.id, derivationIndex: 1 });

    assert.equal(addr1.derivationIndex, 1);
    assert.equal(addr1.address, addr1Repeat.address);
    assert.notEqual(addr1.address, addr2.address);
    assert.match(addr1.address, /^T[1-9A-HJ-NP-Za-km-z]{33}$/);
    assert.match(addr1.normalizedAddress, /^41[a-f0-9]{40}$/);
  });

  it('should build unsigned TRC-20 transfer payloads with fee_limit', async () => {
    const unsigned = await adapter.buildUnsignedTransfer({
      intentId: 'int_tron_001',
      networkId: manifest.id,
      assetNetworkId: 'mock-usdt-nile',
      sourceAddress: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
      destinationAddress: 'TAUN6FwrnwwmaEqYcckffC7wYmbaS6cBiX',
      amountAtomic: '10000000', // 10.000000 mock USDT
      feeLimitAtomic: '100000000'
    });

    assert.equal(unsigned.intentId, 'int_tron_001');
    assert.match(unsigned.rawPayload, /10000000/);
    assert.match(unsigned.rawPayload, /fee_limit/);
  });
});
