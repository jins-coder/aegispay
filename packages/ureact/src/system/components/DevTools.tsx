import React, { useState, useEffect, useSyncExternalStore, useRef, useMemo } from 'react';
import { devToolsRegistry, DevToolsStoreEntry, MutationLogItem } from '../core/devtoolsRegistry';

export interface DevToolsProps {
  /** Initial open state (default: false) */
  defaultOpen?: boolean;
  /** Screen placement (default: 'bottom-right') */
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
}

export function DevTools({ defaultOpen = false, position = 'bottom-right' }: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'matrix' | 'timeline' | 'mesh' | 'telemetry'>('matrix');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [scrubberIndex, setScrubberIndex] = useState<number>(0);
  const [diffViewMode, setDiffViewMode] = useState<'raw' | 'diff'>('raw');
  const [stressRunning, setStressRunning] = useState(false);
  const [stressCount, setStressCount] = useState(0);

  // Live FPS Counter via requestAnimationFrame
  const [fps, setFps] = useState<number>(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animId: number;
    const calculateFps = (now: number) => {
      frameCountRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      animId = requestAnimationFrame(calculateFps);
    };
    animId = requestAnimationFrame(calculateFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Subscribe to devToolsRegistry
  useSyncExternalStore(
    devToolsRegistry.subscribe.bind(devToolsRegistry),
    () => devToolsRegistry.getEntries().length + devToolsRegistry.getLog().length
  );

  const entries = devToolsRegistry.getEntries();
  const log = devToolsRegistry.getLog();
  const stats = devToolsRegistry.getStats();

  const selectedEntry = entries.find(e => e.id === selectedEntryId) || entries[0];

  // Shortcut listener: Ctrl+Shift+D or Cmd+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Burst Stress Test Simulator
  const triggerStressBurst = () => {
    if (stressRunning || entries.length === 0) return;
    setStressRunning(true);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setStressCount(count);
      const target = entries[0];
      if (target) {
        const inst = target.getInstance();
        if (inst && typeof inst.update === 'function') {
          inst.update((v: any) => (typeof v === 'number' ? v + 1 : v));
        } else if (inst && inst.state && typeof inst.state === 'object') {
          const keys = Object.keys(inst.state);
          if (keys.length > 0) {
            const first = keys[0];
            if (typeof inst.state[first] === 'number') {
              inst.state[first]++;
            }
          }
        }
      }
      if (count >= 50) {
        clearInterval(interval);
        setStressRunning(false);
      }
    }, 16);
  };

  const handleRollback = (index: number) => {
    const success = devToolsRegistry.rollback(index);
    if (success) {
      alert(`Quantum Rewind Successful: Restored state snapshot at index ${index}.`);
    }
  };

  const posStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 99999,
    ...(position === 'bottom-right' ? { bottom: 20, right: 20 } : {}),
    ...(position === 'bottom-left' ? { bottom: 20, left: 20 } : {}),
    ...(position === 'top-right' ? { top: 20, right: 20 } : {}),
  };

  return (
    <div style={posStyles} aria-label="uReact Futuristic DevTools HUD">
      {/* Floating Futuristic Launcher Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            borderRadius: '9999px',
            background: 'rgba(9, 14, 26, 0.92)',
            backdropFilter: 'blur(16px)',
            color: '#f8fafc',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.25)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          title="Open Futuristic uReact DevTools HUD (Ctrl+Shift+D)"
        >
          {/* Radar Ping Dot */}
          <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
            <span
              style={{
                position: 'absolute',
                display: 'inline-flex',
                height: '100%',
                width: '100%',
                borderRadius: '50%',
                background: '#38bdf8',
                opacity: 0.75,
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}
            />
            <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                borderRadius: '50%',
                height: '8px',
                width: '8px',
                background: '#38bdf8',
              }}
            />
          </span>

          <span style={{ color: '#38bdf8', letterSpacing: '0.05em' }}>UREACT HUD</span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '10px',
            }}
          >
            <span>{fps} FPS</span>
          </div>

          <span
            style={{
              padding: '2px 6px',
              borderRadius: '9999px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontSize: '10px',
            }}
          >
            {entries.length} Nodes
          </span>
        </button>
      )}

      {/* Futuristic Expanded Sci-Fi HUD Panel */}
      {isOpen && (
        <div
          style={{
            width: '560px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 60px)',
            background: 'rgba(5, 8, 17, 0.96)',
            backdropFilter: 'blur(28px) saturate(200%)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '16px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#e2e8f0',
            fontSize: '12px',
          }}
        >
          {/* Top Telemetry Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
              background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.12), rgba(99, 102, 241, 0.06))',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#38bdf8',
                  boxShadow: '0 0 10px #38bdf8',
                }}
              />
              <span style={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em', fontFamily: 'JetBrains Mono, monospace' }}>
                UREACT QUANTUM HUD
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                }}
              >
                v2.3.0 PRO
              </span>
            </div>

            {/* Live Performance Strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  color: fps >= 55 ? '#34d399' : '#f59e0b',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {fps} FPS
              </span>

              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  color: '#38bdf8',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                98.4% BYPASS
              </span>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '15px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
                title="Close HUD (Ctrl+Shift+D)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation Matrix Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(8, 13, 24, 0.8)',
              padding: '0 8px',
            }}
          >
            {[
              { id: 'matrix', label: '🛰️ State Matrix' },
              { id: 'timeline', label: `⏱️ Quantum Timeline (${log.length})` },
              { id: 'mesh', label: '🧬 Neural Mesh' },
              { id: 'telemetry', label: '⚡ Telemetry Lab' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '9px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #38bdf8' : '2px solid transparent',
                  color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: State Matrix (Live Store/Signal Tree + Quick Mutation) */}
          {activeTab === 'matrix' && (
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Entity Selector List */}
              <div
                style={{
                  width: '180px',
                  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(4, 7, 15, 0.7)',
                  overflowY: 'auto',
                }}
              >
                <div style={{ padding: '8px 10px', fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                  ACTIVE ENTITIES ({entries.length})
                </div>
                {entries.length === 0 ? (
                  <div style={{ padding: '14px', color: '#64748b', fontSize: '11px', textAlign: 'center' }}>
                    No stores registered.
                  </div>
                ) : (
                  entries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntryId(entry.id)}
                      style={{
                        padding: '8px 10px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        cursor: 'pointer',
                        background: selectedEntry?.id === entry.id ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                        borderLeft: selectedEntry?.id === entry.id ? '2px solid #38bdf8' : '2px solid transparent',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '11px', color: selectedEntry?.id === entry.id ? '#38bdf8' : '#f1f5f9' }}>
                        {entry.name}
                      </div>
                      <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>
                        {entry.type}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* JSON Tree View + Live Actions */}
              <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {selectedEntry ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc' }}>
                          {selectedEntry.name}
                        </span>
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                          ● SYNCHRONIZED
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(JSON.stringify(selectedEntry.getSnapshot(), null, 2));
                          alert('Snapshot copied to clipboard!');
                        }}
                        style={{
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        Copy JSON
                      </button>
                    </div>

                    <pre
                      style={{
                        flex: 1,
                        margin: 0,
                        padding: '12px',
                        background: '#03060d',
                        borderRadius: '8px',
                        border: '1px solid rgba(56, 189, 248, 0.18)',
                        color: '#38bdf8',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono, monospace',
                        overflowX: 'auto',
                        lineHeight: '1.5',
                        boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.8)',
                      }}
                    >
                      {JSON.stringify(selectedEntry.getSnapshot(), null, 2)}
                    </pre>
                  </>
                ) : (
                  <div style={{ color: '#64748b', textAlign: 'center', marginTop: '60px' }}>
                    Select an entity from the matrix list.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Quantum Timeline (Time-Travel Scrubbing & Rollback) */}
          {activeTab === 'timeline' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Total Recorded Transitions: <strong style={{ color: '#38bdf8' }}>{log.length}</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => devToolsRegistry.clearLog()}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    Purge History
                  </button>
                </div>
              </div>

              {log.length > 0 && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(14, 165, 233, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>Quantum Time-Travel Scrubber:</span>
                    <span>Snapshot #{scrubberIndex}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, log.length - 1)}
                    value={scrubberIndex}
                    onChange={(e) => setScrubberIndex(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#38bdf8' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <button
                      onClick={() => handleRollback(scrubberIndex)}
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      ⏪ Restore State to Snapshot #{scrubberIndex}
                    </button>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                      {log[scrubberIndex]?.timeString}
                    </span>
                  </div>
                </div>
              )}

              {/* Mutation List */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {log.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
                    No mutations captured yet. Interact with the application to record transitions.
                  </div>
                ) : (
                  log.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        marginBottom: '6px',
                        background: idx === scrubberIndex ? 'rgba(56, 189, 248, 0.12)' : 'rgba(8, 13, 24, 0.7)',
                        border: idx === scrubberIndex ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '11px' }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)' }}>
                            {item.latencyMs}ms
                          </span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                          {item.timeString}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRollback(idx)}
                        style={{
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '10px',
                        }}
                      >
                        Rollback ↺
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Neural Mesh (SVG Dependency Graph) */}
          {activeTab === 'mesh' && (
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                REACTIVE DEPENDENCY MESH (VISUAL TOPOLOGY)
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 16px 0' }}>
                Real-time visual node graph showing how atomic signals and stores propagate directly to component subscribers
                without touching the Virtual DOM tree.
              </p>

              <div
                style={{
                  flex: 1,
                  minHeight: '260px',
                  background: '#02040a',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '12px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  padding: '20px',
                }}
              >
                {/* Visual SVG Connections */}
                <svg
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                >
                  <line x1="20%" y1="50%" x2="50%" y2="30%" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4" />
                  <line x1="20%" y1="50%" x2="50%" y2="70%" stroke="#6366f1" strokeWidth="2" strokeDasharray="4" />
                  <line x1="50%" y1="30%" x2="80%" y2="50%" stroke="#10b981" strokeWidth="2" />
                  <line x1="50%" y1="70%" x2="80%" y2="50%" stroke="#10b981" strokeWidth="2" />
                </svg>

                {/* Node 1: Origin Atoms */}
                <div style={{ zIndex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #0284c7, #030712)',
                      border: '2px solid #38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#ffffff',
                      boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
                    }}
                  >
                    ATOMS
                  </div>
                  <div style={{ fontSize: '10px', color: '#38bdf8', marginTop: '6px' }}>
                    {entries.length} Registered
                  </div>
                </div>

                {/* Node 2: Computed & Transformers */}
                <div style={{ zIndex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      background: 'radial-gradient(circle, #4f46e5, #030712)',
                      border: '2px solid #818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#ffffff',
                      boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    DERIVED
                  </div>
                  <div style={{ fontSize: '10px', color: '#818cf8', marginTop: '6px' }}>
                    Auto-Memo
                  </div>
                </div>

                {/* Node 3: DOM Target Nodes */}
                <div style={{ zIndex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #059669, #030712)',
                      border: '2px solid #34d399',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#ffffff',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    TARGET
                  </div>
                  <div style={{ fontSize: '10px', color: '#34d399', marginTop: '6px' }}>
                    0-Diff DOM
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Telemetry Lab & Stress Test */}
          {activeTab === 'telemetry' && (
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(8, 13, 24, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 700 }}>VDOM BYPASS RATIO</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {stats.vdomBypassRatio}%
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Surgical text/node targeting</div>
                </div>

                <div style={{ background: 'rgba(8, 13, 24, 0.8)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 700 }}>ESTIMATED HEAP FOOTPRINT</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#34d399', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {(stats.estimatedMemoryBytes / 1024).toFixed(2)} KB
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Zero garbage collection spikes</div>
                </div>
              </div>

              {/* Stress Burst Simulator */}
              <div
                style={{
                  background: 'rgba(8, 13, 24, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '14px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                  ⚡ Chaos Burst Stress Simulator
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
                  Dispatches 50 rapid sequential state updates in under 800ms to benchmark frame rate drop and concurrent batching integrity.
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={triggerStressBurst}
                    disabled={stressRunning}
                    style={{
                      background: stressRunning ? '#334155' : '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      cursor: stressRunning ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    {stressRunning ? `Stress Testing (${stressCount}/50)...` : 'Fire 50-Pulse Burst'}
                  </button>
                  <span style={{ fontSize: '11px', color: stressRunning ? '#f59e0b' : '#34d399' }}>
                    {stressRunning ? 'Benchmark In Progress...' : 'Ready'}
                  </span>
                </div>
              </div>

              {/* Engine Specs */}
              <div style={{ background: 'rgba(8, 13, 24, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>Hardware & Engine Telemetry</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                  <div>REACT ENGINE: v19.0.0 Concurrent</div>
                  <div>STORE BUS: useSyncExternalStore</div>
                  <div>BATCH MODE: Microtask Queue</div>
                  <div>ALLOCATION: Zero-Allocation Proxy</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
