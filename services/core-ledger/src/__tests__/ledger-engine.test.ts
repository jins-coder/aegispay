import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LedgerEngine } from '../ledger-engine.js';

describe('LedgerEngine Invariant Tests', () => {
  let ledger: LedgerEngine;

  beforeEach(() => {
    ledger = new LedgerEngine();
  });

  it('should post a valid balanced deposit credit journal', async () => {
    const tx = await ledger.postTransaction({
      id: 'tx_dep_01',
      description: 'Credit confirmed TRON Nile deposit',
      referenceType: 'DEPOSIT',
      referenceId: 'dep_001',
      idempotencyKey: 'idem_dep_001',
      entries: [
        {
          id: 'ent_01',
          accountId: 'asset:onchain:deposit:tron-nile:mock-usdt',
          direction: 'DEBIT',
          amountAtomic: '10000000', // 10.000000 mock USDT
          assetId: 'usdt'
        },
        {
          id: 'ent_02',
          accountId: 'liability:user:usr_1:funding:usdt',
          direction: 'CREDIT',
          amountAtomic: '10000000',
          assetId: 'usdt'
        }
      ]
    });

    assert.equal(tx.id, 'tx_dep_01');
    const balance = ledger.getUserBalance('usr_1', 'usdt');
    assert.equal(balance.fundingAtomic, '10000000');
    assert.equal(balance.tradingAtomic, '0');
  });

  it('should strictly reject unbalanced journals (Debits != Credits)', async () => {
    await assert.rejects(
      async () => {
        await ledger.postTransaction({
          id: 'tx_unbalanced',
          description: 'Unbalanced journal',
          referenceType: 'DEPOSIT',
          referenceId: 'dep_unbal',
          idempotencyKey: 'idem_unbal',
          entries: [
            {
              id: 'ent_01',
              accountId: 'asset:onchain:deposit:tron-nile:mock-usdt',
              direction: 'DEBIT',
              amountAtomic: '10000000',
              assetId: 'usdt'
            },
            {
              id: 'ent_02',
              accountId: 'liability:user:usr_1:funding:usdt',
              direction: 'CREDIT',
              amountAtomic: '9000000', // 1 unit missing!
              assetId: 'usdt'
            }
          ]
        });
      },
      /Unbalanced journal/
    );
  });

  it('should enforce idempotency: 100 replays of the same idempotency key produces exactly 1 credit', async () => {
    for (let i = 0; i < 100; i++) {
      await ledger.postTransaction({
        id: 'tx_dep_replay',
        description: 'Replayed deposit',
        referenceType: 'DEPOSIT',
        referenceId: 'dep_replay_001',
        idempotencyKey: 'idem_replay_constant_key',
        entries: [
          {
            id: `ent_01_${i}`,
            accountId: 'asset:onchain:deposit:tron-nile:mock-usdt',
            direction: 'DEBIT',
            amountAtomic: '10000000',
            assetId: 'usdt'
          },
          {
            id: `ent_02_${i}`,
            accountId: 'liability:user:usr_replay:funding:usdt',
            direction: 'CREDIT',
            amountAtomic: '10000000',
            assetId: 'usdt'
          }
        ]
      });
    }

    const balance = ledger.getUserBalance('usr_replay', 'usdt');
    assert.equal(balance.fundingAtomic, '10000000'); // Exactly 1 credit!
  });

  it('should perform funding-to-trading transfer and maintain exact liabilities', async () => {
    // 1. Initial Deposit Credit
    await ledger.postTransaction({
      id: 'tx_initial',
      description: 'Initial deposit',
      referenceType: 'DEPOSIT',
      referenceId: 'dep_init',
      idempotencyKey: 'idem_dep_init',
      entries: [
        {
          id: 'e1',
          accountId: 'asset:onchain:deposit:tron-nile:mock-usdt',
          direction: 'DEBIT',
          amountAtomic: '10000000',
          assetId: 'usdt'
        },
        {
          id: 'e2',
          accountId: 'liability:user:usr_trader:funding:usdt',
          direction: 'CREDIT',
          amountAtomic: '10000000',
          assetId: 'usdt'
        }
      ]
    });

    // 2. Transfer 10.000000 from Funding to Trading
    await ledger.postTransaction({
      id: 'tx_transfer',
      description: 'Transfer Funding to Trading',
      referenceType: 'INTERNAL_TRANSFER',
      referenceId: 'xfer_001',
      idempotencyKey: 'idem_xfer_001',
      entries: [
        {
          id: 'e3',
          accountId: 'liability:user:usr_trader:funding:usdt',
          direction: 'DEBIT',
          amountAtomic: '10000000',
          assetId: 'usdt'
        },
        {
          id: 'e4',
          accountId: 'liability:user:usr_trader:trading:usdt',
          direction: 'CREDIT',
          amountAtomic: '10000000',
          assetId: 'usdt'
        }
      ]
    });

    const balance = ledger.getUserBalance('usr_trader', 'usdt');
    assert.equal(balance.fundingAtomic, '0');
    assert.equal(balance.tradingAtomic, '10000000');

    // 3. Treasury Sweep: Deposit address -> Cold Vault (Leaves user liabilities untouched)
    await ledger.postTransaction({
      id: 'tx_sweep',
      description: 'Sweep to cold vault',
      referenceType: 'SWEEP',
      referenceId: 'swp_001',
      idempotencyKey: 'idem_swp_001',
      entries: [
        {
          id: 'e5',
          accountId: 'asset:onchain:cold:tron-nile:mock-usdt',
          direction: 'DEBIT',
          amountAtomic: '10000000',
          assetId: 'usdt'
        },
        {
          id: 'e6',
          accountId: 'asset:onchain:deposit:tron-nile:mock-usdt',
          direction: 'CREDIT',
          amountAtomic: '10000000',
          assetId: 'usdt'
        }
      ]
    });

    // User Trading Balance must STILL be exactly 10_000_000
    const finalBalance = ledger.getUserBalance('usr_trader', 'usdt');
    assert.equal(finalBalance.fundingAtomic, '0');
    assert.equal(finalBalance.tradingAtomic, '10000000');
  });
});
