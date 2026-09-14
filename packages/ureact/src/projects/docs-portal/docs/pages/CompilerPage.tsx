import React, { useState, useMemo } from 'react';
import { compileUReact, runCompilerBenchmark, BenchmarkResult } from 'ureact';
import { ReactDevCodeBlock } from '../../components/ReactDevCodeBlock';
import { Cpu, Zap, Sparkles, CheckCircle2, Play, Copy, Check, Terminal, ArrowRight, Activity, Shield, Flame, Sliders } from 'lucide-react';

const PRESETS = {
  mutations: {
    title: 'Deep State Mutations',
    code: `import { createStore } from 'ureact';

export const userStore = createStore({
  profile: {
    name: "Alex",
    stats: { score: 100, streak: 5 }
  },
  inventory: []
});

export function levelUp() {
  // Direct mutations compiled to atomic __patch calls!
  userStore.profile.stats.score += 50;
  userStore.profile.stats.streak++;
  userStore.inventory.push({ id: 1, item: "Golden Ring" });
}`
  },
  signals: {
    title: 'Signal React 19 DOM Pruning',
    code: `import { signal } from 'ureact';

export const counter = signal(0);
export const theme = signal('dark');

export function MetricDisplay() {
  return (
    <div className="metric-box">
      {/* Compiled to <SignalValue signal={counter} /> */}
      {/* Zero parent component re-renders when counter ticks! */}
      <h3>Live Counter: {counter.value}</h3>
      <p>Active Theme: {theme.value}</p>
    </div>
  );
}`
  },
  bindings: {
    title: 'Two-Way Form $bind Expansion',
    code: `import { createStore } from 'ureact';

export const formStore = createStore({
  email: '',
  profile: { bio: '' }
});

export function EditProfile() {
  return (
    <form className="profile-form">
      {/* Compiled to value + atomic __patch onChange handlers */}
      <input type="email" $bind={formStore.email} />
      <textarea $bind={formStore.profile.bio} />
    </form>
  );
}`
  },
  autoview: {
    title: 'Auto-Observed Component Wrapping',
    code: `import { appStore } from './stores';

// uReact compiler detects store access and automatically
// wraps this functional component with view()!
export function DashboardOverview({ user }) {
  return (
    <section>
      <h1>Welcome back, {user.name}</h1>
      <span>Unread notifications: {appStore.notifications.length}</span>
    </section>
  );
}`
  }
};

