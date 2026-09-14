import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { YouWillLearn } from '../../components/YouWillLearn';
import { ReactDevChallenge } from '../../components/ReactDevChallenge';
import { React19Demo } from '../../examples/React19Demo';
import { Zap, Sparkles, Send, RotateCcw } from 'lucide-react';

export function React19ActionsPage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">
        <span>LEARN REACT</span>
        <span>&gt;</span>
        <span style={{ color: 'var(--text-main)' }}>REACT 19 ACTIONS</span>
      </div>

      <h1 className="doc-title">React 19 Actions &amp; useOptimistic</h1>
      <p className="doc-lead">
        React 19 introduces native <strong>Actions</strong> and the <strong>useOptimistic</strong> hook. In uReact, the <code>useAction</code> hook unifies <code>useActionState</code> and <code>useOptimistic</code> into a single typed interface with zero ceremony.
      </p>

      {/* react.dev "You will learn" Summary */}
      <YouWillLearn
        items={[
          'What React 19 Actions are and how they differ from manual async event handlers',
          'How useAction unifies useActionState and useOptimistic into one typed API',
          'How to implement instant 0ms optimistic UI updates with automatic server rollback',
          'How useActionStatus safely reads submission state from deeply nested child components'
        ]}
      />

      <Callout type="react19" title="React 19 Native Feature">
        Actions in React 19 run inside concurrent transitions. They automatically handle pending states, optimistic updates, and form submissions without manual <code>isPending</code> flags or <code>e.preventDefault()</code>.
      </Callout>

      <h2 id="use-action">1. The useAction Hook</h2>
      <p>
        Compare standard React 19 boilerplate with uReact's unified <code>useAction</code>:
      </p>

      <CodeBlock
        code={`import { useAction } from 'ureact';

interface Comment {
  id: string;
  text: string;
}

export function CommentsSection() {
  const action = useAction<
    { text: string }, // Action payload type
    Comment[]         // State type
  >(
    async (prev, payload) => {
      // Async server call
      const saved = await api.postComment(payload.text);
      return [...prev, saved];
    },
    initialComments,
    {
      // Instant 0ms optimistic UI update before server responds:
      optimisticUpdate: (prev, payload) => [
        ...prev,
        { id: 'temp', text: payload.text, isOptimistic: true }
      ]
    }
  );

  return (
    <div>
      {/* action.data automatically reflects optimistic state */}
      {action.data.map(c => <div key={c.id}>{c.text}</div>)}

      {/* Direct execution with typed payload */}
      <button 
        disabled={action.isPending} 
        onClick={() => action.run({ text: 'Hello React 19!' })}
      >
        {action.isPending ? 'Sending...' : 'Post'}
      </button>
    </div>
  );
}`}
        language="tsx"
        title="useActionExample.tsx"
        showLineNumbers
        highlightLines={[8, 9, 10, 11, 16, 17, 18, 19]}
      />

      {/* react.dev Deep Dive Card */}
      <Callout type="deep-dive" title="How does optimistic rollback work under the hood?">
        When an optimistic action starts, React 19 creates a transitional snapshot of the current state and renders your <code>optimisticUpdate</code> immediately. If the server request succeeds, the returned server payload replaces the temporary optimistic item. If the network fails or throws an error, React automatically discards the transitional render and reverts to the last verified state with zero custom rollback code!
      </Callout>

      <h2 id="form-status">2. Nested Status &amp; Reset</h2>
      <p>
        Use <code>useActionStatus</code> to check if a parent form action is executing from any deeply nested button or input, and <code>resetForm</code> to trigger native React 19 form resets:
      </p>

      <CodeBlock
        code={`import { useActionStatus, resetForm } from 'ureact';

export function SubmitButton() {
  const { pending } = useActionStatus();
  return <button disabled={pending}>{pending ? 'Saving...' : 'Submit'}</button>;
}`}
        language="tsx"
        title="useActionStatus.tsx"
      />

      {/* react.dev Pitfall Card */}
      <Callout type="pitfall" title="useFormStatus only works inside a <form> child component">
        In standard React 19, calling <code>useFormStatus()</code> in the same component that renders the <code>&lt;form&gt;</code> returns <code>pending: false</code>. It must be called from a nested child component inside the form. In uReact, <code>&lt;ActionSubmitButton&gt;</code> encapsulates this pattern automatically.
      </Callout>

      <h2 id="live-demo">3. Interactive Live Playground</h2>
      <p style={{ marginBottom: '16px' }}>
        Experience instant optimistic UI updates and concurrent action transitions live:
      </p>

      <React19Demo />

      {/* react.dev Challenges */}
      <h2 id="challenges" style={{ marginTop: '48px' }}>
        Try Out Some Challenges
      </h2>

      <ReactDevChallenge
        number={1}
        total={1}
        title="Create an optimistic like button"
        description={
          <div>
            <p>
              Build an optimistic like button that increments the like count immediately by +1 on click while an asynchronous server request saves the like in the background.
            </p>
          </div>
        }
        solution={
          <div>
            <p>Use <code>useAction</code> with <code>optimisticUpdate</code>:</p>
            <CodeBlock
              code={`import { useAction } from 'ureact';

export function LikeButton({ initialLikes = 0 }) {
  const action = useAction(
    async (prev) => {
      await api.saveLike();
      return prev + 1;
    },
    initialLikes,
    {
      optimisticUpdate: (prev) => prev + 1
    }
  );

  return (
    <button onClick={() => action.run()} disabled={action.isPending}>
      ❤️ {action.data} {action.isPending ? '(saving...)' : ''}
    </button>
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
