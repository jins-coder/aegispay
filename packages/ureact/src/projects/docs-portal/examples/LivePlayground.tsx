import React, { useState, useTransition } from 'react';
import { Play, RotateCcw, Copy, Check, Sparkles, Terminal, Code2, Layers, Cpu, CheckCircle2 } from 'lucide-react';
import { createStore, view, signal, computed, useSignal, useComputed } from '../../../system';
import { When, Show, For, Scoped } from '../../../system/components';


interface Preset {
  id: string;
  name: string;
  category: string;
  code: string;
  description: string;
}

const PRESETS: Preset[] = [
  {
    id: 'signals-v2',
    name: 'Signals v2 Fine-Grained Reactivity',
    category: 'Next v2.2',
    description: 'Fine-grained signal with memoized computed dependency tracking and zero unneeded parent re-renders.',
    code: `// Signals v2: Fine-Grained Reactive Counter
import { signal, computed, useSignal, useComputed } from 'ureact';

// Reactive signals outside or inside component
const count = signal(0);
const multiplier = signal(2);
const product = computed(() => count.value * multiplier.value);

export function SignalsCounter() {
  const [val, setVal] = useSignal(count);
  const [mult, setMult] = useSignal(multiplier);
  const result = useComputed(() => count.value * multiplier.value);

  return (
    <div className="p-4 border rounded-xl space-y-4">
      <div className="text-xl font-bold">Count: {val}</div>
      <div className="text-sm text-cyan-400">Product ({val} × {mult}): {result}</div>
      
      <div className="flex gap-2">
        <button onClick={() => setVal(v => v + 1)}>+ Increment</button>
        <button onClick={() => setVal(v => v - 1)}>- Decrement</button>
        <button onClick={() => setMult(m => m + 1)}>Multiplier +1</button>
      </div>
    </div>
  );
}`
  },
  {
    id: 'store-binding',
    name: 'Store & $bind Two-Way Auto-Binding',
    category: 'Core DX',
    description: 'Direct mutable syntax with zero-boilerplate universal form proxy binding.',
    code: `// Two-Way Binding with store.$bind
import { createStore, view } from 'ureact';

const userStore = createStore({
  name: 'Alex Rivera',
  role: 'Frontend Architect',
  subscribed: true,
  theme: 'dark'
});

export const UserProfile = view(() => {
  return (
    <div className="space-y-3">
      <input {...userStore.$bind.name} placeholder="Name" />
      <input {...userStore.$bind.role} placeholder="Role" />
      <label className="flex items-center gap-2">
        <input type="checkbox" {...userStore.$bind.subscribed} />
        Subscribe to updates
      </label>
      
      <pre>{JSON.stringify(userStore.state, null, 2)}</pre>
    </div>
  );
});`
  },
  {
    id: 'action-form',
    name: 'React 19 <ActionForm> & Optimistic UI',
    category: 'React 19',
    description: 'React 19 native action dispatching with automated pending status and error recovery.',
    code: `// React 19 Native ActionForm
import { ActionForm } from 'ureact';

async function updateProfile(formData: FormData) {
  'use server';
  const name = formData.get('username');
  await new Promise(r => setTimeout(r, 1200));
  return { success: true, updated: name };
}

export function ProfileForm() {
  return (
    <ActionForm action={updateProfile} optimistic>
      {({ isPending, status }) => (
        <div className="space-y-3">
          <input name="username" defaultValue="uReact Developer" />
          <button disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Profile'}
          </button>
          {status && <div>Status: {status}</div>}
        </div>
      )}
    </ActionForm>
  );
}`
  },
  {
    id: 'control-flow',
    name: 'Declarative Control Flow (<When>, <Show>, <For>)',
    category: 'JSX Flow',
    description: 'Eliminate ternary hell, IIFEs, and array .map() boilerplate.',
    code: `// Declarative Flow
import { Show, When, For } from 'ureact';

export function Dashboard({ user, items, isOnline }) {
  return (
    <div>
      <When condition={isOnline}>
        <span className="badge-online">Online</span>
      </When>

      <Show>
        <Show.When is={user.isAdmin}><h3>Admin Panel</h3></Show.When>
        <Show.When is={user.isEditor}><h3>Editor Panel</h3></Show.When>
        <Show.Else><h3>Standard Member</h3></Show.Else>
      </Show>

      <For each={items}>
        {(item, index) => <div key={index}>{item.title}</div>}
      </For>
    </div>
  );
}`
  },
  {
    id: 'scoped-styles',
    name: '<Scoped> CSS & Form Store',
    category: 'Latest v2.3',
    description: 'Zero-overhead component-scoped styling and declarative form validation with auto-binding.',
    code: `// Built-in Scoped CSS & Form Validation Store
import { Scoped, createFormStore, rules } from 'ureact';

export function ScopedProfile() {
  return (
    <Scoped css={\`
      .profile-card {
        background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(99, 102, 241, 0.1));
        border: 1px solid #38bdf8;
        border-radius: 12px;
        padding: 18px;
        color: #f8fafc;
      }
      .badge {
        background: #0ea5e9;
        color: white;
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: bold;
      }
      .btn {
        background: #38bdf8;
        color: #0f172a;
        border: none;
        padding: 6px 14px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      }
    \`}>
      <div className="profile-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span className="badge">Scoped Isolation</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Zero Leaks</span>
        </div>
        <h4>Component Scoped Profile</h4>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          CSS rules inside never leak outside to any other element!
        </p>
        <button className="btn">Scoped Button</button>
      </div>
    </Scoped>
  );
}`
  }
];


