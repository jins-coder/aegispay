import React, { useState, Suspense, startTransition } from 'react';
import {
  useAction,
  useActionStatus,
  usePromise,
  useDeferred,
  useActionTransition,
  resetForm,
  preload,
  preconnect,
  prefetchDNS,
  Head,
  ActionButton
} from 'ureact';
import {
  Zap,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Globe,
  Radio,
  Clock,
  RotateCcw,
  Network,
  Search,
  Check,
  RefreshCw,
  LayoutGrid
} from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isOptimistic?: boolean;
}

// Child component testing React 19 useFormStatus safely
function ActionSubmitButton({ isActionPending }: { isActionPending?: boolean }) {
  const status = useActionStatus();
  const pending = status?.pending || isActionPending;

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary"
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" /> Saving with React 19...
        </>
      ) : (
        <>
          <Send size={16} /> Post Comment (React 19 Action)
        </>
      )}
    </button>
  );
}

// Simulated promise generator for React 19 use(Promise) demo
function createDataPromise() {
  const promise = new Promise<{ message: string; timestamp: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        message: 'Resolved via React 19 use(Promise) inside a Suspense boundary!',
        timestamp: new Date().toLocaleTimeString()
      });
    }, 800);
  });

  const p: any = promise;
  p.status = 'pending';
  p.then(
    (res: any) => {
      p.status = 'fulfilled';
      p.value = res;
    },
    (err: any) => {
      p.status = 'rejected';
      p.reason = err;
    }
  );
  return p as Promise<{ message: string; timestamp: string }>;
}

function SuspendedResource({ promise }: { promise: Promise<any> }) {
  const result = usePromise(promise);
  if (!result) return null;

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: 'var(--accent-cyan-bg)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--accent-cyan)'
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>{result.message}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        Rendered at: {result.timestamp} • No useEffect or useState needed!
      </div>
    </div>
  );
}

