import React, { useState } from 'react';
import { createListStore, view } from 'ureact';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { ListTodo, Plus, Trash2, Check, ArrowUp, ArrowDown } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const demoTaskList = createListStore<Task>([
  { id: 1, text: 'Master React 19 Actions & useOptimistic', completed: true },
  { id: 2, text: 'Eliminate manual value/onChange boilerplate with store.$bind', completed: true },
  { id: 3, text: 'Deploy uReact documentation portal to production', completed: false }
]);

const LiveCollectionsCard = view(() => {
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    demoTaskList.add({ text: newTitle.trim(), completed: false });
    setNewTitle('');
  };

  return (
    <div className="widget-card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h4 style={{ margin: 0, color: 'var(--accent-emerald)' }}>Live Collection CRUD Manager</h4>
        <span className="pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
          {demoTaskList.count} Items
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <input
          type="text"
          className="input-field"
          placeholder="New item..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <button onClick={handleAdd} className="btn btn-primary" style={{ flexShrink: 0 }}>
          <Plus size={14} /> Add
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
        {demoTaskList.state.map((task, index) => (
          <div
            key={task.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              background: task.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${task.completed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`
            }}
          >
            <div
              onClick={() => demoTaskList.toggle(task.id, 'completed')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: `1px solid ${task.completed ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.3)'}`,
                  background: task.completed ? 'var(--accent-emerald)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  flexShrink: 0
                }}
              >
                {task.completed && <Check size={12} strokeWidth={3} />}
              </div>
              <span
                style={{
                  fontSize: '0.88rem',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'var(--text-muted)' : 'var(--text-main)'
                }}
              >
                {task.text}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => demoTaskList.move(index, index - 1)}
                disabled={index === 0}
                className="btn btn-secondary"
                style={{ padding: '3px 6px', opacity: index === 0 ? 0.3 : 1 }}
                title="Move up"
              >
                <ArrowUp size={12} />
              </button>
              <button
                onClick={() => demoTaskList.move(index, index + 1)}
                disabled={index === demoTaskList.count - 1}
                className="btn btn-secondary"
                style={{ padding: '3px 6px', opacity: index === demoTaskList.count - 1 ? 0.3 : 1 }}
                title="Move down"
              >
                <ArrowDown size={12} />
              </button>
              <button
                onClick={() => demoTaskList.remove(task.id)}
                className="btn btn-secondary"
                style={{ padding: '3px 6px', color: 'var(--accent-rose)', background: 'transparent', borderColor: 'transparent' }}
                title="Delete item"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
        <button
          onClick={() => demoTaskList.clear()}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
});

export function CollectionsPage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">Reactive State &gt; createListStore (1-Line CRUD)</div>

      <h1 className="doc-title">createListStore (1-Line CRUD)</h1>
      <p className="doc-lead">
        In standard React, managing arrays requires writing dozens of lines of reducer logic, filter-based deletions, and map-based updates. <code>createListStore</code> turns collection management into single-line calls with automatic reactive updates.
      </p>

      <h2 id="overview">1. Built-in Collection Operations</h2>
      <p>
        A <code>createListStore</code> instance provides direct methods out of the box:
      </p>

      <CodeBlock
        code={`import { createListStore, view } from 'ureact';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export const todos = createListStore<Todo>([
  { id: 1, text: 'First task', done: false }
]);

// 1. Add an item (auto-generates unique id if omitted):
todos.add({ text: 'New item', done: false });

// 2. Toggle any boolean property by item ID:
todos.toggle(1, 'done');

// 3. Remove by ID or predicate:
todos.remove(1);

// 4. Update with partial patch or updater function:
todos.update(1, { text: 'Updated title' });

// 5. Re-order items:
todos.move(fromIndex, toIndex);

// 6. Clear list:
todos.clear();`}
        language="tsx"
        title="createListStore API"
        showLineNumbers
      />

      <Callout type="tip" title="Automatic ID Generation">
        If you call <code>{"todos.add({ text: '...' })"}</code> without specifying an <code>id</code>, <code>createListStore</code> automatically assigns a collision-resistant timestamp ID.
      </Callout>

      <h2 id="live-demo">2. Interactive Live Demo</h2>
      <p>
        Try adding, checking off, reordering, and deleting items below:
      </p>

      <LiveCollectionsCard />
    </article>
  );
}
