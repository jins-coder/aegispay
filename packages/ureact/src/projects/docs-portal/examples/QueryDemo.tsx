import React, { useState } from 'react';
import { useQuery, useMutation, defaultQueryClient } from 'ureact';
import {
  Database,
  RefreshCw,
  Zap,
  Users,
  CheckCircle,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  version: number;
}

// Simulated remote server state
let serverDatabase: UserProfile = {
  id: 'usr-99',
  name: 'Elena Rostova',
  role: 'Principal Systems Architect',
  avatar: '👩‍💻',
  version: 1
};

let networkRequestCount = 0;

const fetchRemoteUser = async (): Promise<UserProfile> => {
  networkRequestCount++;
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 600));
  return { ...serverDatabase };
};

export function QueryDemo() {
  const [shouldFailMutation, setShouldFailMutation] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 7)]);
  };

  // Widget 1 Query
  const query1 = useQuery<UserProfile>('current-user', fetchRemoteUser, {
    staleTime: 5000,
    onSuccess: (data) => addLog(`Widget 1 received data (v${data.version})`)
  });

  // Widget 2 Query (independent component subscribing to the exact same key)
  const query2 = useQuery<UserProfile>('current-user', fetchRemoteUser, {
    staleTime: 5000,
    onSuccess: (data) => addLog(`Widget 2 received data (v${data.version})`)
  });

  // Mutation with optimistic updates
  const roleMutation = useMutation(
    async (newRole: string) => {
      await new Promise((r) => setTimeout(r, 800));
      if (shouldFailMutation) {
        throw new Error('500 Internal Server Error: Mutation rejected by database rule.');
      }
      serverDatabase = {
        ...serverDatabase,
        role: newRole,
        version: serverDatabase.version + 1
      };
      return serverDatabase;
    },
    {
      onMutate: async (newRole) => {
        // Snapshot previous data for rollback
        const previousData = defaultQueryClient.getQueryData<UserProfile>('current-user');
        addLog(`⚡ Optimistic Update: Setting role to "${newRole}" before server responds`);

        // Optimistically update the query cache
        if (previousData) {
          defaultQueryClient.setQueryData<UserProfile>('current-user', {
            ...previousData,
            role: newRole
          });
        }
        return { previousData };
      },
      onSuccess: (updated) => {
        addLog(`✅ Server confirmed update (version ${updated.version})`);
        defaultQueryClient.setQueryData('current-user', updated);
      },
      onError: (err, _vars, context: any) => {
        addLog(`❌ Mutation failed! Rolling back to: "${context?.previousData?.role}"`);
        if (context?.previousData) {
          defaultQueryClient.setQueryData('current-user', context.previousData);
        }
      }
    }
  );

  const handlePromote = (role: string) => {
    roleMutation.mutate(role);
  };

  const handleInvalidate = () => {
    addLog(`🔄 Invalidating query "current-user"... Refetching all subscribers`);
    defaultQueryClient.invalidateQueries('current-user');
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">
            <Database size={20} style={{ color: 'var(--accent-emerald)' }} />
            Global Query &amp; SWR Caching (<code>useQuery</code> &amp; <code>useMutation</code>)
          </h3>
          <p className="panel-subtitle">
            Zero-dependency replacement for TanStack Query and SWR. Global request deduplication, stale-while-revalidate caching, window focus refetching, and optimistic mutations with rollback.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleInvalidate} className="btn btn-secondary">
            <RefreshCw size={15} /> Invalidate &amp; Refetch
          </button>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="comparison-grid">
        <div className="code-box standard">
          <div className="code-box-header">
            <span>Standard React (Duplicate Fetching &amp; Heavy Libs)</span>
            <span className="code-box-badge badge-bad">50KB+ TanStack or duplicate calls</span>
          </div>
          <pre className="code-content">
            <code>{`// Multiple components calling useEffect:
// -> Result: Duplicate HTTP requests fired!
// -> No global deduplication
// -> No background Stale-While-Revalidate
// -> Manual optimistic updates require 40 lines

useEffect(() => {
  fetchUser().then(setUser);
}, []);`}</code>
          </pre>
        </div>

        <div className="code-box ureact">
          <div className="code-box-header">
            <span>uReact (Unified Query &amp; SWR Cache)</span>
            <span className="code-box-badge badge-good">1.8KB Built-in Global Engine</span>
          </div>
          <pre className="code-content">
            <code>{`// Any number of components subscribe cleanly:
const { data, isLoading, isFetching } = useQuery(
  'current-user', 
  fetchUser, 
  { staleTime: 5000 }
);

// Built-in optimistic mutation:
const { mutate } = useMutation(updateUser, {
  onMutate: (newVal) => setQueryData('user', newVal)
});`}</code>
          </pre>
        </div>
      </div>

      <div className="interactive-playground">
        {/* Left: Deduplication & Subscribers */}
        <div className="widget-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 className="widget-title" style={{ margin: 0 }}>
              <Users size={18} style={{ color: 'var(--accent-cyan)' }} />
              2 Independent Subscriber Components
            </h4>
            <div className="pill" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)' }}>
              Total Network Requests: <strong>{networkRequestCount}</strong>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Both cards below are independent components calling <code>useQuery('current-user')</code>. Notice how only <strong>1 network call</strong> was dispatched!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Widget A */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  SUBSCRIBER COMPONENT #1
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>
                  {query1.data?.avatar} {query1.data?.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {query1.data?.role}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: query1.isFetching ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: query1.isFetching ? '#fbbf24' : '#34d399',
                    fontWeight: 700
                  }}
                >
                  {query1.isFetching ? 'FETCHING...' : 'CACHED'}
                </span>
              </div>
            </div>

            {/* Widget B */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                  SUBSCRIBER COMPONENT #2
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>
                  {query2.data?.avatar} {query2.data?.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {query2.data?.role}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: query2.isFetching ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: query2.isFetching ? '#fbbf24' : '#34d399',
                    fontWeight: 700
                  }}
                >
                  {query2.isFetching ? 'FETCHING...' : 'CACHED'}
                </span>
              </div>
            </div>
          </div>

          {/* Mutation Controls */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <span className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Optimistic Role Mutation (Updates UI immediately before server returns)
            </span>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {['VP of AI Systems', 'Chief Architect', 'CTO & Fellow'].map((role) => (
                <button
                  key={role}
                  disabled={roleMutation.isLoading}
                  onClick={() => handlePromote(role)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  Set: {role}
                </button>
              ))}
            </div>

            <label className="form-check">
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={shouldFailMutation}
                onChange={(e) => setShouldFailMutation(e.target.checked)}
              />
              <span style={{ fontSize: '0.82rem', color: shouldFailMutation ? 'var(--accent-rose)' : 'inherit' }}>
                Simulate Server 500 Error (Tests automatic rollback)
              </span>
            </label>
          </div>
        </div>

        {/* Right: Live SWR Telemetry & Logs */}
        <div className="widget-card">
          <h4 className="widget-title">
            <Radio size={18} style={{ color: 'var(--accent-amber)' }} />
            Live Query Telemetry &amp; SWR Activity
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <div className="chip" style={{ justifyContent: 'space-between' }}>
              <span>Status:</span>
              <strong style={{ color: 'var(--accent-cyan)' }}>{query1.status}</strong>
            </div>
            <div className="chip" style={{ justifyContent: 'space-between' }}>
              <span>isFetching:</span>
              <strong style={{ color: query1.isFetching ? 'var(--accent-amber)' : 'var(--text-dim)' }}>
                {query1.isFetching ? 'true' : 'false'}
              </strong>
            </div>
            <div className="chip" style={{ justifyContent: 'space-between' }}>
              <span>staleTime:</span>
              <strong>5000ms</strong>
            </div>
            <div className="chip" style={{ justifyContent: 'space-between' }}>
              <span>Window Focus:</span>
              <strong style={{ color: 'var(--accent-emerald)' }}>Enabled</strong>
            </div>
          </div>

          <span className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
            Real-Time Activity Log:
          </span>
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#04060a',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: '#93c5fd',
              maxHeight: '210px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {log.length === 0 ? (
              <span style={{ color: 'var(--text-dim)' }}>Waiting for query actions...</span>
            ) : (
              log.map((entry, idx) => <div key={idx}>{entry}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
