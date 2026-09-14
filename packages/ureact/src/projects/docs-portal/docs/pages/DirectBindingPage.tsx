import React from 'react';
import { createStore, view, prevent } from 'ureact';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { Code2, CheckCircle2, RotateCcw } from 'lucide-react';

const demoFormStore = createStore({
  fullName: 'Jordan Bell',
  age: 29,
  role: 'Tech Lead',
  isSubscribed: true,
  bio: 'Building with React 19 and uReact.'
});

const LiveBindingCard = view(() => (
  <div className="widget-card" style={{ marginTop: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <h4 style={{ margin: 0, color: 'var(--accent-cyan)' }}>Live Direct Binding Demo</h4>
      <button
        onClick={() => demoFormStore.reset()}
        className="btn btn-secondary"
        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
      >
        <RotateCcw size={12} /> Reset State
      </button>
    </div>

    <form onSubmit={prevent(() => alert('Form State:\n' + JSON.stringify(demoFormStore.state, null, 2)))}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <div className="form-group">
          <label className="form-label">Full Name (<code>{'{...demoFormStore.$bind.fullName}'}</code>)</label>
          <input type="text" className="input-field" {...demoFormStore.$bind.fullName} />
        </div>

        <div className="form-group">
          <label className="form-label">Age (<code>{'{...demoFormStore.$bind.age}'}</code>)</label>
          <input type="number" className="input-field" {...demoFormStore.$bind.age} />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '12px' }}>
        <label className="form-label">Bio (<code>{'{...demoFormStore.$bind.bio}'}</code>)</label>
        <textarea rows={2} className="input-field" {...demoFormStore.$bind.bio} style={{ resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <label className="form-check">
          <input type="checkbox" className="checkbox-custom" {...demoFormStore.$bind.isSubscribed} />
          <span style={{ fontSize: '0.85rem' }}>Subscribe to release notes</span>
        </label>

        <button
          type="button"
          onClick={() => demoFormStore.$toggle('isSubscribed')}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          demoFormStore.$toggle('isSubscribed')
        </button>
      </div>

      <div
        style={{
          padding: '10px 14px',
          borderRadius: '6px',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--accent-emerald)',
          marginBottom: '16px'
        }}
      >
        State Snapshot: {JSON.stringify(demoFormStore.state)}
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
        Submit Form with prevent()
      </button>
    </form>
  </div>
));

export function DirectBindingPage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">Reactive State &gt; store.$bind &amp; Two-Way Binding</div>

      <h1 className="doc-title">store.$bind &amp; Two-Way Binding</h1>
      <p className="doc-lead">
        Two-way data binding in React traditionally requires writing <code>{'value={...}'}</code> and <code>{'onChange={(e) => setVal(e.target.value)}'}</code> for every single form input. In uReact, every store proxy exposes a <code>$bind</code> accessor that automatically wires up two-way bindings in <strong>one attribute</strong>.
      </p>

      <h2 id="syntax">1. Syntax &amp; Usage</h2>
      <p>
        Simply spread <code>{'{...store.$bind.fieldName}'}</code> onto any <code>&lt;input&gt;</code>, <code>&lt;textarea&gt;</code>, <code>&lt;select&gt;</code>, or checkbox:
      </p>

      <CodeBlock
        code={`import { createStore, view } from 'ureact';

const profile = createStore({
  username: 'Alex',
  age: 28,
  subscribed: true
});

export const ProfileForm = view(() => (
  <form>
    {/* Text input */}
    <input {...profile.$bind.username} />

    {/* Number input (automatically parses number) */}
    <input type="number" {...profile.$bind.age} />

    {/* Checkbox (automatically handles checked instead of value) */}
    <input type="checkbox" {...profile.$bind.subscribed} />

    {/* 1-Line toggle method: */}
    <button type="button" onClick={() => profile.$toggle('subscribed')}>
      Toggle Subscription
    </button>
  </form>
));`}
        language="tsx"
        title="DirectBindingExample.tsx"
        showLineNumbers
      />

      <Callout type="tip" title="Zero Imports Needed">
        Because <code>$bind</code> is a getter on the store itself, you don't even need to import a <code>bind()</code> helper function or pass the store reference into it. It is 100% type-safe and self-contained!
      </Callout>

      <h2 id="live-demo">2. Interactive Live Demo</h2>
      <p>
        Type into the inputs below and watch the store snapshot update synchronously in real time:
      </p>

      <LiveBindingCard />
    </article>
  );
}
