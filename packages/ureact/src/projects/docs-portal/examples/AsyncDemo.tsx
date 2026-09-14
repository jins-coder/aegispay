import React, { useState } from 'react';
import { useAsync, Await, Show } from 'ureact';
import { RefreshCw, Zap, AlertTriangle, CheckCircle, Database, PlusCircle } from 'lucide-react';

interface ServerMetric {
  nodeId: string;
  region: string;
  uptime: string;
  requestsPerSec: number;
  cpuLoad: number;
}

export function AsyncDemo() {
  const [latency, setLatency] = useState(600);
  const [shouldFail, setShouldFail] = useState(false);

  // Simulated server fetcher
  const fetchMetrics = async (): Promise<ServerMetric[]> => {
    await new Promise((resolve) => setTimeout(resolve, latency));
    if (shouldFail) {
      throw new Error('503 Service Unavailable: Remote cluster unreachable.');
    }

    return [
      { nodeId: 'node-us-east-1', region: 'N. Virginia', uptime: '99.98%', requestsPerSec: 1420, cpuLoad: 42 },
      { nodeId: 'node-eu-central-1', region: 'Frankfurt', uptime: '99.95%', requestsPerSec: 980, cpuLoad: 31 },
      { nodeId: 'node-ap-southeast-1', region: 'Singapore', uptime: '100%', requestsPerSec: 640, cpuLoad: 18 }
    ];
  };

  const { data, loading, error, refresh, mutate, reset } = useAsync(fetchMetrics, {
    immediate: true,
    deps: [shouldFail]
  });

  const handleOptimisticAdd = () => {
    mutate((prev) => [
      ...(prev || []),
      {
        nodeId: `node-custom-${Math.floor(Math.random() * 900 + 100)}`,
        region: 'Tokyo Edge',
        uptime: '100%',
        requestsPerSec: 350,
        cpuLoad: 15
      }
    ]);
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">
            <Zap size={20} style={{ color: 'var(--accent-amber)' }} />
            Zero-Ceremony Async Tasks (<code>useAsync</code> &amp; <code>&lt;Await&gt;</code>)
          </h3>
          <p className="panel-subtitle">
            Eliminates repeated <code>useState(data)</code>, <code>useState(loading)</code>, <code>useState(error)</code>, effect unmount flags, and race condition guards.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => refresh()} className="btn btn-secondary" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-pulse' : ''} /> Refetch
          </button>
        </div>
      </div>

      <div className="comparison-grid">
        {/* Standard React Boilerplate */}
        <div className="code-box standard">
          <div className="code-box-header">
            <span>Standard React (useEffect async ceremony)</span>
            <span className="code-box-badge badge-bad">Race Conditions &amp; Boilerplate</span>
          </div>
          <pre className="code-content">
            <code>{`const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  let isMounted = true;
  setLoading(true);
  fetchData()
    .then(res => { if (isMounted) setData(res); })
    .catch(err => { if (isMounted) setError(err); })
    .finally(() => { if (isMounted) setLoading(false); });
    
  return () => { isMounted = false; };
}, [deps]);`}</code>
          </pre>
        </div>

        {/* uReact Clean Code */}
        <div className="code-box ureact">
          <div className="code-box-header">
            <span>uReact (Smart useAsync Hook)</span>
            <span className="code-box-badge badge-good">Safe &amp; Declarative</span>
          </div>
          <pre className="code-content">
            <code>{`// One line handles loading, error, cancellation,
// unmount protection, and optimistic mutations:
const { data, loading, error, refresh, mutate } = 
  useAsync(fetchData, { deps: [filter] });

// Or inside JSX with <Await>:
<Await for={fetchData} loading={<Skeleton />}>
  {(data) => <ServerList items={data} />}
</Await>`}</code>
          </pre>
        </div>
      </div>

      <div className="interactive-playground">
        {/* Async Simulator Controls */}
        <div className="widget-card">
          <h4 className="widget-title">Simulate Network Conditions</h4>

          <div className="form-group">
            <label className="form-label">Simulated Network Delay: {latency}ms</label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              className="input-field"
              value={latency}
              onChange={(e) => setLatency(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-check">
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={shouldFail}
                onChange={(e) => setShouldFail(e.target.checked)}
              />
              <span style={{ fontSize: '0.88rem', color: shouldFail ? 'var(--accent-rose)' : 'inherit' }}>
                Simulate 503 Server Failure
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
            <button onClick={() => refresh()} className="btn btn-primary" disabled={loading}>
              <RefreshCw size={15} /> Execute Request
            </button>
            <button onClick={handleOptimisticAdd} className="btn btn-secondary">
              <PlusCircle size={15} /> Optimistic Add
            </button>
            <button onClick={() => reset()} className="btn btn-secondary">
              Reset State
            </button>
          </div>
        </div>

        {/* Live Data Render Box */}
        <div className="widget-card">
          <h4 className="widget-title">
            <Database size={18} style={{ color: 'var(--accent-cyan)' }} />
            Live Cluster Telemetry
          </h4>

          {loading && (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--accent-cyan)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.9rem' }}>Fetching live server telemetry ({latency}ms)...</p>
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fda4af'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <AlertTriangle size={18} /> {error.name}: {error.message}
              </div>
              <button
                onClick={() => {
                  setShouldFail(false);
                  refresh();
                }}
                className="btn btn-danger"
                style={{ marginTop: '12px', fontSize: '0.8rem', padding: '6px 12px' }}
              >
                Disable Failure &amp; Retry
              </button>
            </div>
          )}

          {!loading && !error && data && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.map((metric) => (
                <div
                  key={metric.nodeId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{metric.nodeId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {metric.region} • Uptime: {metric.uptime}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {metric.requestsPerSec} req/s
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      CPU: {metric.cpuLoad}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
