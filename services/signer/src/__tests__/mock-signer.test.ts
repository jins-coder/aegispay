import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MockSignerService } from '../mock-signer.js';

describe('Mock Signer Isolation & Guardrail Tests', () => {
  const signer = new MockSignerService({ isMainnetEnabled: false });

  it('should sign approved testnet intents accurately', async () => {
    const signed = await signer.signApprovedIntent(
      {
        intentId: 'intent_test_01',
        networkId: 'tron-nile',
        assetNetworkId: 'mock-usdt-nile',
        sourceAddress: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
        destinationAddress: 'TAUN6FwrnwwmaEqYcckffC7wYmbaS6cBiX',
        amountAtomic: '10000000'
      },
      {
        intentId: 'intent_test_01',
        networkId: 'tron-nile',
        rawPayload: '{"data":"mock"}'
      }
    );

    assert.equal(signed.intentId, 'intent_test_01');
    assert.match(signed.txHash, /^0x[a-f0-9]{64}$/);
  });

  it('should strictly throw and refuse to sign if network is mainnet', async () => {
    await assert.rejects(
      async () => {
        await signer.signApprovedIntent(
          {
            intentId: 'intent_mainnet_fail',
            networkId: 'ethereum-mainnet',
            assetNetworkId: 'usdt-mainnet',
            sourceAddress: '0x1111111111111111111111111111111111111111',
            destinationAddress: '0x2222222222222222222222222222222222222222',
            amountAtomic: '10000000'
          },
          {
            intentId: 'intent_mainnet_fail',
            networkId: 'ethereum-mainnet',
            rawPayload: '{}'
          }
        );
      },
      /MockSignerService is blocked from signing mainnet transactions/
    );
  });
});
