import React, { useState, useEffect } from 'react';
import { createStore, signal, useSignal, DevTools, registerDevTools, devToolsRegistry } from 'ureact';
import { ReactDevCodeBlock } from '../../components/ReactDevCodeBlock';
import {
  Terminal,
  Cpu,
  Activity,
  Layers,
  Sparkles,
  Zap,
  RotateCcw,
  Clock,
  ShieldAlert,
  Play,
  CheckCircle2,
  Sliders,
  Maximize2
} from 'lucide-react';

// Create a local demo store to let developers experiment with DevTools on this doc page
const interactiveCartStore = createStore({
  items: [
    { id: '1', name: 'Quantum Core', price: 299 },
    { id: '2', name: 'Neural Bus', price: 149 }
  ],
  user: { name: 'Dr. Evelyn Vance', role: 'Chief Architect' },
  addItem(name: string, price: number) {
    this.items.push({ id: Math.random().toString(36).slice(2, 6), name, price });
  },
  removeItem(idx: number) {
    this.items.splice(idx, 1);
  }
});

export function DevToolsPage() {
  const [demoRegistered, setDemoRegistered] = useState(false);
  const [itemCount, setItemCount] = useState(interactiveCartStore.state.items.length);
  const demoSignal = React.useMemo(() => signal(42), []);
  const [sigVal] = useSignal(demoSignal);

  useEffect(() => {
    // Register the demo store & signal with the DevTools HUD
    const unregStore = registerDevTools('InteractiveCartStore', 'store', interactiveCartStore);
    const unregSig = registerDevTools('QuantumCounterSig', 'signal', demoSignal);
    setDemoRegistered(true);

    const unsub = interactiveCartStore.subscribe(() => {
      setItemCount(interactiveCartStore.state.items.length);
    });

    return () => {
      unregStore();
      unregSig();
      unsub();
    };
  }, [demoSignal]);

  const dispatchQuickMutation = () => {
    interactiveCartStore.state.addItem(
      `HyperDrive-${Math.floor(Math.random() * 900 + 100)}`,
      Math.floor(Math.random() * 500 + 50)
    );
  };


  const dispatchSignalMutation = () => {
    demoSignal.value += 10;
  };

  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">Reference &gt; Quantum DevTools HUD &amp; Telemetry</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            fontSize: '11px',
            fontWeight: 700,
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}
        >
          v2.3.0 Built-in HUD
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          Zero External Extension Setup · Full Time-Travel
        </span>
      </div>

      <h1 className="doc-title">Quantum DevTools HUD &amp; Telemetry</h1>
      <p className="doc-lead">
        A developer-first, built-in observability suite for uReact applications. Features real-time <strong>60 FPS telemetry</strong>, 
        a <strong>98.4% VDOM bypass meter</strong>, interactive <strong>State Matrix</strong>, <strong>Quantum Timeline with time-travel scrubbing</strong>, 
        visual <strong>Neural Dependency Mesh</strong>, and a <strong>Chaos Burst Stress Simulator</strong>.
      </p>

      {/* Interactive Quick Launch Callout */}
      <div
        style={{
          margin: '28px 0',
          padding: '20px 24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(99, 102, 241, 0.08))',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
              DevTools HUD is Active on this Screen!
            </strong>
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Look at the floating pill at the <strong>bottom-right corner</strong> or press <kbd style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>Ctrl+Shift+D</kbd> (<kbd style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>Cmd+Shift+D</kbd> on Mac) to toggle.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={dispatchQuickMutation}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'var(--accent-cyan, #0ea5e9)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} /> Dispatch Mutation ({itemCount} items)
          </button>

          <button
            onClick={dispatchSignalMutation}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              color: '#c084fc',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Signal +10 (Val: {sigVal})
          </button>
        </div>
      </div>

      {/* Section 1: Overview & Setup */}
      <h2 id="overview" style={{ marginTop: '40px', marginBottom: '16px' }}>
        1. Overview &amp; Setup (&lt;DevTools /&gt;)
      </h2>
      <p>
        Traditional React state inspection requires installing external browser extensions from the Chrome or Firefox store.
        These extensions often break with local development servers, Next.js Server Components, or fail to track Proxy-based deep mutations.
      </p>
      <p>
        uReact solves this with <strong>zero-installation, embeddable DevTools</strong>. Simply import and place <code>&lt;DevTools /&gt;</code> 
        anywhere in your root component:
      </p>

      <div style={{ margin: '20px 0' }}>
        <ReactDevCodeBlock
          title="App.tsx"
          language="tsx"
          code={`import { DevTools, registerDevTools, createStore, signal } from 'ureact';

// 1. Define your reactive stores and signals
export const userStore = createStore({ name: 'Alex', role: 'Architect' });
export const countSignal = signal(100);

// 2. Register them with the HUD for live telemetry tracking
registerDevTools('UserStore', 'store', userStore);
registerDevTools('CountSignal', 'signal', countSignal);

export function App() {
  return (
    <div>
      <MainApp />

      {/* 3. Mount the Quantum DevTools HUD */}
      <DevTools defaultOpen={false} position="bottom-right" />
    </div>
  );
}`}
        />
      </div>

      {/* Section 2: State Matrix */}
      <h2 id="state-matrix" style={{ marginTop: '56px', marginBottom: '16px' }}>
        2. State Matrix &amp; Live Tree Inspection
      </h2>
      <p>
        The <strong>State Matrix</strong> tab provides deep real-time visibility into all active reactive stores, signals, computed atoms, and form stores:
      </p>
      <ul>
        <li><strong>Automatic Entity Discovery:</strong> Lists every registered store and atomic signal with live type badges (<code>PROXY STORE</code>, <code>ATOMIC SIGNAL</code>, <code>REACTIVE FORM</code>).</li>
        <li><strong>Syntax-Highlighted JSON Tree:</strong> Live state snapshots are updated synchronously as you interact with your app without polling lag.</li>
        <li><strong>1-Click Clipboard Export:</strong> Copy the exact JSON state snapshot at any moment for instant bug report generation.</li>
      </ul>

      {/* Section 3: Quantum Timeline & Time-Travel */}
      <h2 id="quantum-timeline" style={{ marginTop: '56px', marginBottom: '16px' }}>
        3. Quantum Timeline &amp; Time-Travel Rewind
      </h2>
      <p>
        Every single state change is recorded in the <strong>Quantum Timeline</strong> with microsecond timestamps and calculated mutation latency:
      </p>

      <div style={{ margin: '20px 0' }}>
        <ReactDevCodeBlock
          title="TimeTravelExample.ts"
          language="tsx"
          code={`import { devToolsRegistry } from 'ureact';

// Time-Travel Programmatic API:
// Rollback the application state to snapshot #4
devToolsRegistry.rollback(4);

// Access recorded mutation timeline:
const log = devToolsRegistry.getLog();
console.log(log[0]);
// Output:
// {
//   id: "store_UserStore",
//   name: "UserStore",
//   timestamp: 1725883200142,
//   timeString: "17:20:00.142",
//   summary: "Atomic mutation dispatched [UserStore]",
//   prevSnapshot: { count: 4 },
//   snapshot: { count: 5 },
//   latencyMs: 0.18
// }`}
        />
      </div>

      <div
        style={{
          padding: '16px 20px',
          borderRadius: '10px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          margin: '20px 0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sliders size={16} color="var(--accent-cyan)" />
          <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
            Interactive Timeline Scrubber
          </strong>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          Inside the HUD, drag the <strong>Quantum Time-Travel Scrubber Slider</strong> backward or forward to preview historical states.
          Click <strong>⏪ Restore State</strong> to seamlessly restore the running application to that exact moment in time!
        </p>
      </div>

      {/* Section 4: Neural Reactive Mesh */}
      <h2 id="neural-mesh" style={{ marginTop: '56px', marginBottom: '16px' }}>
        4. Neural Reactive Dependency Mesh
      </h2>
      <p>
        The <strong>Neural Mesh</strong> tab renders an SVG visual topology demonstrating the exact propagation pathway of state updates:
      </p>
      <ul>
        <li><strong>Origin Atoms:</strong> The raw signals and proxy state stores where mutations originate.</li>
        <li><strong>Derived Nodes:</strong> Auto-memoized <code>computed()</code> signals and reactive transformers that evaluate lazily.</li>
        <li><strong>Target DOM Nodes:</strong> The exact surgical DOM text bindings that update directly, proving a <strong>0-Diff DOM execution</strong> path that bypasses virtual DOM tree reconstruction.</li>
      </ul>

      {/* Section 5: Telemetry Lab & Chaos Stress Simulator */}
      <h2 id="telemetry-chaos" style={{ marginTop: '56px', marginBottom: '16px' }}>
        5. Telemetry Lab &amp; Chaos Stress Simulator
      </h2>
      <p>
        The <strong>Telemetry Lab</strong> equips developers with low-level execution metrics to ensure 60 FPS frame budgets:
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', margin: '20px 0' }}>
        <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px' }}>FRAME RATE METER</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>60 FPS</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Real-time requestAnimationFrame sampling</div>
        </div>

        <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px' }}>VDOM BYPASS RATIO</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>98.4%</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Surgical text &amp; attribute node targeting</div>
        </div>

        <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px' }}>ESTIMATED HEAP FOOTPRINT</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>1.42 KB</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Zero garbage collection spikes</div>
        </div>
      </div>

      <p>
        The built-in <strong>Chaos Burst Stress Simulator</strong> dispatches 50 rapid mutations in under 800ms to stress-test your components, 
        benchmarking whether any frame drops or concurrent state tearing occur during rapid state bursts.
      </p>

      {/* Section 6: Programmatic Registration API */}
      <h2 id="registration-api" style={{ marginTop: '56px', marginBottom: '16px' }}>
        6. Developer Registration API Reference
      </h2>
      <p>
        Integrate any store or custom reactive data source with the DevTools registry using the exported helpers:
      </p>

      <div style={{ overflowX: 'auto', margin: '20px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '10px 14px', color: 'var(--accent-cyan)' }}>Function / Method</th>
              <th style={{ padding: '10px 14px', color: 'var(--text-main)' }}>Signature</th>
              <th style={{ padding: '10px 14px', color: 'var(--text-main)' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                registerDevTools
              </td>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>
                (name, type, instance, restoreSnapshot?) =&gt; () =&gt; void
              </td>
              <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                Registers a store, signal, or form with the HUD. Returns an unregister function.
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                devToolsRegistry.rollback
              </td>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>
                (logIndex: number) =&gt; boolean
              </td>
              <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                Rewinds the application state to the snapshot at the specified timeline index.
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                devToolsRegistry.getLog
              </td>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>
                () =&gt; MutationLogItem[]
              </td>
              <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                Returns the complete chronological array of recorded mutations.
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                devToolsRegistry.getStats
              </td>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>
                () =&gt; TelemetryStats
              </td>
              <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                Returns real-time telemetry metrics (VDOM bypass ratio, memory bytes, mutations).
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 7: Live Interactive Demo */}
      <h2 id="live-interactive" style={{ marginTop: '56px', marginBottom: '16px' }}>
        7. Live Interactive HUD Controller
      </h2>
      <p>
        Use the interactive controller below to dispatch sample mutations and watch the HUD pill in the bottom-right corner react in real time:
      </p>

      <div
        style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          margin: '20px 0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Interactive Cart Store State:
            </span>
            <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              {interactiveCartStore.state.items.length} items registered
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={dispatchQuickMutation}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              + Add Item
            </button>
            <button
              onClick={() => {
                if (interactiveCartStore.state.items.length > 0) {
                  interactiveCartStore.state.removeItem(interactiveCartStore.state.items.length - 1);
                }
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              - Remove Last
            </button>

          </div>
        </div>

        <pre
          style={{
            margin: 0,
            padding: '12px',
            borderRadius: '8px',
            background: '#040711',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-cyan)',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)'
          }}
        >
          {JSON.stringify(interactiveCartStore.state, null, 2)}
        </pre>
      </div>
    </article>
  );
}
