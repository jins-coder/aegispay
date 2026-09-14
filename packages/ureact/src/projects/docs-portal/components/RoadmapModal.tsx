import React, { useState, useEffect } from 'react';
import { X, Sparkles, Zap, Cpu, CheckCircle2, Rocket, ArrowRight, ExternalLink, GitBranch, Terminal, Shield, Bot, Flame, Activity } from 'lucide-react';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion?: string;
  onSelectVersion?: (version: string) => void;
}

export function RoadmapModal({
  isOpen,
  onClose,
  currentVersion = '2.3.0',
  onSelectVersion
}: RoadmapModalProps) {
  const [activeTab, setActiveTab] = useState<'v23' | 'v30' | 'v40' | 'changelog'>('v23');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(10px)',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '88vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'paletteFadeIn 0.18s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(88, 196, 220, 0.2), rgba(20, 158, 202, 0.3))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  uReact Strategic Roadmap
                </h2>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'var(--accent-cyan-bg)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 700,
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  v{currentVersion}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                Next-generation reactive runtime, RFC specifications, and autonomous v4 vision
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            padding: '8px 20px',
            gap: '8px',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto'
          }}
        >
          <button
            onClick={() => setActiveTab('v23')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'v23' ? 'var(--accent-cyan-bg)' : 'transparent',
              color: activeTab === 'v23' ? 'var(--accent-cyan)' : 'var(--text-dim)',
              fontWeight: activeTab === 'v23' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <CheckCircle2 size={15} />
            v2.3.0 (Current)
          </button>

          <button
            onClick={() => setActiveTab('v30')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'v30' ? 'var(--accent-cyan-bg)' : 'transparent',
              color: activeTab === 'v30' ? 'var(--accent-cyan)' : 'var(--text-dim)',
              fontWeight: activeTab === 'v30' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Rocket size={15} />
            v3.0.0 RFCs (5)
          </button>

          <button
            onClick={() => setActiveTab('v40')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'v40' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              color: activeTab === 'v40' ? '#c084fc' : 'var(--text-dim)',
              fontWeight: activeTab === 'v40' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Bot size={15} />
            v4.0.0 Autonomous Vision (5)
          </button>

          <button
            onClick={() => setActiveTab('changelog')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'changelog' ? 'var(--accent-cyan-bg)' : 'transparent',
              color: activeTab === 'changelog' ? 'var(--accent-cyan)' : 'var(--text-dim)',
              fontWeight: activeTab === 'changelog' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <GitBranch size={15} />
            Full Changelog
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            lineHeight: 1.6
          }}
        >
          {activeTab === 'v23' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'var(--accent-cyan-bg)',
                  border: '1px solid rgba(88, 196, 220, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
                    🚀 v2.3.0 Stable Available Now
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', opacity: 0.9 }}>
                    Installed & active: <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>npm i ureact@2.3.0</code>
                  </div>
                </div>
                {onSelectVersion && (
                  <button
                    onClick={() => {
                      onSelectVersion('2.3.0');
                      onClose();
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
                  >
                    Set as Active Version
                  </button>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="var(--accent-cyan)" />
                  Shipped Upgrades in v2.3.0
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={16} color="var(--accent-cyan)" />
                      1. Built-in Scoped CSS (&lt;Scoped&gt;)
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      Native component-isolated stylesheets without Tailwind or CSS-in-JS bloat. Ref-counted auto garbage cleanup in <code>&lt;head&gt;</code>.
                    </p>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Activity size={16} color="var(--accent-cyan)" />
                      2. Reactive Form Store & Validation
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      <code>createFormStore</code> with synchronous/async validation rules, dirty tracking, error summaries, and zero re-renders on keystroke.
                    </p>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={16} color="var(--accent-cyan)" />
                      3. Universal State Watcher
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      <code>watch()</code> with <code>immediate</code>, <code>deep</code>, <code>debounce</code>, and <code>cleanup</code> callbacks. Native hook <code>useWatchReactive</code>.
                    </p>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={16} color="#ef4444" />
                      4. Fault Isolation (&lt;Catch&gt; &amp; &lt;Isolated&gt;)
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      Component crash containment boundaries. A crashing widget never takes down siblings or the parent layout tree.
                    </p>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Cpu size={16} color="var(--accent-cyan)" />
                      5. Quantum DevTools HUD
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      Live 60 FPS meter, 98.4% VDOM bypass gauge, interactive state matrix, and 50-step time-travel undo/redo stack.
                    </p>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Flame size={16} color="#eab308" />
                      6. VS Code Extension & VSIX
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      Complete snippet suite, autocomplete provider, hover docs, and packaged standalone <code>.vsix</code> extension.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'v30' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Cpu size={18} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 700 }}>RFC-301: React 19 Compiler Native Signal Pruning</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>RFC Under Review</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-dim)' }}>
                  A compiler plugin optimizing React 19 memo caches with uReact signals to bypass intermediate React component reconciliations entirely.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Terminal size={18} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 700 }}>RFC-302: Edge &amp; RSC Zero-Hydration Store Streaming</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>Draft Spec</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-dim)' }}>
                  Streams micro-store snapshots inline with React Server Component flight data chunks. Zero hydration flicker and zero client refetches.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={18} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 700 }}>RFC-303: Quantum DevTools Chrome &amp; Edge Extension</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>Prototyping</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-dim)' }}>
                  Native browser DevTools tab featuring graph dependency trees, memory allocation heatmaps, and zero-overhead production hooks.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Zap size={18} color="#f59e0b" />
                  <span style={{ fontWeight: 700 }}>RFC-304: WebAssembly SIMD Vectorized State Processing</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>Exploration</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-dim)' }}>
                  Offloads 100,000+ item list diffing and mathematical aggregations to WASM SIMD-128 vectors for under 0.1ms execution.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Shield size={18} color="#06b6d4" />
                  <span style={{ fontWeight: 700 }}>RFC-305: Auto-Optimized Structural Graph Normalizer</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>Draft Spec</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-dim)' }}>
                  Auto-indexes nested JSON responses into normalized relational entities with automatic many-to-one signal subscriptions.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'v40' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Bot size={18} color="#c084fc" />
                  <span style={{ fontWeight: 700 }}>Vision 1: Self-Synthesizing UI Trees</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>Vision 2026-2027</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-dim)' }}>
                  Autonomous layout generation from state schema contracts, dynamically tailoring component graphs for viewport, device, and network.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Cpu size={18} color="#c084fc" />
                  <span style={{ fontWeight: 700 }}>Vision 2: Predictive Speculative Re-Rendering</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>Vision 2026-2027</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-dim)' }}>
                  Markov model heuristic anticipating user interactions (hover velocity, input pacing) to pre-calculate signal graphs in Idle callbacks.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Shield size={18} color="#c084fc" />
                  <span style={{ fontWeight: 700 }}>Vision 3: Neural Mutation Guard &amp; Anomaly Repair</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>Vision 2026-2027</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-dim)' }}>
                  In-client anomaly detection monitoring infinite reactive loops and memory leaks, self-healing broken states automatically.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Zap size={18} color="#c084fc" />
                  <span style={{ fontWeight: 700 }}>Vision 4: Zero-Bundle Distributed Micro-Stores</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>Vision 2026-2027</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-dim)' }}>
                  Peer-to-peer decentralized state mesh enabling seamless multi-tab, multi-window, and WebWorker synchronization via BroadcastChannel &amp; WebRTC.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={18} color="#c084fc" />
                  <span style={{ fontWeight: 700 }}>Vision 5: Multi-Agent Collaborative Real-time Canvas</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>Vision 2026-2027</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-dim)' }}>
                  CRDT-backed state synchronization engine allowing both human developers and autonomous AI agents to co-edit application state in real time.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'changelog' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>v2.3.0 (Current Stable)</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--accent-cyan-bg)', color: 'var(--accent-cyan)' }}>Latest Production</span>
                </div>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-dim)' }}>
                  <li>Built-in Scoped CSS with <code>&lt;Scoped&gt;</code> and <code>useScopedCSS</code>.</li>
                  <li>Reactive Form Store &amp; Validation engine with <code>createFormStore</code>.</li>
                  <li>Universal State Watcher with <code>watch()</code> and <code>useWatchReactive</code>.</li>
                  <li>Component Fault Isolation with <code>&lt;Catch&gt;</code>, <code>&lt;Isolated&gt;</code>, and <code>isolate()</code>.</li>
                  <li>Quantum DevTools telemetry HUD with 60 FPS meter and 50-step time-travel.</li>
                  <li>VS Code extension with 11 custom snippets and packaged <code>.vsix</code> distribution.</li>
                </ul>
              </div>

              <div style={{ borderLeft: '3px solid var(--border-subtle)', paddingLeft: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>v2.2.0</span>
                </div>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-dim)' }}>
                  <li>Added <code>signal()</code>, <code>computed()</code>, and <code>createSignalEffect()</code> primitives.</li>
                  <li>Added <code>useSignal()</code> and <code>useComputed()</code> React hooks.</li>
                  <li>Interactive In-Browser Live Code Playground in documentation.</li>
                  <li>Command Palette v3.0 with split preview and instant search.</li>
                </ul>
              </div>

              <div style={{ borderLeft: '3px solid var(--border-subtle)', paddingLeft: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>v2.1.0</span>
                </div>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-dim)' }}>
                  <li>React 19 support: native Actions, <code>useActionState</code>, and <code>use(Promise)</code>.</li>
                  <li>Declarative Control Flow: <code>&lt;When&gt;</code>, <code>&lt;Show&gt;</code>, <code>&lt;For&gt;</code>, <code>&lt;Fetch&gt;</code>.</li>
                  <li>Global Query &amp; SWR Cache with optimistic mutations.</li>
                  <li>Form <code>$bind</code> two-way proxy bindings.</li>
                </ul>
              </div>

              <div style={{ borderLeft: '3px solid var(--border-subtle)', paddingLeft: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>v2.0.0 (LTS)</span>
                </div>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-dim)' }}>
                  <li>Initial release of <code>createStore</code> proxy-based reactive state.</li>
                  <li>Automatic dependency tracking with <code>view()</code> HOC.</li>
                  <li>Core hooks: <code>useMount</code>, <code>useUnmount</code>, <code>useWatch</code>.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Press <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>Esc</kbd> to close
          </span>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

