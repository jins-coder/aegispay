import React, { useState } from 'react';
import { createStore, useStore } from 'ureact';
import { Sparkles, Plus, Minus, Trash2, RotateCcw, CheckCircle2 } from 'lucide-react';

// Create a reactive store outside or inside component
interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const shopStore = createStore({
  user: {
    name: 'Alex Johnson',
    tier: 'Pro Member',
    credits: 250
  },
  cart: [
    { id: '1', name: 'Ultra UI Kit', price: 49, qty: 1 },
    { id: '2', name: 'Cloud Sync License', price: 99, qty: 2 }
  ] as CartItem[],

  // Direct actions attached to the store
  addItem(name: string, price: number) {
    this.cart.push({
      id: Math.random().toString(36).substring(7),
      name,
      price,
      qty: 1
    });
  },
  removeItem(id: string) {
    const idx = this.cart.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.cart.splice(idx, 1);
    }
  },
  changeQty(id: string, delta: number) {
    const item = this.cart.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
    }
  },
  get totalAmount(): number {
    return this.cart.reduce((sum: number, item: CartItem) => sum + item.price * item.qty, 0);
  }
});

export function StateDemo() {
  const state = useStore(shopStore);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(29);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    state.addItem(newItemName, newItemPrice);
    setNewItemName('');
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">
            <Sparkles size={20} className="text-cyan" style={{ color: 'var(--accent-cyan)' }} />
            Direct Reactive State (Proxy Store)
          </h3>
          <p className="panel-subtitle">
            Write intuitive, mutable syntax like <code>state.cart.push()</code> or <code>state.user.name = 'Bob'</code>. Under the hood, uReact translates this to React 18's <code>useSyncExternalStore</code> with zero immutability bugs.
          </p>
        </div>
        <button
          onClick={() => shopStore.reset()}
          className="btn btn-secondary"
          title="Reset store to initial state"
        >
          <RotateCcw size={15} /> Reset Store
        </button>
      </div>

      <div className="comparison-grid">
        {/* Standard React Boilerplate */}
        <div className="code-box standard">
          <div className="code-box-header">
            <span>Standard React (useState & nested spreads)</span>
            <span className="code-box-badge badge-bad">High Boilerplate</span>
          </div>
          <pre className="code-content">
            <code>{`// Deep immutable nested spread gymnastics:
const [user, setUser] = useState({ name: 'Alex', ... });
const [cart, setCart] = useState([...]);

// Updating quantity:
const updateQty = (id, delta) => {
  setCart(prev => prev.map(item => 
    item.id === id 
      ? { ...item, qty: Math.max(1, item.qty + delta) } 
      : item
  ));
};

// Derived total calculation:
const total = useMemo(() => {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}, [cart]);`}</code>
          </pre>
        </div>

        {/* uReact Clean Code */}
        <div className="code-box ureact">
          <div className="code-box-header">
            <span>uReact (Unified Reactive Store)</span>
            <span className="code-box-badge badge-good">Clean & Intuitive (-70% code)</span>
          </div>
          <pre className="code-content">
            <code>{`const shop = createStore({
  user: { name: 'Alex' },
  cart: [...],
  get total() { 
    return this.cart.reduce((s, i) => s + i.price * i.qty, 0); 
  }
});

// In Component:
const state = useStore(shop);

// Direct mutation just works!
state.cart[0].qty += 1;
state.user.name = 'New Name';`}</code>
          </pre>
        </div>
      </div>

      {/* Live Interactive Playground */}
      <div className="interactive-playground">
        {/* Left: Interactive Controls */}
        <div className="widget-card">
          <h4 className="widget-title">Live Interactive Store Controls</h4>

          {/* User Profile Edit */}
          <div className="form-group">
            <label className="form-label">User Profile (Mutate directly)</label>
            <input
              type="text"
              className="input-field"
              value={state.user.name}
              onChange={(e) => {
                // Direct assignment! No setUser(p => ({ ...p, name: ... }))
                state.user.name = e.target.value;
              }}
              placeholder="Edit name"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => { state.user.tier = state.user.tier === 'Pro Member' ? 'VIP Enterprise' : 'Pro Member'; }}
            >
              Toggle Tier: <strong>{state.user.tier}</strong>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => { state.user.credits += 50; }}
            >
              Add +50 Credits ({state.user.credits})
            </button>
          </div>

          {/* Add item to cart */}
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <input
              type="text"
              className="input-field"
              style={{ flex: 2 }}
              placeholder="New product name..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <input
              type="number"
              className="input-field"
              style={{ flex: 1 }}
              placeholder="Price"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(Number(e.target.value))}
            />
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Add
            </button>
          </form>

          {/* Cart items list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="form-label">Cart Items ({state.cart.length})</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                Computed Total: ${state.totalAmount}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {state.cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>${item.price} each</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px' }}
                      onClick={() => state.changeQty(item.id, -1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>
                      {item.qty}
                    </span>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px' }}
                      onClick={() => state.changeQty(item.id, 1)}
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', marginLeft: '4px' }}
                      onClick={() => state.removeItem(item.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Realtime State Snapshot */}
        <div className="widget-card">
          <h4 className="widget-title">
            <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
            Reactive State Snapshot (Live Proxy Inspector)
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Inspect current state in real-time. Notice how React re-renders with pinpoint precision upon direct assignment.
          </p>
          <pre className="state-inspector">
            {JSON.stringify(
              {
                user: state.user,
                totalAmount: `$${state.totalAmount}`,
                itemsCount: state.cart.length,
                cart: state.cart
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
