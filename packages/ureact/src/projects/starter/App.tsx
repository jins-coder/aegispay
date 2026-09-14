import React from 'react';
import { createStore, view } from 'ureact';

// Reactive store in 1 line
const counterStore = createStore({
  count: 0,
  increment() { this.count++; },
  decrement() { this.count--; },
  reset() { this.count = 0; }
});

// view() wraps component with zero-hook auto-reactivity
export const App = view(() => {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '40px auto' }}>
      <h1>New uReact Project</h1>
      <p style={{ color: '#64748b' }}>
        Dedicated project created inside <code>src/projects/starter/</code>.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
        <button onClick={() => counterStore.state.decrement()} style={{ padding: '8px 16px' }}>-</button>
        <span style={{ fontSize: '1.6rem', fontWeight: 700, minWidth: '40px', textAlign: 'center' }}>
          {counterStore.state.count}
        </span>
        <button onClick={() => counterStore.state.increment()} style={{ padding: '8px 16px' }}>+</button>
        <button onClick={() => counterStore.state.reset()} style={{ padding: '8px 16px' }}>Reset</button>
      </div>
    </div>
  );
});
