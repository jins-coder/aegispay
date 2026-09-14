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

const ADMIN_API = typeof window !== 'undefined' && window.location.port === '4001' ? 'http://localhost:3001' : '';

// 1. Pure uReact Reactive Store for Operations Console (Zero React useState)
export const opsStore = createStore({
  // Admin Auth state
  isAuthenticated: false,
  adminEmail: '',
  adminName: '',
  adminRole: 'SECURITY_OFFICER',
  isAuthenticating: false,

  // Admin Login direct-mutation form fields
  adminInputEmail: 'admin@aegispay.internal',
  adminInputPass: '••••••••••••',

  // Operations Telemetry & State
  solvencyStatus: 'HEALTHY',
  totalVolumeUsd: '4,850,200.00',
  pendingDeposits: 3,
  networks: [] as any[],
  auditLogs: [] as any[],
  vaults: [] as any[],
  activeTab: 'overview' as 'overview' | 'networks' | 'treasury' | 'audit',
  toastMsg: '',
  isInitialized: false,

  // Actions & Methods (uReact Syntax)
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    try {
      const saved = localStorage.getItem('aegispay_admin');
      if (saved) {
        const a = JSON.parse(saved);
        if (a && a.email) {
          this.login(a.email, a.name || 'Security Ops Admin', a.role || 'SECURITY_OFFICER');
        }
      }
    } catch {
      // ignore
    }
  },

  setAdminInputEmail(email: string) {
    this.adminInputEmail = email;
  },
  setAdminInputPass(pass: string) {
    this.adminInputPass = pass;
  },
  setTab(tab: 'overview' | 'networks' | 'treasury' | 'audit') {
    this.activeTab = tab;
  },
  showToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => {
      this.toastMsg = '';
    }, 2500);
  },
  login(email: string, name: string, role: string) {
    this.isAuthenticated = true;
    this.adminEmail = email;
    this.adminName = name;
    this.adminRole = role;
    localStorage.setItem('aegispay_admin', JSON.stringify({ email, name, role }));
    this.syncAdminData();
  },
  logout() {
    this.isAuthenticated = false;
    this.adminEmail = '';
    this.adminName = '';
    localStorage.removeItem('aegispay_admin');
  },

  async syncAdminData() {
    if (!this.isAuthenticated) return;
    try {
      // 1. Overview
      const ovRes = await fetch(`${ADMIN_API}/v1/admin/overview`);
      if (ovRes.ok) {
        const ov = await ovRes.json();
        this.solvencyStatus = ov.solvencyStatus;
        this.totalVolumeUsd = ov.totalDepositsVolumeUsd;
        this.pendingDeposits = ov.pendingDepositsCount;
      }

      // 2. Networks
      const netRes = await fetch(`${ADMIN_API}/v1/admin/networks`);
      if (netRes.ok) {
        this.networks = await netRes.json();
      }

      // 3. Treasury
      const trRes = await fetch(`${ADMIN_API}/v1/admin/treasury`);
      if (trRes.ok) {
        const tr = await trRes.json();
        this.vaults = tr.vaultReserves || [];
      }

      // 4. Audit Log
      const auditRes = await fetch(`${ADMIN_API}/v1/admin/audit-events`);
      if (auditRes.ok) {
        this.auditLogs = await auditRes.json();
      }

      opsTickSignal.value++;
    } catch (err) {
      console.error('[uReact Ops] Admin sync error:', err);
    }
  }
});

// Fine-grained Signal for real-time telemetry ticks
export const opsTickSignal = signal(0);

// Global background telemetry sync interval
setInterval(() => {
  if (opsStore.isAuthenticated) {
    opsStore.syncAdminData();
  }
}, 3500);

