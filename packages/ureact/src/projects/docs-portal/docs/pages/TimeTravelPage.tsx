import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { HistoryDemo } from '../../examples/HistoryDemo';
import { History, Keyboard, Undo2, Redo2 } from 'lucide-react';

export function TimeTravelPage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">Time-Travel &amp; Shortcuts &gt; History &amp; Shortcuts</div>

      <h1 className="doc-title">Time-Travel History &amp; Shortcuts</h1>
      <p className="doc-lead">
        Add full <strong>Undo / Redo</strong> capabilities and declarative <strong>keyboard shortcuts</strong> to any component or drawing tool in minutes with <code>createHistoryStore</code> and <code>useShortcut</code>.
      </p>

      <h2 id="history-store">1. createHistoryStore API</h2>
      <p>
        Maintains an immutable snapshot history stack with cached references for React 18/19 tearing prevention:
      </p>

      <CodeBlock
        code={`import { createHistoryStore, useHistoryStore, useShortcut } from 'ureact';

// 1. Define a state with undo/redo stack capacity
export const editorHistory = createHistoryStore({
  text: 'Hello World',
  fontSize: 16
}, 50); // Keep up to 50 undo steps

export function Editor() {
  const { canUndo, canRedo } = useHistoryStore(editorHistory);

  // 2. Declarative keyboard shortcuts:
  useShortcut('ctrl+z', () => editorHistory.undo());
  useShortcut(['ctrl+y', 'mod+shift+z'], () => editorHistory.redo());

  return (
    <div>
      <button disabled={!canUndo} onClick={() => editorHistory.undo()}>Undo</button>
      <button disabled={!canRedo} onClick={() => editorHistory.redo()}>Redo</button>
    </div>
  );
}`}
        language="tsx"
        title="HistoryStoreExample.tsx"
        showLineNumbers
      />

      <h2 id="live-demo">2. Interactive Live Demo: Drawing Canvas &amp; Shortcuts</h2>
      <p style={{ marginBottom: '16px' }}>
        Draw lines on the canvas below, then press <kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd> or click the controls to time-travel:
      </p>

      <HistoryDemo />
    </article>
  );
}
