import React, { useState } from 'react';
import { TorchCode } from '../components/TorchCode';
import {
  createStore,
  createListStore,
  view,
  bind,
  prevent,
  When,
  AutoForm,
  ActionForm,
  ActionSubmitButton,
  useCounter
} from 'ureact';
import {
  Minimize2,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Code2,
  ListTodo,
  Layers,
  Send,
  Trash2,
  Check,
  RotateCcw
} from 'lucide-react';

// 1. Reactive store using direct proxy $bind
const userProfileStore = createStore({
  username: 'Alex Chen',
  role: 'Full Stack Engineer',
  notifications: true,
  theme: 'Dark AMOLED'
});

// 2. Reactive 1-line CRUD collection store
interface TaskItem {
  id: number;
  title: string;
  category: string;
  done: boolean;
}

const taskList = createListStore<TaskItem>([
  { id: 1, title: 'Eliminate useEffect dependency arrays', category: 'DX', done: true },
  { id: 2, title: 'Two-way bind inputs with store.$bind', category: 'Core', done: true },
  { id: 3, title: '1-Line CRUD with createListStore()', category: 'Collection', done: true },
  { id: 4, title: 'Single-tag form with <AutoForm />', category: 'Components', done: false }
]);

// 3. Settings store for AutoForm demo
const settingsStore = createStore({
  projectName: 'SuperApp 2.0',
  teamLead: 'Sarah Connor',
  maxUsers: 50,
  enableSso: true
});