export function React19Demo() {
  const [activeTab, setActiveTab] = useState<'all' | 'actions' | 'suspense' | 'preloads' | 'transitions'>('all');
  const [authorInput, setAuthorInput] = useState('Alex');
  const [commentInput, setCommentInput] = useState('');
  const [pageTitle, setPageTitle] = useState('uReact v2.1 — Powered by React 19');
  const [resourcePromise, setResourcePromise] = useState(() => createDataPromise());

  // React 19 Resource Preloading Feedback
  const [preloadStatus, setPreloadStatus] = useState<string | null>(null);

  // React 19 Enhanced useDeferred with initialValue
  const [queryInput, setQueryInput] = useState('React 19 Server Actions');
  const deferredQuery = useDeferred(queryInput, 'Initial Query');

  // React 19 Async useActionTransition
  const asyncTransition = useActionTransition();
  const [transitionResult, setTransitionResult] = useState<string | null>(null);

  // React 19 useAction with automatic useOptimistic
  const action = useAction<
    { author: string; text: string },
    Comment[]
  >(
    async (prev, input) => {
      // Simulate server network latency
      await new Promise((r) => setTimeout(r, 800));

      const newComment: Comment = {
        id: Math.random().toString(36).substring(7),
        author: input.author,
        text: input.text,
        timestamp: new Date().toLocaleTimeString()
      };

      return [...prev, newComment];
    },
    [
      { id: '1', author: 'Dan', text: 'React 19 Actions and useOptimistic are incredible.', timestamp: '10:14 AM' },
      { id: '2', author: 'Sophie', text: 'uReact makes the React 19 API 10x easier to write.', timestamp: '10:22 AM' }
    ],
    {
      // React 19 useOptimistic handler: instant UI feedback!
      optimisticUpdate: (prev, input) => [
        ...prev,
        {
          id: 'optimistic-temp',
          author: input.author,
          text: input.text,
          timestamp: 'Sending now...',
          isOptimistic: true
        }
      ]
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    action.run({ author: authorInput, text: commentInput });
    setCommentInput('');
  };

  const handleRetriggerPromise = () => {
    startTransition(() => {
      setResourcePromise(createDataPromise());
    });
  };

  const handlePreloadFont = () => {
    preload('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans&display=swap', { as: 'style' });
    setPreloadStatus('✓ preload("https://fonts.googleapis.com/...", { as: "style" }) triggered');
    setTimeout(() => setPreloadStatus(null), 3500);
  };

  const handlePreconnectAPI = () => {
    preconnect('https://api.github.com', { crossOrigin: 'anonymous' });
    prefetchDNS('https://cdn.jsdelivr.net');
    setPreloadStatus('✓ preconnect("https://api.github.com") and prefetchDNS("https://cdn.jsdelivr.net") dispatched');
    setTimeout(() => setPreloadStatus(null), 3500);
  };

  const handleRunAsyncTransition = () => {
    asyncTransition.run(async () => {
      setTransitionResult('⏳ Transition running in background concurrent lane...');
      await new Promise((r) => setTimeout(r, 1000));
      setTransitionResult(`✓ Async transition completed at ${new Date().toLocaleTimeString()}`);
    });
  };

  return (
    <div className="sandbox-shell">
      {/* React 19 Native Document Metadata Hoisting */}
      <Head title={pageTitle} description="uReact v2.1 powered natively by React 19 engine" />

      {/* Sleek react.dev Sandbox Header */}
      <div className="sandbox-header">
        <div>
          <div className="sandbox-title-row">
            <div className="sandbox-icon-badge">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="sandbox-title">React 19 Native Primitives Suite</h3>
            </div>
          </div>
          <p className="sandbox-subtitle">
            Interactive live runtime for React 19 Actions, optimistic mutations, Suspense resources, asset preloading, and concurrent transitions.
          </p>
          <div className="sandbox-chips">
            <span className="sandbox-chip">useAction</span>
            <span className="sandbox-chip">useOptimistic</span>
            <span className="sandbox-chip">use(Promise)</span>
            <span className="sandbox-chip">&lt;Head&gt;</span>
            <span className="sandbox-chip">preload()</span>
            <span className="sandbox-chip">useDeferred</span>
          </div>
        </div>

        <div className="sandbox-live-pill">
          <span className="sandbox-pulse-dot"></span>
          <span>React 19 Engine Active</span>
        </div>
      </div>

      {/* Interactive Tabs Navigation */}
      <div className="sandbox-nav">
        <button
          className={`sandbox-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <LayoutGrid size={15} /> All Primitives
        </button>
        <button
          className={`sandbox-tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <MessageSquare size={15} /> 1. useAction &amp; useOptimistic
        </button>
        <button
          className={`sandbox-tab ${activeTab === 'suspense' ? 'active' : ''}`}
          onClick={() => setActiveTab('suspense')}
        >
          <Globe size={15} /> 2. &lt;Head&gt; &amp; use(Promise)
        </button>
        <button
          className={`sandbox-tab ${activeTab === 'preloads' ? 'active' : ''}`}
          onClick={() => setActiveTab('preloads')}
        >
          <Network size={15} /> 3. Resource Preloads
        </button>
        <button
          className={`sandbox-tab ${activeTab === 'transitions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transitions')}
        >
          <RefreshCw size={15} /> 4. Async Transitions
        </button>
      </div>

      {/* Sandbox Body Content */}
      <div className="sandbox-content">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: activeTab === 'all' ? 'repeat(auto-fit, minmax(380px, 1fr))' : '1fr',
            gap: '20px'
          }}
        >
          {/* Widget 1: React 19 Actions & useOptimistic */}
          {(activeTab === 'all' || activeTab === 'actions') && (
            <div className="widget-card">
              <div className="widget-card-header">
                <h4 className="widget-title">
                  <MessageSquare size={18} style={{ color: 'var(--accent-cyan)' }} />
                  1. React 19 Actions &amp; <code>useOptimistic</code>
                </h4>
                <span className="badge-ureact">Instant UI</span>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                Submitting immediately renders optimistic feedback before network resolution with automatic rollback on error.
              </p>

              <form
                action={async () => {
                  if (!commentInput.trim()) return;
                  await action.run({ author: authorInput, text: commentInput });
                  setCommentInput('');
                }}
                onSubmit={handleSubmit}
                style={{ marginBottom: '16px' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Author"
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Write a comment..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {action.isPending ? '⚡ React 19 Action Transitioning...' : 'Ready'}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => action.run({ author: 'Tester', text: `Optimistic update at ${new Date().toLocaleTimeString()}` })}
                      disabled={action.isPending}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                    >
                      + Quick Add
                    </button>
                    <ActionSubmitButton isActionPending={action.isPending} />
                  </div>
                </div>
              </form>

              {/* Comment list with optimistic indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {(action.data || []).map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: c.isOptimistic ? 'var(--accent-cyan-bg)' : 'var(--bg-secondary)',
                      border: c.isOptimistic ? '1px dashed var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{c.author}</span>
                        {c.isOptimistic && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: 'var(--accent-cyan)',
                              color: '#031327'
                            }}
                          >
                            OPTIMISTIC (Instant)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '3px' }}>{c.text}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Widget 2: React 19 Document Metadata & use(Promise) */}
          {(activeTab === 'all' || activeTab === 'suspense') && (
            <div className="widget-card">
              <div className="widget-card-header">
                <h4 className="widget-title">
                  <Globe size={18} style={{ color: 'var(--accent-indigo)' }} />
                  2. Native React 19 Metadata &amp; <code>use(Promise)</code>
                </h4>
                <span className="badge-standard" style={{ color: 'var(--accent-indigo)', borderColor: 'rgba(79, 70, 229, 0.3)', background: 'rgba(79, 70, 229, 0.08)' }}>Suspense 19</span>
              </div>

              {/* Metadata Hoisting demo */}
              <div style={{ marginBottom: '18px' }}>
                <span className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                  Native React 19 <code>&lt;Head&gt;</code> Document Hoisting:
                </span>
                <input
                  type="text"
                  className="input-field"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="Edit page title..."
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', padding: '6px 10px', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Browser Tab Preview:</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📄 {pageTitle}
                  </span>
                </div>
              </div>

              {/* React 19 use(Promise) Suspense demo */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="form-label" style={{ margin: 0 }}>
                    React 19 <code>use(Promise)</code> with <code>&lt;Suspense&gt;</code>:
                  </span>
                  <button
                    onClick={handleRetriggerPromise}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RotateCcw size={12} /> Re-trigger Promise
                  </button>
                </div>

                <Suspense
                  fallback={
                    <div
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px dashed var(--border-subtle)',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <Loader2 size={16} className="animate-spin" style={{ marginBottom: '4px', margin: '0 auto 4px' }} />
                      <div>Suspended by React 19 use() hook... resolving promise</div>
                    </div>
                  }
                >
                  <SuspendedResource promise={resourcePromise} />
                </Suspense>
              </div>
            </div>
          )}

          {/* Widget 3: React 19 Resource Preloading (preload, preconnect, prefetchDNS) */}
          {(activeTab === 'all' || activeTab === 'preloads') && (
            <div className="widget-card">
              <div className="widget-card-header">
                <h4 className="widget-title">
                  <Network size={18} style={{ color: 'var(--accent-emerald)' }} />
                  3. React 19 Resource Preloading Helpers
                </h4>
                <span className="badge-standard" style={{ color: 'var(--accent-emerald)', borderColor: 'rgba(5, 150, 105, 0.3)', background: 'rgba(5, 150, 105, 0.08)' }}>DOM Hints</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                Built-in React 19 DOM helpers to warm up connections, prefetch DNS, and preload critical assets before navigation:
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <button
                  onClick={handlePreloadFont}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  <code>preload('font/css', 'style')</code>
                </button>
                <button
                  onClick={handlePreconnectAPI}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  <code>preconnect()</code> &amp; <code>prefetchDNS()</code>
                </button>
              </div>

              {preloadStatus && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'var(--accent-emerald)',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  {preloadStatus}
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ✓ Injects canonical <code>&lt;link rel="..."&gt;</code> tags into <code>&lt;head&gt;</code> without hydration mismatches.
              </div>
            </div>
          )}

          {/* Widget 4: Async Transition & Enhanced useDeferred */}
          {(activeTab === 'all' || activeTab === 'transitions') && (
            <div className="widget-card">
              <div className="widget-card-header">
                <h4 className="widget-title">
                  <RefreshCw size={18} style={{ color: 'var(--accent-amber)' }} />
                  4. Async <code>useActionTransition</code> &amp; <code>useDeferred</code>
                </h4>
                <span className="badge-standard" style={{ color: 'var(--accent-amber)', borderColor: 'rgba(217, 119, 6, 0.3)', background: 'rgba(217, 119, 6, 0.08)' }}>Concurrent</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                React 19 supports async functions directly in transitions, and <code>useDeferred</code> with initial fallbacks:
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ marginBottom: '4px', display: 'block' }}>
                  Enhanced <code>useDeferred(val, initial)</code>:
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Type search query..."
                />
                <div style={{ marginTop: '6px', fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
                  Deferred value: <strong>"{deferredQuery}"</strong>
                </div>
              </div>

              <div>
                <button
                  onClick={handleRunAsyncTransition}
                  disabled={asyncTransition.isPending}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, var(--accent-amber), #d97706)',
                    color: '#000',
                    fontWeight: 700
                  }}
                >
                  {asyncTransition.isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Running Async Transition...
                    </>
                  ) : (
                    'Trigger React 19 Async Transition'
                  )}
                </button>

                {transitionResult && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: 'var(--accent-amber)',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}
                  >
                    {transitionResult}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
