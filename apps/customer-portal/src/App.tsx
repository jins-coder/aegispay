import {
  createStore,
  useStore,
  signal,
  SignalValue,
  Scoped,
  For,
  Show,
  Catch,
  DevTools
} from 'ureact';
import { renderQRCodeSvg } from './qrcode';

const API_BASE = 'http://localhost:3000';

// 1. Pure uReact Reactive Store with Direct State Mutations & Lifecycle Actions
export const portalStore = createStore({
  // Session & Auth state
  isAuthenticated: false,
  userEmail: '',
  userName: '',
  userTier: 'TIER_2_VERIFIED',
  apiKey: '',
  isAuthenticating: false,

  // Login inputs (Direct Mutation Store State)
  loginEmail: 'demo@aegispay.io',
  loginPassword: '••••••••••••',

  // Gateway & Multi-Network state
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
  toastMessage: '',
  isInitialized: false,

  // Store Actions & Methods (uReact Syntax)
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    try {
      const saved = localStorage.getItem('aegispay_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.email) {
          this.login(u.email, u.name || 'DEMO TRADER', u.apiKey || 'ak_test_demo');
        }
      }
    } catch {
      // ignore
    }
  },

  setLoginEmail(email: string) {
    this.loginEmail = email;
  },
  setLoginPassword(pwd: string) {
    this.loginPassword = pwd;
  },
  setAsset(asset: string) {
    this.selectedAsset = asset;
  },
  setNetwork(net: string) {
    this.selectedNetwork = net;
    this.syncGateway();
  },
  setTransferAmount(amt: string) {
    this.transferAmount = amt;
  },
  openTransfer() {
    this.isTransferModalOpen = true;
  },
  closeTransfer() {
    this.isTransferModalOpen = false;
  },
  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
    }, 2500);
  },
  login(email: string, name: string, apiKey: string) {
    this.isAuthenticated = true;
    this.userEmail = email;
    this.userName = name;
    this.apiKey = apiKey;
    localStorage.setItem('aegispay_user', JSON.stringify({ email, name, apiKey }));
    this.syncGateway();
  },
  logout() {
    this.isAuthenticated = false;
    this.userEmail = '';
    this.userName = '';
    this.apiKey = '';
    localStorage.removeItem('aegispay_user');
  },

  async syncGateway() {
    if (!this.isAuthenticated) return;
    try {
      // 1. Fetch Balances
      const balRes = await fetch(`${API_BASE}/v1/balances`);
      if (balRes.ok) {
        const balances = await balRes.json();
        const usdt = balances.find((b: any) => b.assetId === 'usdt');
        const usdc = balances.find((b: any) => b.assetId === 'usdc');
        if (usdt) {
          this.fundingUsdt = usdt.fundingDecimal;
          this.tradingUsdt = usdt.tradingDecimal;
        }
        if (usdc) {
          this.fundingUsdc = usdc.fundingDecimal;
        }
      }

      // 2. Fetch or allocate watch-only deposit address
      const addrRes = await fetch(`${API_BASE}/v1/deposit-addresses/ensure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ networkId: this.selectedNetwork })
      });
      if (addrRes.ok) {
        const addrJson = await addrRes.json();
        this.currentAddress = addrJson.address;
      }

      // 3. Fetch transaction history
      const txRes = await fetch(`${API_BASE}/v1/transactions`);
      if (txRes.ok) {
        this.transactions = await txRes.json();
      }

      liveTickSignal.value++;
    } catch (err) {
      console.error('[uReact Portal] Gateway sync error:', err);
    }
  }
});

// Fine-grained Signal for real-time live tick counter
export const liveTickSignal = signal(0);

// Global background sync timer
setInterval(() => {
  if (portalStore.isAuthenticated) {
    portalStore.syncGateway();
  }
}, 3500);

export default function CustomerPortalApp() {
  const store = useStore(portalStore);
  store.init();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    store.isAuthenticating = true;
    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: store.loginEmail })
      });
      if (res.ok) {
        const data = await res.json();
        store.login(data.user.email, data.user.name, data.user.apiKey);
      } else {
        store.login(store.loginEmail, store.loginEmail.split('@')[0].toUpperCase(), 'ak_test_demo');
      }
    } catch {
      store.login(store.loginEmail, store.loginEmail.split('@')[0].toUpperCase(), 'ak_test_demo');
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
        store.showToast('🎉 Successfully credited 10.000000 USDT to Funding Account!');
        await store.syncGateway();
      }
    } catch (err) {
      store.showToast(`Deposit simulation error: ${err}`);
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
          fromAccountType: 'funding',
          toAccountType: 'trading',
          fromAccount: 'funding',
          toAccount: 'trading',
          assetId: store.selectedAsset,
          amountDecimal: store.transferAmount,
          idempotencyKey: `xfer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        })
      });

      if (res.ok) {
        store.closeTransfer();
        store.showToast(`Transferred ${store.transferAmount} USDT to Trading Account!`);
        await store.syncGateway();
      } else {
        const errJson = await res.json();
        alert(`Transfer rejected: ${errJson.error || 'Insufficient balance'}`);
      }
    } catch (err) {
      alert(`Transfer error: ${err}`);
    }
  };

  return (
    <Catch fallback={<div style={{ padding: 40, color: '#ef4444' }}>uReact Component Exception Isolated.</div>}>
      <Scoped css={`
        .app-container {
          min-height: 100vh;
          background-color: #f8fafc;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* Navbar */
        .navbar {
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .nav-left { display: flex; align-items: center; gap: 14px; }
        .brand-title {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #4f46e5;
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

        .user-pill {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
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
          background: #4f46e5;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
        }
        .btn-logout {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
          padding: 6px 14px;
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
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .login-header { text-align: center; margin-bottom: 28px; }
        .login-header h1 { font-size: 24px; font-weight: 800; margin: 0 0 8px 0; color: #0f172a; }
        .login-header p { font-size: 14px; color: #64748b; margin: 0; }
        
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #0f172a; }
        .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #0f172a;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }
        .form-input:focus { border-color: #4f46e5; }
        
        .btn-primary {
          width: 100%;
          background: #4f46e5;
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
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 12px;
          color: #475569;
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
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .card-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-amount {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .card-subtext {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 6px;
        }
        .btn-action-sm {
          background: #4f46e5;
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
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }
        .net-chip.active {
          border-color: #4f46e5;
          background: #eef2ff;
        }
        .net-chip-title { font-size: 13px; font-weight: 700; color: #0f172a; }
        .net-chip-desc { font-size: 11px; color: #64748b; margin-top: 2px; }

        .addr-field {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 16px 0;
          word-break: break-all;
          font-family: monospace;
          font-size: 13px;
          color: #0f172a;
        }
        .btn-copy {
          background: #4f46e5;
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
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        /* Simulator Card */
        .sim-card {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
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
          color: #64748b;
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        .tx-table td {
          padding: 14px 12px;
          font-size: 13px;
          border-bottom: 1px solid #e2e8f0;
          color: #0f172a;
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
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        .modal-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          z-index: 100;
        }
      `}>
        <div className="app-container">
          {/* Top Navigation */}
          <header className="navbar">
            <div className="nav-left">
              <div className="brand-title">
                <span>⚡ AEGISPAY</span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>uReact Engine</span>
              </div>
              <div className="badge-testnet">● Sandbox Testnet</div>
            </div>

            <div className="nav-right">
              <Show when={store.isAuthenticated}>
                <div className="user-pill">
                  <div className="user-avatar">{store.userName ? store.userName.charAt(0) : 'U'}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12px' }}>{store.userEmail}</div>
                    <div style={{ fontSize: '10px', color: '#10b981' }}>● Tier-2 KYC Verified</div>
                  </div>
                </div>
                <button className="btn-logout" onClick={() => store.logout()}>
                  Logout
                </button>
              </Show>
            </div>
          </header>

          {/* Unauthenticated Login Screen with uReact <Show> */}
          <Show when={!store.isAuthenticated}>
            <div className="login-wrap">
              <div className="login-card">
                <div className="login-header">
                  <h1>Sign in to AegisPay</h1>
                  <p>Multi-Network Testnet Deposit & Trading Gateway</p>
                </div>

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={store.loginEmail}
                      onChange={(e) => store.setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password / Secret</label>
                    <input
                      type="password"
                      className="form-input"
                      value={store.loginPassword}
                      onChange={(e) => store.setLoginPassword(e.target.value)}
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
                    style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => {
                      store.setLoginEmail('demo@aegispay.io');
                      store.setLoginPassword('••••••••••••');
                    }}
                  >
                    Autofill
                  </button>
                </div>
              </div>
            </div>
          </Show>

          {/* Authenticated Dashboard with uReact <Show> */}
          <Show when={store.isAuthenticated}>
            <main className="main-body">
              {/* Header Telemetry with uReact <SignalValue> */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>Custody & Balances</h1>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>
                    Real-time Double-Entry Ledger Balances (Anti-Spoofing & Watch-Only Indexing)
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Live Stream Ticks: <SignalValue signal={liveTickSignal} />
                </div>
              </div>

              {/* Balances Grid */}
              <div className="balance-grid">
                <div className="card">
                  <div className="card-title">
                    <span>Funding Balance (USDT)</span>
                    <span style={{ color: '#10b981' }}>● Inbound</span>
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
                    <span style={{ color: '#4f46e5' }}>● Spot Ledger</span>
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
                {/* Left Column: Network Selector & Address */}
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

                {/* Right Column: QR Code */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="card-title" style={{ width: '100%', textAlign: 'left', marginBottom: '16px' }}>
                    Dynamic Address QR Code
                  </div>
                  <div
                    className="qr-wrapper"
                    dangerouslySetInnerHTML={{ __html: renderQRCodeSvg(store.currentAddress || 'AegisPay-Testnet', 180) }}
                  />
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '16px', textAlign: 'center', maxWidth: '300px' }}>
                    Scan with any testnet mobile wallet. Only send {store.selectedAsset.toUpperCase()} to this address.
                  </div>
                </div>
              </div>

              {/* Transactions Section with uReact <For> */}
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
                        <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
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
                          <td style={{ fontWeight: 700, color: '#10b981' }}>+{tx.amountDecimal}</td>
                          <td>
                            <span className={`status-pill ${tx.status === 'CREDITED' ? 'status-credited' : 'status-pending'}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '12px' }}>
                            {new Date(tx.createdAt || tx.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>

              {/* Modal: Transfer to Trading with uReact <Show> */}
              <Show when={store.isTransferModalOpen}>
                <div className="modal-overlay">
                  <div className="modal-box">
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>
                      Internal Balance Allocation
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
                      Transfer funds from <strong>Funding Account</strong> (on-chain deposits) to <strong>Trading Account</strong> (active spot orders).
                    </p>

                    <div className="form-group">
                      <label className="form-label">Transfer Amount (USDT)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={store.transferAmount}
                        onChange={(e) => store.setTransferAmount(e.target.value)}
                      />
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        Available in Funding: {store.fundingUsdt} USDT
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                      <button
                        className="btn-primary"
                        style={{ background: '#f1f5f9', color: '#0f172a' }}
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

              {/* In-App Quantum DevTools HUD */}
              <DevTools />
            </main>
          </Show>

          {/* Global Toast with uReact <Show> */}
          <Show when={!!store.toastMessage}>
            <div className="toast">{store.toastMessage}</div>
          </Show>
        </div>
      </Scoped>
    </Catch>
  );
}
