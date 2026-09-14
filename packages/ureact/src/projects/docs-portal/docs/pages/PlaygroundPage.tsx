import React from 'react';
import { LivePlayground } from '../../examples/LivePlayground';
import { Sparkles, Terminal, Code2, Zap } from 'lucide-react';
import { Callout } from '../../components/Callout';

export function PlaygroundPage() {
  return (
    <div className="doc-page-container">
      {/* Title & Introduction */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'var(--accent-cyan-bg)',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              border: '1px solid var(--border-subtle)'
            }}
          >
            v2.2.0-next Interactive
          </span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: '0 0 12px 0' }}>
          Interactive In-Browser Code Playground
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>
          Experiment with uReact's reactivity engine live in your browser. Edit code directly, toggle presets, inspect runtime state graphs, and test Signals v2 without setting up a local build environment.
        </p>
      </div>

      <Callout type="tip" title="Real-Time Reactivity Engine">
        All presets below execute directly in your browser using uReact's runtime proxy and Signals v2 dependency tracking. You can modify state values, test mutations, and see real-time UI synchronizations.
      </Callout>

      {/* Main Interactive Playground Component */}
      <div style={{ marginTop: '24px', marginBottom: '40px' }}>
        <LivePlayground />
      </div>

      {/* Features summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '32px' }}>
        <div style={{ padding: '18px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap size={18} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Signals v2 Tracking</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Signals only re-render the components that directly read their <code>.value</code>. Parent components stay un-rendered for maximum frame rates.
          </p>
        </div>

        <div style={{ padding: '18px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Code2 size={18} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Direct Form Binding</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Spread <code>{'{...store.$bind.prop}'}</code> on any HTML input. uReact wires up value and change handlers automatically.
          </p>
        </div>

        <div style={{ padding: '18px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Terminal size={18} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Action Form Support</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Dispatch async actions with native React 19 pending transitions, automatic rollback, and zero manual status state.
          </p>
        </div>
      </div>
    </div>
  );
}
