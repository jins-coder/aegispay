import React, { useEffect, useState } from 'react';
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

// 1. Reactive uReact Store for AegisPay Customer Portal
export const portalStore = createStore({
  // Auth state
  isAuthenticated: false,
  userEmail: '',
  userName: '',
  userTier: 'TIER_2_VERIFIED',
  apiKey: '',
  authError: '',
  isAuthenticating: false,

  // UI Theme: default 'light'
  theme: 'light' as 'light' | 'dark',

  // Deposit & Balances
  selectedAsset: 'usdt',
  selectedNetwork: 'tron-nile',
  currentAddress: '',
  fundingUsdt: '0.000000',
  tradingUsdt: '0.000000',
  fundingUsdc: '0.000000',
  transactions: [] as any[],
  isTransferModalOpen: false,
  transferAmount: '10.000000',
  activeTab: 'deposit' as 'deposit' | 'history' | 'api',
  isSimulating: false,
  copyToast: '',

  // Methods
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  },
  login(email: string, name: string, apiKey: string) {
    this.isAuthenticated = true;
    this.userEmail = email;
    this.userName = name;
    this.apiKey = apiKey;
    this.authError = '';
    localStorage.setItem('aegispay_user', JSON.stringify({ email, name, apiKey }));
  },
  logout() {
    this.isAuthenticated = false;
    this.userEmail = '';
    this.userName = '';
    this.apiKey = '';
    localStorage.removeItem('aegispay_user');
  },
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
  setTab(tab: 'deposit' | 'history' | 'api') {
    this.activeTab = tab;
  },
  showToast(msg: string) {
    this.copyToast = msg;
    setTimeout(() => {
      this.copyToast = '';
    }, 2500);
  }
});

// Fine-grained Signal for real-time live heartbeat counter
export const liveTickSignal = signal(0);