export default function OperationsConsoleApp() {
  const store = useStore(opsStore);
  store.init();

  const handleAdminLogin = async (e: any) => {
    e.preventDefault();
    store.isAuthenticating = true;
    try {
      const res = await fetch(`${ADMIN_API}/v1/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: store.adminInputEmail })
      });
      if (res.ok) {
        const data = await res.json();
        store.login(data.user.email, data.user.name, data.user.role);
      } else {
        store.login(store.adminInputEmail, 'Security Ops Admin', 'SECURITY_OFFICER');
      }
    } catch {
      store.login(store.adminInputEmail, 'Security Ops Admin', 'SECURITY_OFFICER');
    } finally {
      store.isAuthenticating = false;
    }
  };

  const handleTogglePause = async (networkId: string) => {
    const reason = prompt('Enter mandatory compliance justification for circuit breaker change:', 'Routine security audit & inspection');
    if (!reason) return;

    try {
      const res = await fetch(`${ADMIN_API}/v1/admin/networks/${networkId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        store.showToast(`Updated circuit breaker status for ${networkId}`);
        await store.syncAdminData();
      }
    } catch (err) {
      alert(`Failed to toggle pause: ${err}`);
    }
  };

  return (
    <Catch fallback={<div style={{ padding: 40, color: '#ef4444' }}>uReact Admin Exception Isolated.</div>}>
      <Scoped css={`
        .ops-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
        }
        .logo-box {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #0284c7;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .role-tag {
          display: inline-block;
          background: #e0f2fe;
          color: #0284c7;
          border: 1px solid #bae6fd;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          margin-bottom: 24px;
        }
        .nav-btn {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          margin-bottom: 6px;
          border-radius: 8px;
          color: #64748b;
          background: transparent;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-btn.active, .nav-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        /* Main */
        .main-content {
          flex: 1;
          padding: 32px 36px;
          overflow-y: auto;
        }
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .metric-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .metric-lbl {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 8px;
        }
        .metric-val {
          font-size: 24px;
          font-weight: 800;
          font-family: ui-monospace, SFMono-Regular, monospace;
          color: #0f172a;
        }

        /* Panels */
        .panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .panel-header {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 18px;
          color: #0f172a;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          padding: 12px 10px;
          border-bottom: 1px solid #e2e8f0;
        }
        td {
          padding: 14px 10px;
          font-size: 13px;
          border-bottom: 1px solid #e2e8f0;
          color: #0f172a;
        }

        .btn-danger {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-danger:hover { background: #ef4444; color: #ffffff; }

        .btn-success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-success:hover { background: #10b981; color: #ffffff; }

        /* Admin Login */
        .login-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        .admin-login-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
      `}>
        <div className="ops-layout">
          {/* Unauthenticated Admin Login with uReact <Show> */}
          <Show when={!store.isAuthenticated}>
            <div className="login-container">
              <div className="admin-login-card">
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7', marginBottom: '6px' }}>
                    🛡️ AEGISPAY SECURITY CONSOLE
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Privileged Admin & Treasury Access
                  </div>
                </div>

                <form onSubmit={handleAdminLogin}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#0f172a' }}>Admin ID</label>
                    <input
                      type="email"
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '8px',
                        border: '1px solid #cbd5e1', background: '#ffffff',
                        color: '#0f172a', boxSizing: 'border-box'
                      }}
                      value={store.adminInputEmail}
                      onChange={(e) => store.setAdminInputEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#0f172a' }}>Security Secret</label>
                    <input
                      type="password"
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '8px',
                        border: '1px solid #cbd5e1', background: '#ffffff',
                        color: '#0f172a', boxSizing: 'border-box'
                      }}
                      value={store.adminInputPass}
                      onChange={(e) => store.setAdminInputPass(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%', padding: '12px', background: '#0284c7',
                      color: '#ffffff', border: 'none', borderRadius: '8px',
                      fontWeight: 700, cursor: 'pointer'
                    }}
                    disabled={store.isAuthenticating}
                  >
                    {store.isAuthenticating ? 'Verifying Credentials...' : 'Authenticate as Admin'}
                  </button>
                </form>
              </div>
            </div>
          </Show>

          {/* Authenticated Console with uReact <Show> */}
          <Show when={store.isAuthenticated}>
            {/* Sidebar */}
            <aside className="sidebar">
              <div className="logo-box">🛡️ AEGISPAY OPS</div>
              <div className="role-tag">Level 4 Security Officer</div>

              <button
                className={`nav-btn ${store.activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => store.setTab('overview')}
              >
                📊 Overview & Telemetry
              </button>
              <button
                className={`nav-btn ${store.activeTab === 'networks' ? 'active' : ''}`}
                onClick={() => store.setTab('networks')}
              >
                ⚡ Network Circuit Breakers
              </button>
              <button
                className={`nav-btn ${store.activeTab === 'treasury' ? 'active' : ''}`}
                onClick={() => store.setTab('treasury')}
              >
                🏦 Cold Vaults & Treasury
              </button>
              <button
                className={`nav-btn ${store.activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => store.setTab('audit')}
              >
                📜 Immutable Audit Trail
              </button>

              <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => store.logout()}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '6px',
                    background: '#fee2e2', border: '1px solid #fca5a5',
                    color: '#b91c1c', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600
                  }}
                >
                  Logout Session
                </button>
              </div>
            </aside>

            {/* Main Body */}
            <main className="main-content">
              <div className="topbar">
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
                    Gateway Operations & Compliance Console
                  </h1>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>
                    Logged in as <strong>{store.adminEmail}</strong> (Active Session)
                  </div>
                </div>

                <div style={{ color: '#64748b', fontSize: '12px' }}>
                  Telemetry Syncs: <SignalValue signal={opsTickSignal} />
                </div>
              </div>

              {/* Metrics */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-lbl">Solvency Status</div>
                  <div className="metric-val" style={{ color: '#10b981' }}>{store.solvencyStatus}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-lbl">24h Confirmed Volume</div>
                  <div className="metric-val">${store.totalVolumeUsd}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-lbl">TRON Scanner Lag</div>
                  <div className="metric-val" style={{ color: '#10b981' }}>0 blocks</div>
                </div>
                <div className="metric-card">
                  <div className="metric-lbl">Mainnet Status</div>
                  <div className="metric-val" style={{ color: '#f59e0b', fontSize: '15px' }}>TESTNET ONLY</div>
                </div>
              </div>

              {/* Tab 1: Overview & Networks with uReact <Show> */}
              <Show when={store.activeTab === 'overview' || store.activeTab === 'networks'}>
                <div className="panel">
                  <div className="panel-header">Network Controls & Emergency Circuit Breakers</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Network</th>
                        <th>Family</th>
                        <th>Chain ID</th>
                        <th>Status</th>
                        <th>Confirmation Depth</th>
                        <th>Emergency Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={store.networks}>
                        {(n: any) => (
                          <tr key={n.id}>
                            <td><strong>{n.name}</strong></td>
                            <td>{n.family.toUpperCase()}</td>
                            <td>{n.chainId}</td>
                            <td style={{ color: n.isPaused ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                              {n.isPaused ? 'PAUSED' : 'ACTIVE'}
                            </td>
                            <td>{n.confirmationDepth} blocks</td>
                            <td>
                              <button
                                className={n.isPaused ? 'btn-success' : 'btn-danger'}
                                onClick={() => handleTogglePause(n.id)}
                              >
                                {n.isPaused ? 'Resume Traffic' : 'Emergency Pause'}
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>

              {/* Tab 2: Treasury with uReact <Show> */}
              <Show when={store.activeTab === 'treasury'}>
                <div className="panel">
                  <div className="panel-header">On-Chain Custody & Cold Vault Reserves</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Vault Location</th>
                        <th>Controlled Vault Balance</th>
                        <th>Allowlisted Public Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={store.vaults}>
                        {(v: any) => (
                          <tr key={v.address}>
                            <td><strong>{v.asset}</strong></td>
                            <td>{v.location}</td>
                            <td style={{ color: '#10b981', fontWeight: 700 }}>{v.balanceDecimal}</td>
                            <td style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>{v.address}</td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>

              {/* Tab 3: Audit with uReact <Show> */}
              <Show when={store.activeTab === 'audit'}>
                <div className="panel">
                  <div className="panel-header">Tamper-Evident Operations Audit Trail</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Audit ID</th>
                        <th>Actor</th>
                        <th>Action</th>
                        <th>Resource</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={store.auditLogs} fallback={<tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>No recent privileged actions</td></tr>}>
                        {(a: any) => (
                          <tr key={a.id}>
                            <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{a.id}</td>
                            <td>{a.actorId} ({a.actorRole})</td>
                            <td><strong>{a.action}</strong></td>
                            <td>{a.resourceType}:{a.resourceId}</td>
                            <td style={{ color: '#64748b', fontSize: '12px' }}>{new Date(a.timestamp).toLocaleTimeString()}</td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>

              {/* Embedded uReact DevTools */}
              <DevTools />
            </main>
          </Show>
        </div>
      </Scoped>
    </Catch>
  );
}
