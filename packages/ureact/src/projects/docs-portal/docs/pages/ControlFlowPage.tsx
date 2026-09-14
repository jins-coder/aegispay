import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { ControlFlowDemo } from '../../examples/ControlFlowDemo';
import { Layers, Sparkles, Code2 } from 'lucide-react';

export function ControlFlowPage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">Declarative Control Flow &gt; &lt;When&gt;, &lt;Show&gt;, &lt;For&gt;</div>

      <h1 className="doc-title">Declarative Control Flow</h1>
      <p className="doc-lead">
        JSX ternary expressions and manual array <code>.map()</code> keys often produce messy, hard-to-read markup. uReact provides declarative control flow components that make conditionals and collections self-documenting.
      </p>

      <h2 id="when-component">1. The &lt;When&gt; Component</h2>
      <p>
        Replace ternary operator soup with a clean 1-line attribute structure:
      </p>

      <CodeBlock
        code={`import { When } from 'ureact';

// Standard React ternary:
// {isLoggedIn ? <Dashboard user={user} /> : <LoginScreen />}

// uReact clean declarative:
<When 
  is={isLoggedIn} 
  then={<Dashboard user={user} />} 
  else={<LoginScreen />} 
/>`}
        language="tsx"
        title="WhenExample.tsx"
      />

      <h2 id="for-component">2. The &lt;For&gt; Component</h2>
      <p>
        Eliminates empty checks and repetitive key bindings:
      </p>

      <CodeBlock
        code={`import { For } from 'ureact';

<For each={products} fallback={<div>No products found.</div>}>
  {(product) => (
    <div key={product.id}>
      <h4>{product.title}</h4>
      <p>\${product.price}</p>
    </div>
  )}
</For>`}
        language="tsx"
        title="ForExample.tsx"
      />

      <h2 id="fetch-component">3. Single-Tag &lt;Fetch&gt; Component</h2>
      <p>
        Fetches asynchronous data with zero <code>useEffect</code> or <code>useState</code> boilerplate:
      </p>

      <CodeBlock
        code={`import { Fetch } from 'ureact';

<Fetch
  from={() => api.getNotifications()}
  loading={<div>Loading alerts...</div>}
  error={(err) => <div>Failed to load: {err.message}</div>}
>
  {(notifications) => (
    <ul>
      {notifications.map(n => <li key={n.id}>{n.title}</li>)}
    </ul>
  )}
</Fetch>`}
        language="tsx"
        title="FetchExample.tsx"
      />

      <h2 id="live-demo">4. Interactive Live Demo: Control Flow in Action</h2>
      <p style={{ marginBottom: '16px' }}>
        Test list rendering, conditional branching, and fallback states below:
      </p>

      <ControlFlowDemo />
    </article>
  );
}
