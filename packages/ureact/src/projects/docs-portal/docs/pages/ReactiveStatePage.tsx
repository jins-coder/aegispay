import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { YouWillLearn } from '../../components/YouWillLearn';
import { ReactDevChallenge } from '../../components/ReactDevChallenge';
import { StateDemo } from '../../examples/StateDemo';
import { Sparkles, Layers, RefreshCw, Cpu, Boxes, ArrowRightLeft, CheckCircle2, Share2 } from 'lucide-react';

export function ReactiveStatePage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">
        <span>LEARN REACT</span>
        <span>&gt;</span>
        <span style={{ color: 'var(--text-main)' }}>MANAGING STATE</span>
      </div>

      <h1 className="doc-title">createStore &amp; view()</h1>
      <p className="doc-lead">
        State in React shouldn't require complex immutable update rituals. With <code>createStore</code>, you define your state as a regular JavaScript object and mutate it directly (e.g. <code>state.count++</code> or <code>state.items.push(x)</code>). When wrapped with <code>view()</code>, components automatically re-render with <strong>zero hook calls</strong>.
      </p>

      {/* react.dev "You will learn" Summary */}
      <YouWillLearn
        items={[
          'How createStore wraps objects in ES6 Proxies to detect deep mutations',
          'How view() tracks accessed properties during render without useStore() calls',
          'How batch() coalesces multiple synchronous mutations into a single re-render',
          'Common pitfalls when destructuring state properties outside of view()'
        ]}
      />

      <h2 id="overview">1. How createStore Works</h2>
      <p>
        <code>createStore</code> takes an initial state object or array and wraps it in a deep ES6 Proxy. Whenever a property is accessed or modified, the store tracks the operation and coordinates with React's reconciler.
      </p>

      <CodeBlock
        code={`import { createStore, view } from 'ureact';

// 1. Create a reactive store with state and actions
export const counterStore = createStore({
  count: 0,
  inc() {
    this.count++;
  },
  dec() {
    this.count--;
  }
});

// 2. Wrap the component with view()
export const Counter = view(() => (
  <div>
    <span>Count: {counterStore.state.count}</span>
    <button onClick={() => counterStore.state.inc()}>+1</button>
  </div>
));`}
        language="tsx"
        title="counterStore.ts"
        showLineNumbers
        highlightLines={[4, 7, 8, 14, 17, 18]}
      />

      {/* react.dev Deep Dive Card */}
      <Callout type="deep-dive" title="How does view() subscribe to stores without calling hooks?">
        When a component wrapped in <code>view()</code> begins its render cycle, uReact sets an internal active subscriber context. As JSX reads properties like <code>store.state.count</code>, proxy <code>get</code> traps record the store reference. Upon render completion, uReact registers a listener using React 18/19's <code>useSyncExternalStore</code>. You never need to write manual dependency arrays or call <code>useStore(store)</code>!
      </Callout>

      <h2 id="batching">2. Automatic &amp; Manual Batching</h2>
      <p>
        Multiple property assignments within the same event loop tick are automatically batched. For synchronous loops or multi-store transitions, you can also use <code>batch()</code>:
      </p>

      <CodeBlock
        code={`import { batch } from 'ureact';

batch(() => {
  userStore.state.name = 'Elena';
  userStore.state.role = 'Architect';
  cartStore.state.items.push(newItem);
}); // Triggers only ONE React re-render!`}
        language="tsx"
        title="Batching Example"
        showLineNumbers
      />

      {/* react.dev Pitfall Card */}
      <Callout type="pitfall" title="Do not destructure state outside of view() render phase">
        If you write <code>{'const { count } = store.state;'}</code> in module scope or before an asynchronous event, you will capture a static snapshot value rather than a reactive reference. Always read <code>store.state.property</code> directly inside your <code>view()</code> component render function!
      </Callout>

      <h2 id="live-demo">3. Interactive Live Playground</h2>
      <p style={{ marginBottom: '16px' }}>
        Test direct mutations, shopping cart additions, and local state below:
      </p>

      {/* Embedded Live Interactive Widget */}
      <StateDemo />

      <h2 id="external-state" style={{ marginTop: '48px' }}>
        4. Built-in State Package &amp; External State Interoperability
      </h2>
      <p>
        <strong>uReact includes its own complete, zero-dependency reactive state management engine</strong> (<code>createStore</code>, <code>signal</code>, <code>computed</code>, <code>createFormStore</code>, <code>createHistoryStore</code>). However, uReact has a <em>zero lock-in</em> philosophy:
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        margin: '24px 0'
      }}>
        <div style={{
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#38bdf8' }}>
            <Cpu size={20} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>1. Built-in State Package</h4>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Use uReact's native <code>createStore</code> and <code>signal</code> when starting new apps. You get direct mutations, micro-batched updates, property-level tracking, and automatic Quantum DevTools telemetry without installing extra libraries.
          </p>
        </div>

        <div style={{
          background: 'rgba(168, 85, 247, 0.05)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#c084fc' }}>
            <ArrowRightLeft size={20} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>2. 100% External Friendly</h4>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Have an existing codebase with <strong>Zustand</strong>, <strong>Redux Toolkit</strong>, <strong>Jotai</strong>, or <strong>TanStack Store</strong>? They work seamlessly in uReact with zero wrappers. You can mix and match without conflict.
          </p>
        </div>
      </div>

      <h3 style={{ fontSize: '18px', marginTop: '24px' }}>Example: Using Zustand or Redux with uReact</h3>
      <p>
        Because uReact adheres to React 19 standards, external state management libraries work side-by-side with uReact components:
      </p>

      <CodeBlock
        code={`// 1. External Zustand Store (Legacy or team preference)
import { create } from 'zustand';
import { useStore as useExternalStore } from 'zustand';

export const useAuthStore = create((set) => ({
  user: { name: 'Sarah', role: 'Engineer' },
  setUser: (user) => set({ user })
}));

// 2. uReact Native Component reading both external & internal state:
import { createStore, useStore } from 'ureact';

const uiStore = createStore({
  sidebarOpen: false,
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
});

export function DashboardHeader() {
  const authUser = useAuthStore((s) => s.user); // External Zustand
  const ui = useStore(uiStore);                  // Built-in uReact Proxy

  return (
    <header>
      <button onClick={() => ui.toggleSidebar()}>Toggle</button>
      <span>Welcome, {authUser.name}!</span>
    </header>
  );
}`}
        language="tsx"
        title="Mixing External State with uReact"
        showLineNumbers
      />

      <h3 style={{ fontSize: '18px', marginTop: '24px' }}>Connecting External Stores to uReact Quantum DevTools</h3>
      <p>
        You can even expose external stores to uReact's Quantum DevTools HUD using <code>registerDevTools</code>:
      </p>

      <CodeBlock
        code={`import { registerDevTools } from 'ureact';
import { useAuthStore } from './authStore';

// Registers external store for live JSON inspection in the Quantum HUD:
registerDevTools('ExternalAuthStore', 'store', useAuthStore.getState());`}
        language="tsx"
        title="DevTools Bridge"
        showLineNumbers
      />

      {/* react.dev Challenges */}
      <h2 id="challenges" style={{ marginTop: '48px' }}>
        Try Out Some Challenges
      </h2>

      <ReactDevChallenge
        number={1}
        total={1}
        title="Create a reactive shopping cart store"
        description={
          <div>
            <p>
              Create a store named <code>cartStore</code> with an <code>items</code> array and a <code>total</code> getter method that computes the sum of item prices.
            </p>
          </div>
        }
        solution={
          <div>
            <p>Define the store with array methods:</p>
            <CodeBlock
              code={`import { createStore, view } from 'ureact';

export const cartStore = createStore({
  items: [
    { id: 1, name: 'Mechanical Keyboard', price: 129 },
    { id: 2, name: 'USB-C Cable', price: 19 }
  ],
  addItem(item) {
    this.items.push(item);
  },
  get total() {
    return this.items.reduce((sum, i) => sum + i.price, 0);
  }
});`}
              language="tsx"
            />
          </div>
        }
      />
    </article>
  );
}
