import React, { useState } from 'react';
import { Show, For, Switch, Case, Default } from 'ureact';
import { Layers, Plus, Trash2, Eye, EyeOff, Package, Check, Clock, Truck } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'med' | 'high';
}

export function ControlFlowDemo() {
  const [isSecretVisible, setIsSecretVisible] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'processing' | 'shipped' | 'delivered'>('processing');
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', title: 'Compile uReact core bundles', priority: 'high' },
    { id: 't2', title: 'Verify React 18 fiber reconciler tests', priority: 'high' },
    { id: 't3', title: 'Deploy interactive playground', priority: 'med' }
  ]);
  const [taskInput, setTaskInput] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(7), title: taskInput, priority: 'med' }
    ]);
    setTaskInput('');
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">
            <Layers size={20} style={{ color: 'var(--accent-purple)' }} />
            Declarative Control Flow (<code>&lt;Show&gt;</code>, <code>&lt;For&gt;</code>, <code>&lt;Switch&gt;</code>)
          </h3>
          <p className="panel-subtitle">
            Eliminates JSX ternary hell (<code>condition ? (other ? &lt;A/&gt; : &lt;B/&gt;) : &lt;C/&gt;</code>) and manual <code>.map((item, i) =&gt; ...)</code> empty state checks.
          </p>
        </div>
      </div>

      <div className="comparison-grid">
        {/* Standard React Boilerplate */}
        <div className="code-box standard">
          <div className="code-box-header">
            <span>Standard React (Ternary spaghetti &amp; manual .map)</span>
            <span className="code-box-badge badge-bad">Unreadable JSX</span>
          </div>
          <pre className="code-content">
            <code>{`// Clunky ternary conditional:
{isLoggedIn ? (
  <UserProfile user={user} />
) : (
  <LoginCTA />
)}

// Clunky list with empty checks:
{items && items.length > 0 ? (
  items.map((item) => (
    <ItemCard key={item.id} item={item} />
  ))
) : (
  <EmptyStatePlaceholder />
)}`}</code>
          </pre>
        </div>

        {/* uReact Clean Code */}
        <div className="code-box ureact">
          <div className="code-box-header">
            <span>uReact (Declarative Components)</span>
            <span className="code-box-badge badge-good">Clean, Semantic JSX</span>
          </div>
          <pre className="code-content">
            <code>{`// Clean conditional with fallback:
<Show when={isLoggedIn} fallback={<LoginCTA />}>
  <UserProfile user={user} />
</Show>

// Clean list with auto-keys and fallback:
<For each={items} fallback={<EmptyStatePlaceholder />}>
  {(item) => <ItemCard item={item} />}
</For>`}</code>
          </pre>
        </div>
      </div>

      <div className="interactive-playground">
        {/* Left: <Show> and <Switch> Interactive */}
        <div className="widget-card">
          <h4 className="widget-title">1. &lt;Show&gt; &amp; &lt;Switch&gt; Demos</h4>

          {/* <Show> demo */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="form-label">&lt;Show&gt; Conditional Visibility</span>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                onClick={() => setIsSecretVisible(!isSecretVisible)}
              >
                {isSecretVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                {isSecretVisible ? 'Hide Secret' : 'Reveal Secret'}
              </button>
            </div>

            <Show
              when={isSecretVisible}
              fallback={
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed var(--border-subtle)',
                    color: 'var(--text-dim)',
                    fontSize: '0.85rem'
                  }}
                >
                  🔒 Content is hidden. Click "Reveal Secret" above.
                </div>
              }
            >
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                🎉 Revealed! &lt;Show&gt; evaluated condition to true and rendered effortlessly without ternary noise!
              </div>
            </Show>
          </div>

          {/* <Switch> demo */}
          <div>
            <span className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              &lt;Switch&gt; Multi-Branch Status
            </span>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {(['pending', 'processing', 'shipped', 'delivered'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setOrderStatus(s)}
                  className={`btn ${orderStatus === s ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', textTransform: 'capitalize' }}
                >
                  {s}
                </button>
              ))}
            </div>

            <Switch fallback={<p>Unknown status</p>}>
              <Case when={orderStatus === 'pending'}>
                <div className="chip" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', width: '100%' }}>
                  <Clock size={16} /> Status: Order placed, awaiting payment confirmation.
                </div>
              </Case>
              <Case when={orderStatus === 'processing'}>
                <div className="chip" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', width: '100%' }}>
                  <Package size={16} /> Status: Packaging goods in fulfillment center.
                </div>
              </Case>
              <Case when={orderStatus === 'shipped'}>
                <div className="chip" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', width: '100%' }}>
                  <Truck size={16} /> Status: Out for expedited delivery via courier.
                </div>
              </Case>
              <Case when={orderStatus === 'delivered'}>
                <div className="chip" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', width: '100%' }}>
                  <Check size={16} /> Status: Delivered safely to recipient.
                </div>
              </Case>
              <Default>
                <div>No matching case</div>
              </Default>
            </Switch>
          </div>
        </div>

        {/* Right: <For> Interactive */}
        <div className="widget-card">
          <h4 className="widget-title">2. &lt;For&gt; List Rendering with Empty Fallback</h4>

          <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Add new task..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Add
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="form-label">Active Items: {tasks.length}</span>
            {tasks.length > 0 && (
              <button
                onClick={() => setTasks([])}
                className="btn btn-danger"
                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
              >
                Clear All (Trigger Empty State)
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <For
              each={tasks}
              fallback={
                <div
                  style={{
                    padding: '30px',
                    textAlign: 'center',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-dim)'
                  }}
                >
                  <p style={{ fontSize: '0.9rem', marginBottom: '6px' }}>List is empty!</p>
                  <p style={{ fontSize: '0.78rem' }}>
                    &lt;For&gt; automatically renders this fallback when the array has length 0.
                  </p>
                </div>
              }
            >
              {(task, index) => (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      {index + 1}
                    </span>
                    <span style={{ fontSize: '0.88rem' }}>{task.title}</span>
                  </div>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="chip-btn"
                    title="Delete item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}