export default function CustomerPortalApp() {
  const store = useStore(portalStore);
  const [loginInputEmail, setLoginInputEmail] = useState('demo@aegispay.io');
  const [loginInputPassword, setLoginInputPassword] = useState('••••••••••••');

  // Check saved session on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aegispay_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.email) {
          store.login(u.email, u.name || 'DEMO TRADER', u.apiKey || 'ak_test_demo');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchLiveState = async () => {
    if (!store.isAuthenticated) return;
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
    if (store.isAuthenticated) {
      fetchLiveState();
      const interval = setInterval(fetchLiveState, 3500);
      return () => clearInterval(interval);
    }
  }, [store.isAuthenticated, store.selectedNetwork]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    store.isAuthenticating = true;
    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginInputEmail })
      });
      if (res.ok) {
        const data = await res.json();
        store.login(data.user.email, data.user.name, data.user.apiKey);
      } else {
        store.login(loginInputEmail, loginInputEmail.split('@')[0].toUpperCase(), 'ak_test_demo');
      }
    } catch {
      store.login(loginInputEmail, loginInputEmail.split('@')[0].toUpperCase(), 'ak_test_demo');
    } finally {
      store.isAuthenticating = false;
    }
  };

  const handleSimulateDeposit = async () => {
    store.isSimulating = true;
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
        store.showToast('🎉 Successfully credited 10.000000 USDT to Funding Balance!');
        await fetchLiveState();
      }
    } catch (err) {
      store.showToast(`Error simulating deposit: ${err}`);
    } finally {
      store.isSimulating = false;
    }
  };

  const handleExecuteTransfer = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/internal-transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccount: 'funding',
          toAccount: 'trading',
          assetId: store.selectedAsset,
          amountDecimal: store.transferAmount
        })
      });

      if (res.ok) {
        store.closeTransfer();
        store.showToast(`Transferred ${store.transferAmount} USDT to Trading Balance!`);
        await fetchLiveState();
      } else {
        const errJson = await res.json();
        alert(`Transfer rejected: ${errJson.error || 'Insufficient balance'}`);
      }
    } catch (err) {
      alert(`Transfer failed: ${err}`);
    }
  };

  const isLight = store.theme === 'light';

  return (
    <Scoped css={`
      :root {
        --bg-page: ${isLight ? '#f8fafc' : '#0a0f1d'};
        --bg-card: ${isLight ? '#ffffff' : '#111827'};
        --bg-card-subtle: ${isLight ? '#f1f5f9' : '#1e293b'};
        --border-color: ${isLight ? '#e2e8f0' : '#2d3748'};
        --border-focus: ${isLight ? '#4f46e5' : '#6366f1'};
        --text-primary: ${isLight ? '#0f172a' : '#f8fafc'};
        --text-secondary: ${isLight ? '#64748b' : '#94a3b8'};
        --text-muted: ${isLight ? '#94a3b8' : '#64748b'};
        --brand-primary: #4f46e5;
        --brand-accent: #10b981;
        --brand-warn: #f59e0b;
        --shadow-sm: ${isLight ? '0 1px 3px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.3)'};
        --shadow-md: ${isLight ? '0 4px 12px rgba(0,0,0,0.05)' : '0 4px 16px rgba(0,0,0,0.4)'};
        --shadow-lg: ${isLight ? '0 10px 25px rgba(0,0,0,0.08)' : '0 10px 30px rgba(0,0,0,0.6)'};
      }

      .app-container {
        min-height: 100vh;
        background-color: var(--bg-page);
        color: var(--text-primary);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
        display: flex;
        flex-direction: column;
        transition: background-color 0.25s ease, color 0.25s ease;
      }

      /* Navbar */
      .navbar {
        background-color: var(--bg-card);
        border-bottom: 1px solid var(--border-color);
        padding: 14px 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: var(--shadow-sm);
      }
      .nav-left { display: flex; align-items: center; gap: 14px; }
      .brand-title {
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--brand-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .badge-testnet {
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #fde68a;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 9999px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .nav-right { display: flex; align-items: center; gap: 14px; }
      
      .btn-theme {
        background: var(--bg-card-subtle);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
      }
      .btn-theme:hover { border-color: var(--border-focus); }

      .user-pill {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 6px 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
      }
      .user-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--brand-primary);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 11px;
      }
      .btn-logout {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-logout:hover {
        background: #ef4444;
        color: #ffffff;
      }

      /* Login Screen */
      .login-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
      }
      .login-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 40px;
        width: 100%;
        max-width: 440px;
        box-shadow: var(--shadow-lg);
      }
      .login-header { text-align: center; margin-bottom: 28px; }
      .login-header h1 { font-size: 24px; font-weight: 800; margin: 0 0 8px 0; color: var(--text-primary); }
      .login-header p { font-size: 14px; color: var(--text-secondary); margin: 0; }
      
      .form-group { margin-bottom: 20px; }
      .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-primary); }
      .form-input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
      }
      .form-input:focus { border-color: var(--brand-primary); }
      
      .btn-primary {
        width: 100%;
        background: var(--brand-primary);
        color: #ffffff;
        border: none;
        padding: 12px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .btn-primary:hover { opacity: 0.92; }

      .demo-autofill {
        margin-top: 16px;
        padding: 12px;
        background: var(--bg-card-subtle);
        border-radius: 8px;
        font-size: 12px;
        color: var(--text-secondary);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      /* Main Portal Content */
      .main-body {
        flex: 1;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        padding: 32px 24px;
        box-sizing: border-box;
      }

      /* Balances Grid */
      .balance-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 28px;
      }
      .card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 24px;
        box-shadow: var(--shadow-sm);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .card:hover { box-shadow: var(--shadow-md); }
      .card-title {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .card-amount {
        font-size: 28px;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.02em;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      .card-subtext {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 6px;
      }
      .btn-action-sm {
        background: var(--brand-primary);
        color: #ffffff;
        border: none;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 14px;
      }

      /* Deposit Section */
      .deposit-box {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      @media (max-width: 860px) {
        .deposit-box { grid-template-columns: 1fr; }
      }

      .network-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-bottom: 20px;
      }
      .net-chip {
        padding: 12px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-card-subtle);
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;
      }
      .net-chip.active {
        border-color: var(--brand-primary);
        background: ${isLight ? 'rgba(79, 70, 229, 0.06)' : 'rgba(99, 102, 241, 0.15)'};
      }
      .net-chip-title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
      .net-chip-desc { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }

      .addr-field {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 16px 0;
        word-break: break-all;
        font-family: monospace;
        font-size: 13px;
        color: var(--text-primary);
      }
      .btn-copy {
        background: var(--brand-primary);
        color: #ffffff;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        margin-left: 10px;
        white-space: nowrap;
      }

      .qr-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: var(--bg-card-subtle);
        border-radius: 12px;
        border: 1px solid var(--border-color);
      }

      /* Simulator Card */
      .sim-card {
        background: ${isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.08)'};
        border: 1px solid ${isLight ? '#bbf7d0' : 'rgba(16, 185, 129, 0.3)'};
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
      }
      .btn-simulate {
        background: #10b981;
        color: #ffffff;
        border: none;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
        transition: opacity 0.2s;
      }
      .btn-simulate:hover { opacity: 0.9; }

      /* Transactions Table */
      .tx-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 16px;
      }
      .tx-table th {
        text-align: left;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-secondary);
        padding: 10px 12px;
        border-bottom: 1px solid var(--border-color);
      }
      .tx-table td {
        padding: 14px 12px;
        font-size: 13px;
        border-bottom: 1px solid var(--border-color);
        color: var(--text-primary);
      }
      .status-pill {
        display: inline-block;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;
      }
      .status-credited { background: #dcfce7; color: #166534; }
      .status-pending { background: #fef3c7; color: #92400e; }

      /* Modal */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
      }
      .modal-box {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 28px;
        width: 100%;
        max-width: 460px;
        box-shadow: var(--shadow-lg);
      }

      .toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #0f172a;
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 100;
      }
    `}>
      <div className="app-container">
        {/* Navigation */}
        <header className="navbar">
          <div className="nav-left">
            <div className="brand-title">
              <span>⚡ AEGISPAY</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>uReact v2.3</span>
            </div>
            <div className="badge-testnet">● Sandbox Testnet</div>
          </div>

          <div className="nav-right">
            <button className="btn-theme" onClick={() => store.toggleTheme()}>
              {isLight ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>

            <Show when={store.isAuthenticated}>
              <div className="user-pill">
                <div className="user-avatar">{store.userName.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12px' }}>{store.userEmail}</div>
                  <div style={{ fontSize: '10px', color: 'var(--brand-accent)' }}>● Tier-2 KYC Verified</div>
                </div>
              </div>
              <button className="btn-logout" onClick={() => store.logout()}>
                Logout
              </button>
            </Show>
          </div>
        </header>

        {/* Unauthenticated Login Screen */}
        <Show when={!store.isAuthenticated}>
          <div className="login-wrap">
            <div className="login-card">
              <div className="login-header">
                <h1>Sign in to AegisPay</h1>
                <p>Multi-Network Testnet Deposit & Trading Gateway</p>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={loginInputEmail}
                    onChange={(e) => setLoginInputEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password / Secret</label>
                  <input
                    type="password"
                    className="form-input"
                    value={loginInputPassword}
                    onChange={(e) => setLoginInputPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={store.isAuthenticating}>
                  {store.isAuthenticating ? 'Authenticating...' : 'Sign In to Portal'}
                </button>
              </form>

              <div className="demo-autofill">
                <span>Demo Account: <strong>demo@aegispay.io</strong></span>
                <button
                  style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => {
                    setLoginInputEmail('demo@aegispay.io');
                    setLoginInputPassword('••••••••••••');
                  }}
                >
                  Autofill
                </button>
              </div>
            </div>
          </div>
        </Show>

        {/* Authenticated Dashboard */}
        <Show when={store.isAuthenticated}>
          <main className="main-body">
            {/* Header Telemetry */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0' }}>Custody & Balances</h1>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Real-time Double-Entry Ledger Balances (Anti-Spoofing & Watch-Only Indexing)
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Live Stream Ticks: <SignalValue value={liveTickSignal} />
              </div>
            </div>

            {/* Balances Grid */}
            <div className="balance-grid">
              <div className="card">
                <div className="card-title">
                  <span>Funding Balance (USDT)</span>
                  <span style={{ color: 'var(--brand-accent)' }}>● Inbound</span>
                </div>
                <div className="card-amount">{store.fundingUsdt} <span style={{ fontSize: '16px' }}>USDT</span></div>
                <div className="card-subtext">Direct on-chain deposit settlements</div>
                <button className="btn-action-sm" onClick={() => store.openTransfer()}>
                  Transfer to Trading ➔
                </button>
              </div>

              <div className="card">
                <div className="card-title">
                  <span>Trading Balance (USDT)</span>
                  <span style={{ color: 'var(--brand-primary)' }}>● Spot Ledger</span>
                </div>
                <div className="card-amount">{store.tradingUsdt} <span style={{ fontSize: '16px' }}>USDT</span></div>
                <div className="card-subtext">Allocated for spot order execution</div>
              </div>

              <div className="card">
                <div className="card-title">
                  <span>Funding Balance (USDC)</span>
                  <span>● USDC</span>
                </div>
                <div className="card-amount">{store.fundingUsdc} <span style={{ fontSize: '16px' }}>USDC</span></div>
                <div className="card-subtext">Cross-chain stablecoin deposits</div>
              </div>
            </div>

            {/* Main Interactive Workstation */}
            <div className="deposit-box">
              {/* Left Column: Network & Address */}
              <div className="card">
                <div className="card-title">Select Deposit Network</div>
                <div className="network-selector">
                  <div
                    className={`net-chip ${store.selectedNetwork === 'tron-nile' ? 'active' : ''}`}
                    onClick={() => store.setNetwork('tron-nile')}
                  >
                    <div className="net-chip-title">🔴 TRON Nile</div>
                    <div className="net-chip-desc">TRC-20 (19 Confirms)</div>
                  </div>

                  <div
                    className={`net-chip ${store.selectedNetwork === 'ethereum-sepolia' ? 'active' : ''}`}
                    onClick={() => store.setNetwork('ethereum-sepolia')}
                  >
                    <div className="net-chip-title">🔷 Sepolia Testnet</div>
                    <div className="net-chip-desc">ERC-20 (12 Confirms)</div>
                  </div>

                  <div
                    className={`net-chip ${store.selectedNetwork === 'polygon-amoy' ? 'active' : ''}`}
                    onClick={() => store.setNetwork('polygon-amoy')}
                  >
                    <div className="net-chip-title">🟣 Polygon Amoy</div>
                    <div className="net-chip-desc">ERC-20 (32 Confirms)</div>
                  </div>

                  <div
                    className={`net-chip ${store.selectedNetwork === 'arbitrum-sepolia' ? 'active' : ''}`}
                    onClick={() => store.setNetwork('arbitrum-sepolia')}
                  >
                    <div className="net-chip-title">🔵 Arbitrum Sepolia</div>
                    <div className="net-chip-desc">ERC-20 (64 Confirms)</div>
                  </div>
                </div>

                <div className="card-title">Your Watch-Only Deposit Address</div>
                <div className="addr-field">
                  <span>{store.currentAddress || 'Generating deterministic address...'}</span>
                  <button
                    className="btn-copy"
                    onClick={() => {
                      navigator.clipboard.writeText(store.currentAddress);
                      store.showToast('Copied deposit address to clipboard!');
                    }}
                  >
                    Copy
                  </button>
                </div>

                <div className="sim-card">
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#166534', marginBottom: '6px' }}>
                    🧪 Interactive Testnet Simulator
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803d', marginBottom: '12px' }}>
                    Simulate sending an on-chain <strong>10.000000 USDT</strong> deposit on {store.selectedNetwork}. The ingestion worker scans the range, verifies token contract allowlist, and credits your Funding balance.
                  </div>
                  <button
                    className="btn-simulate"
                    onClick={handleSimulateDeposit}
                    disabled={store.isSimulating}
                  >
                    {store.isSimulating ? 'Processing on-chain event...' : 'Simulate 10 USDT Deposit'}
                  </button>
                </div>
              </div>

              {/* Right Column: QR Code & Verification info */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card-title" style={{ width: '100%', textAlign: 'left', marginBottom: '16px' }}>
                  Dynamic Address QR Code
                </div>
                <div
                  className="qr-wrapper"
                  dangerouslySetInnerHTML={{ __html: renderQRCodeSvg(store.currentAddress || 'AegisPay-Testnet', 180) }}
                />
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '16px', textAlign: 'center', maxWidth: '300px' }}>
                  Scan with any testnet mobile wallet. Only send {store.selectedAsset.toUpperCase()} to this address.
                </div>
              </div>
            </div>

            {/* Transactions Section */}
            <div className="card" style={{ marginTop: '28px' }}>
              <div className="card-title">Recent Inbound Deposits & Allocations</div>
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Tx Hash / Reference</th>
                    <th>Network</th>
                    <th>Asset</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={store.transactions} fallback={
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                        No transactions recorded yet. Click "Simulate 10 USDT Deposit" above!
                      </td>
                    </tr>
                  }>
                    {(tx: any) => (
                      <tr key={tx.id || tx.txHash}>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                          {tx.txHash ? `${tx.txHash.slice(0, 10)}...${tx.txHash.slice(-8)}` : tx.id}
                        </td>
                        <td>{tx.networkId}</td>
                        <td><strong>{tx.assetId ? tx.assetId.toUpperCase() : 'USDT'}</strong></td>
                        <td style={{ fontWeight: 700, color: 'var(--brand-accent)' }}>+{tx.amountDecimal}</td>
                        <td>
                          <span className={`status-pill ${tx.status === 'CREDITED' ? 'status-credited' : 'status-pending'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          {new Date(tx.createdAt || tx.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>

            {/* Modal: Transfer to Trading */}
            <Show when={store.isTransferModalOpen}>
              <div className="modal-overlay">
                <div className="modal-box">
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                    Internal Balance Allocation
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                    Transfer funds from <strong>Funding Account</strong> (on-chain deposits) to <strong>Trading Account</strong> (active spot orders).
                  </p>

                  <div className="form-group">
                    <label className="form-label">Transfer Amount (USDT)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={store.transferAmount}
                      onChange={(e) => (store.transferAmount = e.target.value)}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Available in Funding: {store.fundingUsdt} USDT
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                    <button
                      className="btn-primary"
                      style={{ background: 'var(--bg-card-subtle)', color: 'var(--text-primary)' }}
                      onClick={() => store.closeTransfer()}
                    >
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleExecuteTransfer}>
                      Execute Transfer
                    </button>
                  </div>
                </div>
              </div>
            </Show>

            {/* In-App DevTools HUD */}
            <DevTools />
          </main>
        </Show>

        {/* Global Toast */}
        <Show when={!!store.copyToast}>
          <div className="toast">{store.copyToast}</div>
        </Show>
      </div>
    </Scoped>
  );
}
