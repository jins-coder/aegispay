import React, { useEffect } from 'react';
import {
  createStore,
  useStore,
  signal,
  SignalValue,
  Scoped,
  For,
  Show,
  DevTools
} from 'ureact';
import { renderQRCodeSvg } from './qrcode';

const API_BASE = 'http://localhost:3000';

// 1. Reactive uReact Store for AegisPay Gateway
export const gatewayStore = createStore({
  selectedAsset: 'usdt',
  selectedNetwork: 'tron-nile',
  currentAddress: '',
  fundingUsdt: '0.000000',
  tradingUsdt: '0.000000',
  fundingUsdc: '0.000000',
  transactions: [] as any[],
  isTransferModalOpen: false,
  transferAmount: '10.000000',
  activeTab: 'deposit' as 'deposit' | 'history' | 'security',
  timelineStep: 1,
  isSimulating: false,

  setAsset(asset: string) {
    this.selectedAsset = asset;
  },
  setNetwork(net: string) {
    this.selectedNetwork = net;
  },
  openTransfer() {
    this.isTransferModalOpen = true;
  },
  closeTransfer() {
    this.isTransferModalOpen = false;
  },
  setTab(tab: 'deposit' | 'history' | 'security') {
    this.activeTab = tab;
  }
});

// Fine-grained Signal for real-time live polling counter
export const liveTickSignal = signal(0);

