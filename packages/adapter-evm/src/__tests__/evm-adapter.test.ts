import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EvmChainAdapter } from '../evm-adapter.js';
import { NetworkManifest } from '@aegispay/chain-sdk';

describe('EVM Adapter Conformance Tests', () => {
  const manifest: NetworkManifest = {
    id: 'ethereum-sepolia',
    name: 'Ethereum Sepolia Testnet',
    family: 'evm',
    chainId: '11155111',
    environment: 'testnet',
    nativeAssetSymbol: 'ETH',
    confirmationDepth: 12,
    isPaused: false,
    isEnabled: true
  };

  const adapter = new EvmChainAdapter(manifest);

  it('should validate and normalize EVM addresses', () => {
    const raw = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    assert.equal(adapter.validateAddress(raw), true);
    assert.equal(adapter.normalizeAddress(raw), '0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
  });

  it('should derive deterministic watch-only test addresses for derivation indices', async () => {
    const addr1 = await adapter.deriveWatchAddress({ networkId: manifest.id, derivationIndex: 1 });
    const addr2 = await adapter.deriveWatchAddress({ networkId: manifest.id, derivationIndex: 2 });
    const addr1Repeat = await adapter.deriveWatchAddress({ networkId: manifest.id, derivationIndex: 1 });

    assert.equal(addr1.derivationIndex, 1);
    assert.equal(addr1.address, addr1Repeat.address);
    assert.notEqual(addr1.address, addr2.address);
    assert.equal(adapter.validateAddress(addr1.address), true);
  });

  it('should build and return unsigned transfer payloads', async () => {
    const unsigned = await adapter.buildUnsignedTransfer({
      intentId: 'int_001',
      networkId: manifest.id,
      assetNetworkId: 'eth-sepolia-native',
      sourceAddress: '0x1111111111111111111111111111111111111111',
      destinationAddress: '0x2222222222222222222222222222222222222222',
      amountAtomic: '1000000000000000000'
    });

    assert.equal(unsigned.intentId, 'int_001');
    assert.match(unsigned.rawPayload, /11155111/);
  });
});