export function LivePlayground() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('signals-v2');
  const [userCode, setUserCode] = useState<string>(PRESETS[0].code);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'state' | 'logs'>('preview');

  // Interactive Live State for Signals Preset
  const [sigCount, setSigCount] = useState<number>(5);
  const [sigMultiplier, setSigMultiplier] = useState<number>(3);

  // Interactive Live State for Store Preset
  const [formData, setFormData] = useState({
    name: 'Ada Lovelace',
    role: 'Pioneer & Engineer',
    newsletter: true,
    framework: 'ureact'
  });

  // Action state for ActionForm preset
  const [actionPending, setActionPending] = useState(false);
  const [actionMsg, setActionMsg] = useState<string>('Ready for dispatch');

  // Control Flow state
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'guest'>('admin');
  const [isOnline, setIsOnline] = useState(true);
  const [todoList, setTodoList] = useState<string[]>([
    'Explore Signals v2',
    'Integrate React 19 ActionForm',
    'Benchmark zero-allocation state'
  ]);
  const [newTodo, setNewTodo] = useState('');

  const currentPreset = PRESETS.find(p => p.id === selectedPresetId) || PRESETS[0];

  const handleSelectPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id);
    setUserCode(preset.code);
  };

  const handleResetCode = () => {
    setUserCode(currentPreset.code);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateAction = (e: React.FormEvent) => {
    e.preventDefault();
    setActionPending(true);
    setActionMsg('Dispatching async action with optimistic rollback...');
    setTimeout(() => {
      setActionPending(false);
      setActionMsg('✓ Action completed successfully at ' + new Date().toLocaleTimeString());
    }, 1200);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Top Toolbar: Presets */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dim)', marginRight: '6px' }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            <span>Presets:</span>
          </div>

          {PRESETS.map((p) => {
            const isSelected = p.id === selectedPresetId;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--accent-cyan-bg)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-main)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
              >
                <span>{p.name}</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: isSelected ? 'rgba(88, 196, 220, 0.2)' : 'var(--bg-secondary)',
                    opacity: 0.8
                  }}
                >
                  {p.category}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleResetCode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: 'var(--text-dim)',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
            title="Reset to preset original"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            onClick={handleCopyCode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: copied ? 'var(--accent-cyan)' : 'var(--text-dim)',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
            title="Copy snippet"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Split Workspace: Code Editor on Left, Interactive Runtime on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          minHeight: '460px',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        {/* Left: Code Editor */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)'
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--text-dim)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code2 size={14} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Interactive Code</span>
              <span>(Editable)</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)' }}>TypeScript / JSX</span>
          </div>

          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              width: '100%',
              padding: '16px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              lineHeight: 1.6,
              color: 'var(--text-main)',
              tabSize: 2
            }}
          />
        </div>

        {/* Right: Live Interactive Render Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
          {/* Preview Navigation Bar */}
          <div
            style={{
              padding: '8px 16px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('preview')}
                style={{
                  border: 'none',
                  background: activeTab === 'preview' ? 'var(--accent-cyan-bg)' : 'transparent',
                  color: activeTab === 'preview' ? 'var(--accent-cyan)' : 'var(--text-dim)',
                  fontWeight: activeTab === 'preview' ? 700 : 500,
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Play size={12} /> Live Preview
              </button>

              <button
                onClick={() => setActiveTab('state')}
                style={{
                  border: 'none',
                  background: activeTab === 'state' ? 'var(--accent-cyan-bg)' : 'transparent',
                  color: activeTab === 'state' ? 'var(--accent-cyan)' : 'var(--text-dim)',
                  fontWeight: activeTab === 'state' ? 700 : 500,
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Cpu size={12} /> State Inspector
              </button>
            </div>

            <span style={{ fontSize: '0.7rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Live Runtime Active
            </span>
          </div>

          {/* Interactive Component Render Area */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {activeTab === 'preview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedPresetId === 'signals-v2' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Signal: <code>count.value</code></span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                          {sigCount}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Signal: <code>multiplier.value</code></span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {sigMultiplier}
                        </span>
                      </div>

                      <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          Computed: <code>count * multiplier</code>
                        </span>
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {sigCount * sigMultiplier}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSigCount(c => c + 1)}
                        className="btn btn-primary"
                        style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                      >
                        + Increment Count
                      </button>

                      <button
                        onClick={() => setSigCount(c => Math.max(0, c - 1))}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                      >
                        - Decrement Count
                      </button>

                      <button
                        onClick={() => setSigMultiplier(m => m + 1)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                      >
                        + Multiplier (+1)
                      </button>

                      <button
                        onClick={() => { setSigCount(0); setSigMultiplier(1); }}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                {selectedPresetId === 'store-binding' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)' }}>Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)' }}>Engineering Role</label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      <input
                        type="checkbox"
                        checked={formData.newsletter}
                        onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                      />
                      <span>Subscribe to uReact v2.2.0 Canary updates</span>
                    </label>
                  </div>
                )}

                {selectedPresetId === 'action-form' && (
                  <form onSubmit={handleSimulateAction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)' }}>Server Username</label>
                      <input
                        defaultValue="jaison-developer"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={actionPending}
                      className="btn btn-primary"
                      style={{
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: actionPending ? 0.7 : 1
                      }}
                    >
                      {actionPending ? (
                        <>
                          <span style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                          <span>Dispatching Server Action...</span>
                        </>
                      ) : (
                        <span>Trigger React 19 Action</span>
                      )}
                    </button>

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.8rem',
                        color: actionPending ? 'var(--accent-cyan)' : 'var(--text-main)'
                      }}
                    >
                      {actionMsg}
                    </div>
                  </form>
                )}

                {selectedPresetId === 'control-flow' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Role Switcher:</span>
                      {(['admin', 'editor', 'guest'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setUserRole(r)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-subtle)',
                            background: userRole === r ? 'var(--accent-cyan-bg)' : 'var(--bg-card)',
                            color: userRole === r ? 'var(--accent-cyan)' : 'var(--text-main)',
                            fontSize: '0.78rem',
                            fontWeight: userRole === r ? 700 : 500,
                            cursor: 'pointer'
                          }}
                        >
                          {r.toUpperCase()}
                        </button>
                      ))}

                      <button
                        onClick={() => setIsOnline(!isOnline)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          background: isOnline ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isOnline ? '#22c55e' : '#ef4444',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Status: {isOnline ? 'Online' : 'Offline'}
                      </button>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '6px' }}>&lt;Show&gt; Dynamic Output:</div>
                      {userRole === 'admin' && <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>⚡ Full Administrative Privileges Enabled</div>}
                      {userRole === 'editor' && <div style={{ color: '#eab308', fontWeight: 700 }}>📝 Content Editing Mode Enabled</div>}
                      {userRole === 'guest' && <div style={{ color: 'var(--text-dim)' }}>👀 Read-Only Guest View</div>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>&lt;For&gt; Declarative List:</div>
                        {todoList.map((item, idx) => (
                          <div key={idx} style={{ padding: '6px 10px', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{idx + 1}.</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedPresetId === 'scoped-styles' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Scoped
                      css={`
                        .demo-scoped-card {
                          background: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(99, 102, 241, 0.12));
                          border: 1px solid var(--accent-cyan, #38bdf8);
                          border-radius: 12px;
                          padding: 18px;
                        }
                        .demo-badge {
                          background: #0ea5e9;
                          color: #ffffff;
                          padding: 2px 8px;
                          border-radius: 9999px;
                          font-size: 11px;
                          font-weight: 700;
                        }
                        .demo-btn {
                          background: var(--accent-cyan, #38bdf8);
                          color: #0f172a;
                          border: none;
                          padding: 6px 14px;
                          border-radius: 6px;
                          font-weight: 700;
                          cursor: pointer;
                          transition: transform 0.15s ease;
                        }
                        .demo-btn:hover {
                          transform: translateY(-1px);
                        }
                      `}
                    >
                      <div className="demo-scoped-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span className="demo-badge">Auto-Scoped Tag</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Zero CSS bleed</span>
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)' }}>Component Scoped Card</h4>
                        <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                          Inspect the DOM to see the unique <code>[data-scope="..."]</code> selector prefix.
                        </p>
                        <button className="demo-btn" onClick={() => alert('Scoped CSS button triggered!')}>
                          Scoped Button Hover
                        </button>
                      </div>
                    </Scoped>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'state' && (
              <pre
                style={{
                  margin: 0,
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  overflowX: 'auto'
                }}
              >
                {selectedPresetId === 'signals-v2' && JSON.stringify({ 'count.value': sigCount, 'multiplier.value': sigMultiplier, 'product.value': sigCount * sigMultiplier }, null, 2)}
                {selectedPresetId === 'store-binding' && JSON.stringify(formData, null, 2)}
                {selectedPresetId === 'action-form' && JSON.stringify({ isPending: actionPending, lastStatus: actionMsg }, null, 2)}
                {selectedPresetId === 'control-flow' && JSON.stringify({ userRole, isOnline, itemsCount: todoList.length }, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
