import React, { useState, Suspense, startTransition } from 'react';
import { usePromise, useDeferred, useActionTransition } from 'ureact';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { Zap, Clock, RotateCcw, Loader2, RefreshCw } from 'lucide-react';

function createAsyncGreeting() {
  const p: any = new Promise<{ message: string; timestamp: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        message: 'Successfully resolved via React 19 use(Promise) inside a Suspense boundary!',
        timestamp: new Date().toLocaleTimeString()
      });
    }, 800);
  });
  p.status = 'pending';
  p.then(
    (res: any) => { p.status = 'fulfilled'; p.value = res; },
    (err: any) => { p.status = 'rejected'; p.reason = err; }
  );
  return p as Promise<{ message: string; timestamp: string }>;
}

function AsyncGreetingCard({ promise }: { promise: Promise<{ message: string; timestamp: string }> }) {
  const data = usePromise(promise);
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '8px',
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        color: 'var(--accent-cyan)'
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: '4px' }}>{data.message}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        Rendered at {data.timestamp} • No useEffect or useState needed!
      </div>
    </div>
  );
}

const LiveAsyncWidget = () => {
  const [promise, setPromise] = useState(() => createAsyncGreeting());
  const [search, setSearch] = useState('React 19 Concurrent');
  const deferred = useDeferred(search, 'Initial Value');
  const transition = useActionTransition();
  const [transitionStatus, setTransitionStatus] = useState<string | null>(null);

  const retrigger = () => {
    startTransition(() => {
      setPromise(createAsyncGreeting());
    });
  };

  const runAsync = () => {
    transition.run(async () => {
      setTransitionStatus('⏳ Async transition processing in background lane...');
      await new Promise((r) => setTimeout(r, 900));
      setTransitionStatus(`✓ Completed at ${new Date().toLocaleTimeString()}`);
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '20px' }}>
      <div className="widget-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, color: 'var(--accent-cyan)' }}>1. use(Promise) with &lt;Suspense&gt;</h4>
          <button onClick={retrigger} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            <RotateCcw size={12} /> Re-fetch Promise
          </button>
        </div>

        <Suspense
          fallback={
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={16} className="animate-spin" style={{ margin: '0 auto 6px' }} />
              <div>Suspended by React 19 use() hook... resolving promise</div>
            </div>
          }
        >
          <AsyncGreetingCard promise={promise} />
        </Suspense>
      </div>

      <div className="widget-card">
        <h4 style={{ margin: 0, color: 'var(--accent-amber)', marginBottom: '12px' }}>
          2. Async Transition &amp; useDeferred
        </h4>
        <input
          type="text"
          className="input-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type to test useDeferred..."
          style={{ marginBottom: '8px' }}
        />
        <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', marginBottom: '12px' }}>
          Deferred value: <strong>"{deferred}"</strong>
        </div>

        <button
          onClick={runAsync}
          disabled={transition.isPending}
          className="btn btn-primary"
          style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent-amber), #d97706)', color: '#000' }}
        >
          {transition.isPending ? 'Transitioning...' : 'Trigger Async Transition'}
        </button>

        {transitionStatus && (
          <div style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--accent-amber)' }}>
            {transitionStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export function React19AsyncPage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">React 19 Native Engine &gt; use(Promise) &amp; Suspense</div>

      <h1 className="doc-title">use(Promise) &amp; Suspense</h1>
      <p className="doc-lead">
        React 19 introduces the first-class <strong>use()</strong> API to resolve promises directly during render. No <code>useEffect</code>, no manual loading boolean states, and no cancellation tokens are needed.
      </p>

      <h2 id="use-promise">1. Reading Promises with usePromise</h2>
      <p>
        Simply pass a promise to <code>usePromise(promise)</code> inside a component wrapped by a <code>&lt;Suspense&gt;</code> boundary:
      </p>

      <CodeBlock
        code={`import { Suspense } from 'react';
import { usePromise } from 'ureact';

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  // Resolves promise directly during render!
  const user = usePromise(userPromise);
  return <div>Hello, {user.name}!</div>;
}

export function Page({ userPromise }) {
  return (
    <Suspense fallback={<div>Loading user profile...</div>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}`}
        language="tsx"
        title="UserProfile.tsx"
        showLineNumbers
      />

      <Callout type="tip" title="Context Support">
        The same <code>use()</code> API can also read React Context conditionally (e.g. inside <code>if</code> blocks or loops), which was impossible with <code>useContext()</code>!
      </Callout>

      <h2 id="live-demo">2. Interactive Live Demo</h2>
      <LiveAsyncWidget />
    </article>
  );
}
