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

const ADMIN_API = 'http://localhost:3001';

// Reactive uReact Store for Operations Console
export const opsStore = createStore({
  solvencyStatus: 'HEALTHY',
  totalVolumeUsd: '4,850,200.00',
  pendingDeposits: 3,
  networks: [] as any[],
  auditLogs: [] as any[],
  vaults: [] as any[],
  activeTab: 'overview' as 'overview' | 'networks' | 'treasury' | 'audit',

  setTab(tab: 'overview' | 'networks' | 'treasury' | 'audit') {
    this.activeTab = tab;
  }
});

export const opsTickSignal = signal(0);

export default function OperationsConsoleApp() {
  const store = useStore(opsStore);

  const fetchAdminData = async () => {
    try {
      // 1. Overview
      const ovRes = await fetch(`${ADMIN_API}/v1/admin/overview`);
      if (ovRes.ok) {
        const ov = await ovRes.json();
        store.solvencyStatus = ov.solvencyStatus;
        store.totalVolumeUsd = ov.totalDepositsVolumeUsd;
        store.pendingDeposits = ov.pendingDepositsCount;
      }

      // 2. Networks
      const netRes = await fetch(`${ADMIN_API}/v1/admin/networks`);
      if (netRes.ok) {
        store.networks = await netRes.json();
      }

      // 3. Treasury
      const trRes = await fetch(`${ADMIN_API}/v1/admin/treasury`);
      if (trRes.ok) {
        const tr = await trRes.json();
        store.vaults = tr.vaultReserves || [];
      }

      // 4. Audit Log
      const auditRes = await fetch(`${ADMIN_API}/v1/admin/audit-events`);
      if (auditRes.ok) {
        store.auditLogs = await auditRes.json();
      }

      opsTickSignal.value++;
    } catch (err) {
      console.error('Failed to sync admin data:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePause = async (networkId: string) => {
    const reason = prompt('Enter mandatory reason for circuit breaker state change:', 'Routine operational check');
    if (!reason) return;

    try {
      const res = await fetch(`${ADMIN_API}/v1/admin/networks/${networkId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      alert(`Failed to toggle pause: ${err}`);
    }
  };

  return (
    <Scoped css={`
      .ops-root {
        display: flex; min-height: 100vh; background: #090d16; color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .sidebar {
        width: 250px; background: #0f172a; border-right: 1px solid #1e293b; padding: 24px 16px;
      }
      .main { flex: 1; padding: 32px; overflow-y: auto; }
      .logo { font-size: 16px; font-weight: 800; letter-spacing: 0.05em; color: #38bdf8; margin-bottom: 4px; }
      .role-badge {
        display: inline-block; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #38bdf8;
        font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-bottom: 24px;
      }
      .nav-btn {
        display: block; width: 100%; text-align: left; padding: 10px 12px; margin-bottom: 6px;
        border-radius: 6px; color: #94a3b8; background: transparent; border: none; font-size: 13px;
        font-weight: 500; cursor: pointer; transition: all 0.2s;
      }
      .nav-btn.active, .nav-btn:hover { background: #1e293b; color: #fff; }
      .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
      .metric-card {
        background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 20px;
      }
      .metric-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
      .metric-val { font-size: 24px; font-weight: 700; font-family: monospace; }
      .panel {
        background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 24px;
      }
      .panel-header { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th { text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; padding: 10px; border-bottom: 1px solid #1e293b; }
      td { padding: 12px 10px; font-size: 13px; border-bottom: 1px solid #1e293b; font-family: monospace; }
      .btn-danger {
        background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid #ef4444;
        padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;
      }
      .btn-success {
        background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid #10b981;
        padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;
      }
    `}>
      <div className="ops-root">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo">AEGISPAY OPS ⚛️</div>
          <div className="role-badge">Security & Treasury Admin</div>

          <button
            className={`nav-btn ${store.activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => store.setTab('overview')}
          >
            Overview & Telemetry
          </button>
          <button
            className={`nav-btn ${store.activeTab === 'networks' ? 'active' : ''}`}
            onClick={() => store.setTab('networks')}
          >
            Network Circuit Breakers
          </button>
          <button
            className={`nav-btn ${store.activeTab === 'treasury' ? 'active' : ''}`}
            onClick={() => store.setTab('treasury')}
          >
            Cold Vaults & Treasury
          </button>
          <button
            className={`nav-btn ${store.activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => store.setTab('audit')}
          >
            Immutable Audit Trail
          </button>
        </aside>

        {/* Main Content */}
        <main className="main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Gateway Operations & Compliance Console</h2>
            <div style={{ color: '#64748b', fontSize: '12px' }}>
              Telemetry Syncs: <SignalValue value={opsTickSignal} />
            </div>
          </div>

          {/* Metrics Grid */}
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
              <div className="metric-lbl">TRON Nile Scanner Lag</div>
              <div className="metric-val" style={{ color: '#10b981' }}>0 blocks</div>
            </div>
            <div className="metric-card">
              <div className="metric-lbl">Mainnet Status</div>
              <div className="metric-val" style={{ color: '#f59e0b', fontSize: '15px' }}>GATED (TESTNET ONLY)</div>
            </div>
          </div>

          {/* Tab 1: Overview / Networks */}
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
                    <th>Depth</th>
                    <th>Emergency Action</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={store.networks}>
                    {(n) => (
                      <tr key={n.id}>
                        <td><strong>{n.name}</strong></td>
                        <td>{n.family.toUpperCase()}</td>
                        <td>{n.chainId}</td>
                        <td style={{ color: n.isPaused ? '#ef4444' : '#10b981', fontWeight: 600 }}>
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

          {/* Tab 2: Treasury */}
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
                        <td style={{ color: '#10b981', fontWeight: 600 }}>{v.balanceDecimal}</td>
                        <td style={{ color: '#64748b', fontSize: '12px' }}>{v.address}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>

          {/* Tab 3: Audit */}
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
                  <For each={store.auditLogs} fallback={<tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No recent privileged actions recorded</td></tr>}>
                    {(a: any) => (
                      <tr key={a.id}>
                        <td style={{ fontSize: '11px' }}>{a.id}</td>
                        <td>{a.actorId} ({a.actorRole})</td>
                        <td><strong>{a.action}</strong></td>
                        <td>{a.resourceType}:{a.resourceId}</td>
                        <td>{new Date(a.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>

          {/* Embedded uReact Quantum DevTools HUD */}
          <DevTools />
        </main>
      </div>
    </Scoped>
  );
}