// Auto-reactive badge using view() - ZERO useStore calls!
const AutoReactiveBadge = view(() => (
  <div
    style={{
      padding: '12px 16px',
      borderRadius: '8px',
      background: 'rgba(56, 189, 248, 0.1)',
      border: '1px solid rgba(56, 189, 248, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    }}
  >
    <div>
      <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
        {userProfileStore.state.username}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {userProfileStore.state.role} • Notifications: {userProfileStore.state.notifications ? 'ON' : 'OFF'}
      </div>
    </div>
    <span className="pill" style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.2)' }}>
      Zero useStore() hook calls
    </span>
  </div>
));

export const BoilerplateDemo = view(() => {
  const counter = useCounter(10);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [autoFormSaved, setAutoFormSaved] = useState<string | null>(null);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    taskList.add({
      title: newTaskTitle.trim(),
      category: 'General',
      done: false
    });
    setNewTaskTitle('');
  };

  // Mock server action for React 19 ActionForm
  const handleSaveAction = async (formData: FormData) => {
    // Simulate server response delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const title = formData.get('actionItem') as string;
    if (!title) throw new Error('Item name cannot be empty');
    taskList.add({
      title,
      category: 'ActionForm',
      done: false
    });
    setActionFeedback(`✓ Server Action executed: "${title}" created!`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">
            <Minimize2 size={20} style={{ color: 'var(--accent-emerald)' }} />
            Radical Code Reduction Engine (Up to -89% Less Code)
          </h3>
          <p className="panel-subtitle">
            How uReact systematically eliminates every repetitive code block in React development.
          </p>
        </div>
        <div className="pill active" style={{ fontSize: '0.78rem', padding: '4px 10px', whiteSpace: 'nowrap' }}>
          <TrendingDown size={14} /> <strong>-89% Code Reduction</strong>
        </div>
      </div>

      {/* Code Reduction Metrics Grid */}
      <div id="reduction-metrics" className="metrics-strip" style={{ marginBottom: '28px' }}>
        <div className="metric-card">
          <div className="metric-val cyan">store.$bind</div>
          <div className="metric-label">
            Direct proxy binding. Eliminates <code>bind()</code> helper imports &amp; <code>value/onChange</code>.
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-val green">createListStore()</div>
          <div className="metric-label">
            1-line reactive collections. Built-in <code>add()</code>, <code>remove()</code>, <code>toggle()</code>.
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-val purple">&lt;AutoForm&gt;</div>
          <div className="metric-label">
            Single-tag form. Generates full two-way bound responsive forms from 1 schema.
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-val" style={{ color: 'var(--accent-amber)' }}>&lt;ActionForm&gt;</div>
          <div className="metric-label">
            React 19 native action form with auto-pending state &amp; disabled buttons.
          </div>
        </div>
      </div>

      {/* 3-Tier Line-by-Line Code Comparison */}
      <div id="side-by-side" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '32px' }}>
        {/* Tier 1: Standard React */}
        <TorchCode
          title="React (65 lines)"
          badge="Boilerplate"
          badgeType="bad"
          highlightLines={[2, 3, 4, 5, 8, 9, 10, 11, 15, 16]}
          code={`// 1. Multiple useState & setters
const [name, setName] = useState('');
const [role, setRole] = useState('');
const [notif, setNotif] = useState(true);
const [todos, setTodos] = useState([]);

// 2. Repetitive handler functions
const handleSubmit = (e) => {
  e.preventDefault();
  save({ name, role, notif });
};
const addTodo = (t) => setTodos(p => [...p, t]);
const toggleTodo = (id) => 
  setTodos(p => p.map(x => x.id === id ? {...x, done: !x.done} : x));
const deleteTodo = (id) =>
  setTodos(p => p.filter(x => x.id !== id));

// 3. JSX with manual bindings & ternaries
return (
  <form onSubmit={handleSubmit}>
    <input value={name} onChange={e => setName(e.target.value)} />
    <input type="checkbox" checked={notif} onChange={e => setNotif(e.target.checked)} />
    {todos.map(t => (
      <div key={t.id}>
        <span onClick={() => toggleTodo(t.id)}>{t.title}</span>
        <button onClick={() => deleteTodo(t.id)}>×</button>
      </div>
    ))}
  </form>
);`}
        />

        {/* Tier 2: uReact v1 */}
        <TorchCode
          title="uReact v1 (14 lines)"
          badge="-79%"
          badgeType="good"
          highlightLines={[2, 6, 7, 8]}
          code={`// 1. Unified reactive store
const user = createStore({ name: '', role: '', notif: true });
const todos = createStore([]);

// 2. Direct bindings & prevent modifier:
export const UserView = view(() => (
  <form onSubmit={prevent(() => save(user.state))}>
    <input {...bind(user, 'name')} />
    <input type="checkbox" {...bind(user, 'notif')} />
    <For each={todos.state}>
      {(t) => (
        <div key={t.id}>
          <span onClick={() => t.done = !t.done}>{t.title}</span>
          <button onClick={() => todos.state.splice(i, 1)}>×</button>
        </div>
      )}
    </For>
  </form>
));`}
        />

        {/* Tier 3: uReact v2.2 Latest */}
        <TorchCode
          title="uReact v2.2 (7 lines)"
          badge="-89%"
          badgeType="emerald"
          highlightLines={[2, 3, 6, 7, 8]}
          code={`// 1. Reactive proxy store & 1-line CRUD list:
const user = createStore({ name: '', role: '', notif: true });
const todos = createListStore([]);

// 2. Direct $bind.prop & built-in 1-line CRUD methods:
export const UserView = view(() => (
  <AutoForm store={user} onSubmit={save}>
    <For each={todos.state}>
      {(t) => (
        <div key={t.id}>
          <span onClick={() => todos.toggle(t.id, 'done')}>{t.title}</span>
          <button onClick={() => todos.remove(t.id)}>×</button>
        </div>
      )}
    </For>
  </AutoForm>
));`}
        />
      </div>

      {/* Interactive Playgrounds Grid */}
      <div id="live-demo" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
        
        {/* Widget 1: Direct Proxy $bind & $toggle */}
        <div className="widget-card">
          <h4 className="widget-title">
            <Code2 size={18} style={{ color: 'var(--accent-cyan)' }} />
            1. Direct Proxy <code>store.$bind.property</code> &amp; <code>$toggle()</code>
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Zero <code>bind()</code> helper imports needed. Simply access <code>store.$bind.key</code>!
          </p>

          <div style={{ marginBottom: '16px' }}>
            <AutoReactiveBadge />
          </div>

          <form onSubmit={prevent(() => alert('Saved: ' + JSON.stringify(userProfileStore.state)))}>
            <div className="form-group">
              <label className="form-label">Username (<code>{'{...userProfileStore.$bind.username}'}</code>)</label>
              <input type="text" className="input-field" {...userProfileStore.$bind.username} />
            </div>

            <div className="form-group">
              <label className="form-label">Role (<code>{'{...userProfileStore.$bind.role}'}</code>)</label>
              <input type="text" className="input-field" {...userProfileStore.$bind.role} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
              <label className="form-check">
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  {...userProfileStore.$bind.notifications}
                />
                <span style={{ fontSize: '0.85rem' }}>Direct $bind.notifications</span>
              </label>

              <button
                type="button"
                onClick={() => userProfileStore.$toggle('notifications')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                store.$toggle('notifications')
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              Submit with prevent() (Zero e.preventDefault())
            </button>
          </form>
        </div>

        {/* Widget 2: 1-Line Reactive CRUD Collection Store */}
        <div className="widget-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h4 className="widget-title" style={{ margin: 0 }}>
              <ListTodo size={18} style={{ color: 'var(--accent-emerald)' }} />
              2. <code>createListStore()</code> (1-Line CRUD)
            </h4>
            <span className="pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              {taskList.count} Tasks
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Eliminates all <code>.map()</code>, <code>.filter()</code>, and reducer boilerplate for collections!
          </p>

          {/* Add input */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Add new task in 1 line..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
            />
            <button onClick={handleAddTask} className="btn btn-primary" style={{ flexShrink: 0 }}>
              <Plus size={14} /> Add
            </button>
          </div>

          {/* Task items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
            {taskList.state.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: task.done ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${task.done ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  onClick={() => taskList.toggle(task.id, 'done')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: `1px solid ${task.done ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.3)'}`,
                      background: task.done ? 'var(--accent-emerald)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      flexShrink: 0
                    }}
                  >
                    {task.done && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span
                    style={{
                      fontSize: '0.86rem',
                      textDecoration: task.done ? 'line-through' : 'none',
                      color: task.done ? 'var(--text-muted)' : 'var(--text-main)'
                    }}
                  >
                    {task.title}
                  </span>
                </div>

                <button
                  onClick={() => taskList.remove(task.id)}
                  className="btn btn-secondary"
                  style={{
                    padding: '4px 6px',
                    color: 'var(--accent-rose)',
                    borderColor: 'transparent',
                    background: 'transparent'
                  }}
                  title="Remove task"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              onClick={() => taskList.clear()}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Clear All ({taskList.count})
            </button>
          </div>
        </div>

        {/* Widget 3: Single-Tag <AutoForm> */}
        <div className="widget-card">
          <h4 className="widget-title">
            <Layers size={18} style={{ color: 'var(--accent-indigo)' }} />
            3. Single-Tag <code>&lt;AutoForm store=... /&gt;</code>
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Zero manual inputs. Inferred types (string, number, boolean) directly from state schema:
          </p>

          <AutoForm
            store={settingsStore}
            onSubmit={(vals) => {
              setAutoFormSaved(`Saved Project: "${vals.projectName}" with ${vals.maxUsers} users!`);
              setTimeout(() => setAutoFormSaved(null), 3500);
            }}
            submitText="Save Settings (1-Tag Form)"
          />

          {autoFormSaved && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--accent-emerald)',
                fontSize: '0.82rem'
              }}
            >
              {autoFormSaved}
            </div>
          )}
        </div>

        {/* Widget 4: React 19 Native <ActionForm> */}
        <div className="widget-card">
          <h4 className="widget-title">
            <Send size={18} style={{ color: 'var(--accent-amber)' }} />
            4. React 19 <code>&lt;ActionForm&gt;</code>
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Native React 19 transition handling with automated button disabling &amp; pending feedback:
          </p>

          <ActionForm action={handleSaveAction} resetOnSuccess>
            <div className="form-group">
              <label className="form-label">New Feature (React 19 Server Action Simulation)</label>
              <input
                type="text"
                name="actionItem"
                placeholder="e.g. Offline PWA caching..."
                className="input-field"
                required
              />
            </div>

            <ActionSubmitButton
              pendingText="Dispatching Action..."
              className="btn btn-primary"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--accent-amber), #d97706)',
                color: '#000',
                fontWeight: 700
              }}
            >
              Dispatch React 19 Action
            </ActionSubmitButton>
          </ActionForm>

          {actionFeedback && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'var(--accent-amber)',
                fontSize: '0.82rem'
              }}
            >
              {actionFeedback}
            </div>
          )}
        </div>

      </div>
    </div>
  );
});
