import React from 'react';
import { UReactLogo } from '../../components/UReactLogo';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { YouWillLearn } from '../../components/YouWillLearn';
import { ReactDevChallenge } from '../../components/ReactDevChallenge';
import { Sparkles, Terminal, Package, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export function QuickstartPage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">
        <span>LEARN REACT</span>
        <span>&gt;</span>
        <span style={{ color: 'var(--text-main)' }}>QUICK START</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '20px 0 12px' }}>
        <UReactLogo size={52} />
        <h1 className="doc-title" style={{ margin: 0 }}>Quick Start</h1>
      </div>

      <p className="doc-lead">
        Welcome to the official <strong>uReact</strong> documentation! This guide will introduce you to the core React concepts you will use on a daily basis, and how uReact eliminates 80% of the repetitive hook and boilerplate ceremony.
      </p>

      {/* Official react.dev "You will learn" Overview Card */}
      <YouWillLearn
        items={[
          'How to create components and nest them cleanly in JSX',
          'How to manage deep reactive state with zero useState boilerplate',
          'How to two-way bind input elements in a single store.$bind attribute',
          'How to render dynamic lists with <For> and conditionals with <Show>',
          'How uReact connects to the official React 19 Fiber reconciler'
        ]}
      />

      <h2 id="installation">1. Installation</h2>
      <p>
        Install uReact into your existing React 19 project or create a new one using your preferred package manager:
      </p>

      <CodeBlock
        code={`npm install ureact react@^19.0.0 react-dom@^19.0.0`}
        language="bash"
        title="Terminal"
      />

      <Callout type="note" title="Zero Dependencies">
        uReact has <strong>zero runtime dependencies</strong> outside of peer <code>react</code> and <code>react-dom</code>. It compiles into clean, tree-shakeable ESM (<code>43 kB</code>) and CommonJS distributions.
      </Callout>

      <h2 id="first-component">2. Your First Reactive Component</h2>
      <p>
        React components are regular JavaScript functions that return markup. In standard React, managing state requires multiple <code>useState</code> calls, setter ceremony, and manual change handlers.
      </p>
      <p>
        In uReact, simply define a reactive store with <code>createStore()</code>, wrap your component in <code>view()</code>, and bind any input field directly:
      </p>

      <CodeBlock
        code={`import { createStore, view, prevent } from 'ureact';

// 1. Define a reactive deep proxy store
export const userStore = createStore({
  name: 'Alex Chen',
  role: 'Frontend Engineer',
  newsletter: true
});

// 2. view() automatically subscribes to read store properties
export const UserProfile = view(() => (
  <form onSubmit={prevent(() => alert('Saved: ' + userStore.state.name))}>
    <h2>Welcome, {userStore.state.name}!</h2>

    {/* Direct two-way binding: zero onChange or value boilerplate */}
    <input {...userStore.$bind.name} placeholder="Name" />
    <input {...userStore.$bind.role} placeholder="Role" />
    
    <label>
      <input type="checkbox" {...userStore.$bind.newsletter} />
      Subscribe to weekly updates
    </label>

    <button type="submit">Save Profile</button>
  </form>
));`}
        language="tsx"
        title="UserProfile.tsx"
        showLineNumbers
        highlightLines={[4, 5, 6, 7, 8, 17, 18, 21]}
      />

      {/* Official react.dev Pitfall Callout */}
      <Callout type="pitfall" title="Do not mutate standard React useState state directly">
        When using standard React <code>useState</code>, you must never mutate state directly (e.g. <code>state.name = 'Alex'</code>) because React will not detect the change. With uReact <code>createStore</code>, proxy traps intercept mutations automatically and dispatch updates to React's concurrent scheduler!
      </Callout>

      <h2 id="collections-and-lists">3. Dynamic Lists &amp; Control Flow</h2>
      <p>
        Rendering lists with standard React requires writing <code>items.map()</code>, manually managing keys, and writing ternary operators for empty fallbacks.
      </p>
      <p>
        uReact provides declarative control flow components like <code>&lt;For&gt;</code> and <code>&lt;Show&gt;</code> that streamline JSX templates:
      </p>

      <CodeBlock
        code={`import { createListStore, view, For, Show } from 'ureact';

const taskList = createListStore([
  { id: 1, text: 'Eliminate useEffect boilerplate', done: true },
  { id: 2, text: 'Try uReact two-way binding', done: false }
]);

export const TaskBoard = view(() => (
  <div>
    <h3>Project Tasks ({taskList.length})</h3>

    {/* Declarative list with automatic key extraction and empty fallback */}
    <For each={taskList.state} fallback={<p>No tasks remaining! 🎉</p>}>
      {(task) => (
        <div key={task.id} style={{ display: 'flex', gap: '8px' }}>
          <span onClick={() => taskList.toggle(task.id, 'done')}>
            {task.done ? '✅' : '⏳'} {task.text}
          </span>
          <button onClick={() => taskList.remove(task.id)}>Remove</button>
        </div>
      )}
    </For>
  </div>
));`}
        language="tsx"
        title="TaskBoard.tsx"
        showLineNumbers
        highlightLines={[3, 4, 5, 6, 14, 15, 16, 17]}
      />

      {/* Official react.dev Deep Dive Card */}
      <Callout type="deep-dive" title="How does uReact avoid tearing during concurrent rendering?">
        uReact connects directly to React 18 &amp; 19's official <code>useSyncExternalStore</code> hook. Each component wrapped in <code>view()</code> automatically collects reactive dependencies during its render phase. When a proxy store mutates, a lightweight microtask batch dispatches the updated snapshot to React Fiber without tearing, race conditions, or unmounted leaks.
      </Callout>

      <h2 id="react-19-actions">4. React 19 Actions &amp; Async Tasks</h2>
      <p>
        React 19 introduces native Actions (<code>useActionState</code>) and the new unified <code>use(Promise)</code> resource unwrapping API. uReact includes resilient, 100% compliant polyfill implementations that run identically across React 18 and React 19:
      </p>

      <CodeBlock
        code={`import { useAction, ActionSubmitButton } from 'ureact';

async function updateProfile(prevState, formData) {
  'use server';
  const name = formData.get('username');
  await api.save(name);
  return { success: true, name };
}

export function ProfileForm() {
  const { data, isPending, formAction } = useAction(updateProfile, { success: false });

  return (
    <form action={formAction}>
      <input name="username" placeholder="Username" required />
      
      {/* Auto-pending disabled button using useFormStatus under the hood */}
      <ActionSubmitButton pendingText="Saving...">
        Update Profile
      </ActionSubmitButton>

      {data.success && <p>Updated successfully to {data.name}!</p>}
    </form>
  );
}`}
        language="tsx"
        title="ActionProfile.tsx"
        showLineNumbers
      />

      {/* Official react.dev Challenges Section */}
      <h2 id="challenges" style={{ marginTop: '48px' }}>
        Try Out Some Challenges
      </h2>
      <p>
        Put what you learned into practice with these two quick exercises:
      </p>

      {/* Challenge 1 */}
      <ReactDevChallenge
        number={1}
        total={2}
        title="Bind a search query input with zero useState ceremony"
        description={
          <div>
            <p>
              In the code editor below, create a reactive store for a search bar containing a <code>query</code> string property and two-way bind it to an input field.
            </p>
          </div>
        }
        solution={
          <div>
            <p>Here is how you solve it with <code>createStore</code> and <code>store.$bind</code>:</p>
            <CodeBlock
              code={`import { createStore, view } from 'ureact';

const searchStore = createStore({ query: '' });

export const SearchBar = view(() => (
  <div>
    <input {...searchStore.$bind.query} placeholder="Search documents..." />
    <p>Searching for: {searchStore.state.query}</p>
  </div>
));`}
              language="tsx"
            />
          </div>
        }
      />

      {/* Challenge 2 */}
      <ReactDevChallenge
        number={2}
        total={2}
        title="Render an empty state fallback using <For>"
        description={
          <div>
            <p>
              Write a component that displays a list of bookmarks, or an empty message if no bookmarks exist.
            </p>
          </div>
        }
        solution={
          <div>
            <p>Use the built-in <code>fallback</code> prop on <code>&lt;For&gt;</code>:</p>
            <CodeBlock
              code={`import { For } from 'ureact';

export function BookmarkList({ bookmarks }) {
  return (
    <For each={bookmarks} fallback={<p>No bookmarks saved yet!</p>}>
      {(bookmark) => (
        <a key={bookmark.id} href={bookmark.url}>
          {bookmark.title}
        </a>
      )}
    </For>
  );
}`}
              language="tsx"
            />
          </div>
        }
      />
    </article>
  );
}
