import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AddressAllocator } from '../address-allocator.js';
import { NetworkManifest } from '@aegispay/chain-sdk';

describe('Address Allocator Concurrency & Uniqueness Tests', () => {
  const networks: NetworkManifest[] = [
    {
      id: 'tron-nile',
      name: 'TRON Nile Testnet',
      family: 'tron',
      chainId: '201910292',
      environment: 'testnet',
      nativeAssetSymbol: 'TRX',
      confirmationDepth: 19,
      isPaused: false,
      isEnabled: true
    },
    {
      id: 'ethereum-sepolia',
      name: 'Ethereum Sepolia Testnet',
      family: 'evm',
      chainId: '11155111',
      environment: 'testnet',
      nativeAssetSymbol: 'ETH',
      confirmationDepth: 12,
      isPaused: false,
      isEnabled: true
    }
  ];

  let allocator: AddressAllocator;

  beforeEach(() => {
    allocator = new AddressAllocator(networks);
  });

  it('should allocate unique monotonic derivation addresses for 50 distinct users', async () => {
    const allocatedIndices = new Set<number>();
    const allocatedAddresses = new Set<string>();

    for (let i = 1; i <= 50; i++) {
      const addr = await allocator.ensureAddress(`usr_${i}`, 'tron-nile');
      assert.equal(allocatedIndices.has(addr.derivationIndex), false);
      assert.equal(allocatedAddresses.has(addr.normalizedAddress), false);

      allocatedIndices.add(addr.derivationIndex);
      allocatedAddresses.add(addr.normalizedAddress);
      assert.equal(addr.derivationIndex, i);
    }

    assert.equal(allocatedIndices.size, 50);
  });

  it('should be idempotent: calling ensureAddress multiple times for the same user returns the same address', async () => {
    const first = await allocator.ensureAddress('usr_repeat', 'ethereum-sepolia');
    const second = await allocator.ensureAddress('usr_repeat', 'ethereum-sepolia');

    assert.equal(first.derivationIndex, second.derivationIndex);
    assert.equal(first.address, second.address);
    assert.equal(first.normalizedAddress, second.normalizedAddress);
  });
});