export default function CustomerPortalApp() {
  const store = useStore(gatewayStore);

  const fetchLiveState = async () => {
    try {
      // 1. Balances
      const balRes = await fetch(`${API_BASE}/v1/balances`);
      if (balRes.ok) {
        const balances = await balRes.json();
        const usdt = balances.find((b: any) => b.assetId === 'usdt');
        const usdc = balances.find((b: any) => b.assetId === 'usdc');
        if (usdt) {
          store.fundingUsdt = usdt.fundingDecimal;
          store.tradingUsdt = usdt.tradingDecimal;
        }
        if (usdc) {
          store.fundingUsdc = usdc.fundingDecimal;
        }
      }

      // 2. Deposit Address
      const addrRes = await fetch(`${API_BASE}/v1/deposit-addresses/ensure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ networkId: store.selectedNetwork })
      });
      if (addrRes.ok) {
        const addrJson = await addrRes.json();
        store.currentAddress = addrJson.address;
      }

      // 3. Transactions
      const txRes = await fetch(`${API_BASE}/v1/transactions`);
      if (txRes.ok) {
        store.transactions = await txRes.json();
      }

      liveTickSignal.value++;
    } catch (err) {
      console.error('Failed to sync gateway state:', err);
    }
  };

  useEffect(() => {
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 4000);
    return () => clearInterval(interval);
  }, [store.selectedNetwork]);

  const handleSimulateDeposit = async () => {
    store.isSimulating = true;
    store.timelineStep = 2;

    try {
      const res = await fetch(`${API_BASE}/v1/deposits/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          networkId: store.selectedNetwork,
          assetId: store.selectedAsset,
          amountDecimal: '10.000000'
        })
      });

      if (res.ok) {
        store.timelineStep = 4;
        await fetchLiveState();
      }
    } finally {
      store.isSimulating = false;
    }
  };

  const handleTransferSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/internal-transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountType: 'FUNDING',
          toAccountType: 'TRADING',
          assetId: store.selectedAsset,
          amountDecimal: store.transferAmount,
          idempotencyKey: `idem_xfer_${Date.now()}`
        })
      });

      if (res.ok) {
        store.closeTransfer();
        await fetchLiveState();
      } else {
        const err = await res.json();
        alert(`Transfer Error: ${err.error}`);
      }
    } catch (err) {
      alert(`Transfer request failed: ${err}`);
    }
  };

  const timelineSteps = [
    { num: 1, title: '1. Watch-Only Address Allocated', desc: 'BIP-44 derived without online private key' },
    { num: 2, title: '2. Inbound Transfer Detected', desc: 'Mempool observation & receipt verification' },
    { num: 3, title: '3. Finality Policy Satisfied', desc: 'Solidification & zero reorg guarantee' },
    { num: 4, title: '4. Balanced Credit to Funding', desc: 'Immutable double-entry ledger journal posted' },
    { num: 5, title: '5. Treasury Sweep to Cold Vault', desc: 'Preserves user liabilities 1:1' }
  ];

  return (
    <Scoped css={`
      .portal-root {
        min-height: 100vh;
        background: #0a0e17;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 24px;
        box-sizing: border-box;
      }
      .container { max-width: 1200px; margin: 0 auto; }
      .header {
        display: flex; justify-content: space-between; align-items: center;
        padding-bottom: 24px; border-bottom: 1px solid #24344d; margin-bottom: 32px;
      }
      .logo-title { font-size: 22px; font-weight: 800; letter-spacing: 0.05em; color: #fff; }
      .badge-tag {
        background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid #f59e0b;
        font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; margin-left: 10px;
      }
      .user-pill {
        background: #111827; border: 1px solid #24344d; padding: 6px 14px; border-radius: 20px;
        font-size: 13px; display: flex; align-items: center; gap: 8px;
      }
      .dot-green { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
      .cards-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px;
      }
      .card {
        background: #111827; border: 1px solid #24344d; border-radius: 12px; padding: 24px;
      }
      .card-title { color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
      .card-val { font-size: 28px; font-weight: 700; font-family: monospace; }
      .card-sub { font-size: 12px; color: #64748b; margin-top: 6px; }
      .nav-tabs { display: flex; gap: 10px; border-bottom: 1px solid #24344d; padding-bottom: 12px; margin-bottom: 24px; }
      .tab-button {
        background: transparent; border: none; color: #94a3b8; font-weight: 600; font-size: 14px;
        padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s;
      }
      .tab-button.active { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid #3b82f6; }
      .layout-split { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      .form-field { margin-bottom: 18px; }
      .form-field label { display: block; font-size: 13px; color: #94a3b8; margin-bottom: 6px; }
      .form-select, .form-input {
        width: 100%; background: #182234; border: 1px solid #24344d; color: #fff; padding: 12px; border-radius: 8px; font-size: 14px; box-sizing: border-box;
      }
      .warning-box {
        background: rgba(245, 158, 11, 0.12); border: 1px solid #f59e0b; color: #fde68a;
        padding: 12px; border-radius: 8px; font-size: 12px; margin-bottom: 18px;
      }
      .address-panel {
        background: #182234; border: 1px dashed #334155; padding: 16px; border-radius: 8px; margin-bottom: 18px;
      }
      .btn-primary {
        background: #3b82f6; color: #fff; border: none; padding: 10px 18px; border-radius: 8px;
        font-weight: 600; cursor: pointer; font-size: 14px;
      }
      .btn-success {
        background: #10b981; color: #fff; border: none; padding: 12px 18px; border-radius: 8px;
        font-weight: 600; cursor: pointer; font-size: 14px; width: 100%;
      }
      .timeline-list { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
      .timeline-item { display: flex; align-items: flex-start; gap: 12px; font-size: 13px; color: #64748b; }
      .timeline-item.done { color: #10b981; }
      .timeline-item.active { color: #3b82f6; font-weight: 600; }
      .step-badge {
        width: 22px; height: 22px; border-radius: 50%; border: 2px solid currentColor;
        display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0;
      }
      table { width: 100%; border-collapse: collapse; }
      th { text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; padding: 10px; border-bottom: 1px solid #24344d; }
      td { padding: 12px 10px; font-size: 13px; border-bottom: 1px solid #24344d; font-family: monospace; }
      .modal-overlay {
        position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); display: flex; align-items: center; justify-content: center; z-index: 1000;
      }
      .modal-card {
        background: #111827; border: 1px solid #24344d; border-radius: 12px; padding: 24px; width: 100%; max-width: 440px;
      }
    `}>
      <div className="portal-root">
        <div className="container">
          {/* Header */}
          <header className="header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="logo-title">AEGISPAY ⚛️</span>
              <span className="badge-tag">uReact Reactive GUI</span>
            </div>
            <div className="user-pill">
              <span className="dot-green"></span>
              <span>trader@aegispay.internal</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>(KYC Tier 2)</span>
              <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '6px' }}>
                Syncs: <SignalValue value={liveTickSignal} />
              </span>
            </div>
          </header>

          {/* Cards Grid */}
          <div className="cards-grid">
            <div className="card">
              <div className="card-title">Funding Balance (USDT)</div>
              <div className="card-val" style={{ color: '#f8fafc' }}>{store.fundingUsdt}</div>
              <div className="card-sub">TRON Nile / Settled & Liquid</div>
            </div>
            <div className="card">
              <div className="card-title">Trading Balance (USDT)</div>
              <div className="card-val" style={{ color: '#10b981' }}>{store.tradingUsdt}</div>
              <div className="card-sub">Active Trading Engine Liability</div>
            </div>
            <div className="card">
              <div className="card-title">Funding Balance (USDC)</div>
              <div className="card-val" style={{ color: '#3b82f6' }}>{store.fundingUsdc}</div>
              <div className="card-sub">Ethereum Sepolia / ERC-20</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="nav-tabs">
            <button
              className={`tab-button ${store.activeTab === 'deposit' ? 'active' : ''}`}
              onClick={() => store.setTab('deposit')}
            >
              Deposit Crypto
            </button>
            <button className="tab-button" onClick={() => store.openTransfer()}>
              Transfer to Trading
            </button>
            <button
              className={`tab-button ${store.activeTab === 'history' ? 'active' : ''}`}
              onClick={() => store.setTab('history')}
            >
              Ledger History
            </button>
            <button
              className={`tab-button ${store.activeTab === 'security' ? 'active' : ''}`}
              onClick={() => store.setTab('security')}
            >
              Security Boundaries
            </button>
          </div>

          {/* Tab 1: Deposit Flow */}
          <Show when={store.activeTab === 'deposit'}>
            <div className="layout-split">
              {/* Left Panel */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Receive Cryptocurrency</h3>

                <div className="form-field">
                  <label>Select Asset</label>
                  <select
                    className="form-select"
                    value={store.selectedAsset}
                    onChange={(e) => store.setAsset(e.target.value)}
                  >
                    <option value="usdt">USDT · Tether USD</option>
                    <option value="usdc">USDC · USD Coin</option>
                    <option value="trx">TRX · TRON Native</option>
                    <option value="eth">ETH · Ethereum Native</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Select Network Rail</label>
                  <select
                    className="form-select"
                    value={store.selectedNetwork}
                    onChange={(e) => store.setNetwork(e.target.value)}
                  >
                    <option value="tron-nile">TRON (TRC-20) · Nile Testnet</option>
                    <option value="ethereum-sepolia">Ethereum (ERC-20) · Sepolia Testnet</option>
                    <option value="bsc-testnet">BNB Smart Chain (BEP-20) · Testnet</option>
                  </select>
                </div>

                <div className="warning-box">
                  <strong>WRONG-NETWORK SHIELD:</strong> Send only {store.selectedAsset.toUpperCase()} on {store.selectedNetwork}. Unallowlisted routes trigger risk holds.
                </div>

                <div className="address-panel">
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderQRCodeSvg(store.currentAddress || '0x000', 120)
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                        Your Watch-Only Deposit Address:
                      </label>
                      <div style={{ color: '#10b981', fontSize: '13px', wordBreak: 'break-all', marginBottom: '8px' }}>
                        {store.currentAddress || 'Generating watch-only address...'}
                      </div>
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => {
                          navigator.clipboard.writeText(store.currentAddress);
                          alert(`Copied address: ${store.currentAddress}`);
                        }}
                      >
                        Copy Address
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-success"
                  onClick={handleSimulateDeposit}
                  disabled={store.isSimulating}
                >
                  {store.isSimulating ? 'Processing Block Finality...' : '⚡ Simulate Confirmed Deposit (10.000000)'}
                </button>
              </div>

              {/* Right Panel: Timeline */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Multi-Stage Finality Timeline</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
                  Real-time blockchain solidification & ledger credit state:
                </p>

                <div className="timeline-list">
                  <For each={timelineSteps}>
                    {(step) => (
                      <div
                        key={step.num}
                        className={`timeline-item ${store.timelineStep >= step.num ? 'done' : ''}`}
                      >
                        <div className="step-badge">
                          {store.timelineStep >= step.num ? '✓' : step.num}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{step.title}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{step.desc}</div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </Show>

          {/* Tab 2: History */}
          <Show when={store.activeTab === 'history'}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Immutable Double-Entry Ledger Transactions</h3>
              <table>
                <thead>
                  <tr>
                    <th>Tx ID</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Idempotency Key</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={store.transactions} fallback={<tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No transactions recorded yet</td></tr>}>
                    {(t: any) => (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td><span className="badge-tag" style={{ color: '#3b82f6', borderColor: '#3b82f6' }}>{t.referenceType}</span></td>
                        <td>{t.description}</td>
                        <td style={{ fontSize: '11px', color: '#64748b' }}>{t.idempotencyKey}</td>
                        <td>{new Date(t.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>

          {/* Tab 3: Security */}
          <Show when={store.activeTab === 'security'}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Security & Signing Boundaries</h3>
              <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.8 }}>
                <p>• <strong>Watch-Only Public Key Derivation:</strong> The frontend and address services use BIP-44 xpub keys only. No private keys exist on web servers.</p>
                <p>• <strong>Double-Entry Accounting Invariant:</strong> Every journal strictly verifies Debits == Credits per economic asset.</p>
                <p>• <strong>Fail-Closed Gate:</strong> <code>MAINNET_ENABLED=false</code> and <code>WITHDRAWALS_ENABLED=false</code>.</p>
              </div>
            </div>
          </Show>

          {/* Transfer Modal */}
          <Show when={store.isTransferModalOpen}>
            <div className="modal-overlay">
              <div className="modal-card">
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Transfer to Trading Balance</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
                  Move funds from Funding Balance to Trading Balance via an internal double-entry journal.
                </p>

                <div className="form-field">
                  <label>Available in Funding</label>
                  <input className="form-input" value={`${store.fundingUsdt} USDT`} disabled />
                </div>

                <div className="form-field">
                  <label>Transfer Amount (USDT)</label>
                  <input
                    className="form-input"
                    value={store.transferAmount}
                    onChange={(e) => { store.transferAmount = e.target.value; }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button className="btn-primary" style={{ background: '#1e293b' }} onClick={() => store.closeTransfer()}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleTransferSubmit}>
                    Confirm Transfer
                  </button>
                </div>
              </div>
            </div>
          </Show>

          {/* Embedded uReact Quantum DevTools HUD */}
          <DevTools />
        </div>
      </div>
    </Scoped>
  );
}
