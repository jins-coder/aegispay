import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createPublicApiServer } from '../app.js';

describe('Public API Integration Tests', () => {
  const { server } = createPublicApiServer();
  let baseUrl = '';

  before((_, done) => {
    server.listen(0, () => {
      const addr = server.address();
      if (typeof addr === 'object' && addr !== null) {
        baseUrl = `http://localhost:${addr.port}`;
      }
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  it('should fetch user account and compliance status', async () => {
    const res = await fetch(`${baseUrl}/v1/account`, {
      headers: { 'x-user-id': 'usr_test_01' }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.id, 'usr_test_01');
  });

  it('should allocate deposit address for TRON Nile testnet', async () => {
    const res = await fetch(`${baseUrl}/v1/deposit-addresses/ensure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_test_01' },
      body: JSON.stringify({ networkId: 'tron-nile' })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.networkId, 'tron-nile');
    assert.match(json.address, /^T[1-9A-HJ-NP-Za-km-z]{33}$/);
  });

  it('should simulate a 10.000000 USDT deposit, verify Funding Balance, and transfer to Trading Balance', async () => {
    // 1. Simulate Deposit
    const simRes = await fetch(`${baseUrl}/v1/deposits/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_test_01' },
      body: JSON.stringify({ networkId: 'tron-nile', assetId: 'usdt', amountDecimal: '10.000000' })
    });
    assert.equal(simRes.status, 200);

    // 2. Query Balances -> Funding should be 10.000000, Trading should be 0
    const balRes1 = await fetch(`${baseUrl}/v1/balances`, {
      headers: { 'x-user-id': 'usr_test_01' }
    });
    const balances1 = await balRes1.json();
    const usdtBal1 = balances1.find((b: any) => b.assetId === 'usdt');
    assert.equal(usdtBal1.fundingDecimal, '10.000000');
    assert.equal(usdtBal1.tradingDecimal, '0.000000');

    // 3. Internal Transfer 10.000000 from FUNDING to TRADING
    const xferRes = await fetch(`${baseUrl}/v1/internal-transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_test_01' },
      body: JSON.stringify({
        fromAccountType: 'FUNDING',
        toAccountType: 'TRADING',
        assetId: 'usdt',
        amountDecimal: '10.000000',
        idempotencyKey: 'idem_xfer_test_01'
      })
    });
    assert.equal(xferRes.status, 200);

    // 4. Query Balances -> Funding should now be 0.000000, Trading should be 10.000000
    const balRes2 = await fetch(`${baseUrl}/v1/balances`, {
      headers: { 'x-user-id': 'usr_test_01' }
    });
    const balances2 = await balRes2.json();
    const usdtBal2 = balances2.find((b: any) => b.assetId === 'usdt');
    assert.equal(usdtBal2.fundingDecimal, '0.000000');
    assert.equal(usdtBal2.tradingDecimal, '10.000000');
  });
});