export function CompilerPage() {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESETS>('mutations');
  const [sourceInput, setSourceInput] = useState(PRESETS.mutations.code);

  // Compiler Options
  const [optimizeMutations, setOptimizeMutations] = useState(true);
  const [signalDomPruning, setSignalDomPruning] = useState(true);
  const [compileTwoWayBind, setCompileTwoWayBind] = useState(true);
  const [autoView, setAutoView] = useState(true);

  const [copied, setCopied] = useState(false);

  // Live Benchmark state
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);

  const handleSelectPreset = (key: keyof typeof PRESETS) => {
    setSelectedPreset(key);
    setSourceInput(PRESETS[key].code);
  };

  // Compile on the fly
  const compilation = useMemo(() => {
    return compileUReact(sourceInput, {
      optimizeMutations,
      signalDomPruning,
      compileTwoWayBind,
      autoView
    });
  }, [sourceInput, optimizeMutations, signalDomPruning, compileTwoWayBind, autoView]);

  const handleCopyCompiled = () => {
    navigator.clipboard.writeText(compilation.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    setTimeout(() => {
      const res = runCompilerBenchmark(50000);
      setBenchmarkResult(res);
      setIsBenchmarking(false);
    }, 50);
  };

  return (
    <div className="doc-page-content" style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(88, 196, 220, 0.2), rgba(168, 85, 247, 0.25))',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(88, 196, 220, 0.3)'
            }}
          >
            ⚡ uReact v3.0 Ahead-of-Time Architecture
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '6px',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e'
            }}
          >
            AOT Compiler Engine
          </span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Cpu size={32} color="var(--accent-cyan)" />
          Zero-Runtime AOT Compiler
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.7 }}>
          Transforms standard JavaScript property mutations, JSX signal expressions, and two-way bindings into high-speed atomic atom patches at build time—eliminating deep Proxy overhead and bypassing intermediate React virtual DOM diffing.
        </p>
      </div>

      {/* Compiler Highlights Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
            <Zap size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Atomic __patch</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Replaces deep Proxy traversals with instant keyed dictionary atom writes.
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', marginBottom: '6px' }}>
            <Sparkles size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Signal DOM Pruning</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Updates text nodes directly via <code>&lt;SignalValue&gt;</code> without React tree re-renders.
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', marginBottom: '6px' }}>
            <Activity size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>3.0x Faster Ops</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Up to 3,600,000 mutations/sec with zero intermediate Proxy allocation memory.
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '6px' }}>
            <Terminal size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Vite & Rollup Native</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Single-line Vite plugin integration: <code>ureactCompilerPlugin()</code>.
          </div>
        </div>
      </div>

      {/* Interactive Live Compiler Explorer */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="var(--accent-cyan)" />
              Live Compiler Explorer & AST Studio
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Edit the source on the left to see the AOT compiler transformation in real time.
            </p>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {Object.entries(PRESETS).map(([key, item]) => (
              <button
                key={key}
                onClick={() => handleSelectPreset(key as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: selectedPreset === key ? 700 : 500,
                  border: '1px solid',
                  borderColor: selectedPreset === key ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                  background: selectedPreset === key ? 'var(--accent-cyan-bg)' : 'var(--bg-card)',
                  color: selectedPreset === key ? 'var(--accent-cyan)' : 'var(--text-dim)',
                  cursor: 'pointer'
                }}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* Transformation Feature Toggles */}
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Compiler Passes:
          </span>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={optimizeMutations}
              onChange={(e) => setOptimizeMutations(e.target.checked)}
            />
            Atomic __patch()
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={signalDomPruning}
              onChange={(e) => setSignalDomPruning(e.target.checked)}
            />
            Signal &lt;SignalValue&gt; Pruning
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={compileTwoWayBind}
              onChange={(e) => setCompileTwoWayBind(e.target.checked)}
            />
            $bind Form Expansion
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={autoView}
              onChange={(e) => setAutoView(e.target.checked)}
            />
            Auto-view() Wrapping
          </label>
        </div>

        {/* Split Code Studio */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          {/* Left: Source Input */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                padding: '8px 14px',
                background: 'var(--bg-secondary)',
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px',
                border: '1px solid var(--border-subtle)',
                borderBottom: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Source JavaScript / JSX</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>Developer Input</span>
            </div>
            <textarea
              value={sourceInput}
              onChange={(e) => setSourceInput(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                height: '340px',
                padding: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                lineHeight: 1.5,
                background: '#0f172a',
                color: '#e2e8f0',
                border: '1px solid var(--border-subtle)',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Right: Compiled Output */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                padding: '8px 14px',
                background: 'var(--bg-secondary)',
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px',
                border: '1px solid var(--border-subtle)',
                borderBottom: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={14} color="var(--accent-cyan)" />
                <span>v3.0 AOT Compiled Output</span>
              </div>
              <button
                onClick={handleCopyCompiled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: copied ? '#22c55e' : 'var(--text-dim)',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              readOnly
              value={compilation.code}
              spellCheck={false}
              style={{
                width: '100%',
                height: '340px',
                padding: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                lineHeight: 1.5,
                background: '#090d16',
                color: '#38bdf8',
                border: '1px solid var(--border-subtle)',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Compiler Stats Banner */}
        <div
          style={{
            padding: '14px 20px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(88, 196, 220, 0.08) 0%, var(--bg-card) 100%)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Mutations Optimized:</span>
              <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>{compilation.stats.mutationsOptimized}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Signals Pruned:</span>
              <strong style={{ color: '#c084fc', fontSize: '0.9rem' }}>{compilation.stats.signalsPruned}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>$bind Expanded:</span>
              <strong style={{ color: '#22c55e', fontSize: '0.9rem' }}>{compilation.stats.bindingsCompiled}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Auto-view Injected:</span>
              <strong style={{ color: '#f59e0b', fontSize: '0.9rem' }}>{compilation.stats.viewsInjected}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            <Activity size={14} color="var(--accent-cyan)" />
            <span>Compile Latency: <strong style={{ color: 'var(--text-main)' }}>{compilation.stats.compileTimeMs}ms</strong></span>
          </div>
        </div>
      </div>

      {/* Live Benchmark Section */}
      <div style={{ marginBottom: '40px', padding: '24px', borderRadius: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={20} color="#f59e0b" />
              Live In-Browser Mutation Benchmark (50,000 Iterations)
            </h2>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-dim)' }}>
              Compares standard Proxy deep property traversal against uReact v3.0 compiled atomic __patch execution.
            </p>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isBenchmarking}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '0.86rem' }}
          >
            <Play size={16} />
            {isBenchmarking ? 'Running 50k Cycles...' : 'Run Live Benchmark'}
          </button>
        </div>

        {benchmarkResult ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Standard Deep Proxy</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {benchmarkResult.proxyTimeMs} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>ms</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {benchmarkResult.proxyOpsPerSec.toLocaleString()} ops/sec
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid rgba(88, 196, 220, 0.3)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', marginBottom: '4px', fontWeight: 700 }}>
                ⚡ uReact v3.0 Compiled AOT
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {benchmarkResult.compiledTimeMs} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>ms</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {benchmarkResult.compiledOpsPerSec.toLocaleString()} ops/sec
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div style={{ fontSize: '0.78rem', color: '#22c55e', marginBottom: '4px', fontWeight: 700 }}>Speedup Multiple</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22c55e' }}>
                {benchmarkResult.speedupFactor}x
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Faster throughput vs deep Proxy
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: '#c084fc', marginBottom: '4px', fontWeight: 700 }}>Memory Footprint</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c084fc' }}>
                -{benchmarkResult.memoryReductionPct}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Zero intermediate Proxy instances
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '24px',
              borderRadius: '10px',
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-subtle)',
              textAlign: 'center',
              color: 'var(--text-dim)',
              fontSize: '0.88rem'
            }}
          >
            Click <strong>"Run Live Benchmark"</strong> to execute 50,000 real-time state mutations in your browser.
          </div>
        )}
      </div>

      {/* Vite Plugin Setup Guide */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={20} color="var(--accent-cyan)" />
          Vite & Rollup Build Configuration
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', margin: '0 0 16px 0', lineHeight: 1.6 }}>
          Add <code>ureactCompilerPlugin</code> to your Vite or Rollup build chain. It works alongside <code>@vitejs/plugin-react</code> and TypeScript seamlessly:
        </p>

        <ReactDevCodeBlock
          title="vite.config.ts"
          code={`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ureactCompilerPlugin } from 'ureact/compiler';

export default defineConfig({
  plugins: [
    // Must run before react() to transform JSX and store mutations
    ureactCompilerPlugin({
      optimizeMutations: true,   // store.count++ -> store.__patch()
      signalDomPruning: true,    // <span>{count.value}</span> -> <SignalValue />
      compileTwoWayBind: true,   // $bind={store.x} expansion
      autoView: true             // Auto-wraps reactive components with view()
    }),
    react()
  ]
});`}
        />
      </div>
    </div>
  );
}
