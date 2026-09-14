import React, { useState } from 'react';
import { preload, preconnect, prefetchDNS, Head } from 'ureact';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { Globe, Network, Check, ExternalLink } from 'lucide-react';

const LiveResourceWidget = () => {
  const [docTitle, setDocTitle] = useState('uReact v2.1 — React 19 Docs');
  const [log, setLog] = useState<string | null>(null);

  const handlePreload = () => {
    preload('https://fonts.googleapis.com/css2?family=Fira+Code&display=swap', { as: 'style' });
    setLog('✓ preload("https://fonts.googleapis.com/...", { as: "style" }) executed.');
    setTimeout(() => setLog(null), 3500);
  };

  const handlePreconnect = () => {
    preconnect('https://api.github.com', { crossOrigin: 'anonymous' });
    prefetchDNS('https://cdn.jsdelivr.net');
    setLog('✓ preconnect("https://api.github.com") and prefetchDNS("https://cdn.jsdelivr.net") executed.');
    setTimeout(() => setLog(null), 3500);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '20px' }}>
      <div className="widget-card">
        <Head title={docTitle} description="uReact documentation on React 19 resource loading" />

        <h4 style={{ margin: 0, color: 'var(--accent-indigo)', marginBottom: '12px' }}>
          1. Document Metadata Hoisting (&lt;Head&gt;)
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Change the title below and inspect your browser tab:
        </p>
        <input
          type="text"
          className="input-field"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
        />
        <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
          Current document.title: <strong>"{docTitle}"</strong>
        </div>
      </div>

      <div className="widget-card">
        <h4 style={{ margin: 0, color: 'var(--accent-emerald)', marginBottom: '12px' }}>
          2. Imperative Preloading Helpers
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Warm up network sockets and preload assets before user navigation:
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <button onClick={handlePreload} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            preload(font, 'style')
          </button>
          <button onClick={handlePreconnect} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            preconnect(api)
          </button>
        </div>

        {log && (
          <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', fontSize: '0.82rem' }}>
            {log}
          </div>
        )}
      </div>
    </div>
  );
};

export function React19ResourcesPage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">React 19 Native Engine &gt; Resource Preloading &amp; &lt;Head&gt;</div>

      <h1 className="doc-title">Resource Preloading &amp; &lt;Head&gt;</h1>
      <p className="doc-lead">
        React 19 natively manages document head elements, asset preloading, stylesheet precedence, and async script loading without external dependencies like <code>react-helmet</code>.
      </p>

      <h2 id="preload-helpers">1. Preloading APIs</h2>
      <p>
        Call preloading helpers imperatively inside event handlers or components:
      </p>

      <CodeBlock
        code={`import { preload, preconnect, prefetchDNS, preinit } from 'ureact';

// Preload a critical stylesheet or font:
preload('https://example.com/styles.css', { as: 'style' });

// Preconnect to an API domain before user clicks:
preconnect('https://api.myapp.com');

// Prefetch DNS resolution:
prefetchDNS('https://cdn.myapp.com');`}
        language="tsx"
        title="PreloadExample.ts"
      />

      <h2 id="head-component">2. &lt;Head&gt; Component</h2>
      <p>
        Render <code>&lt;Head title="..." description="..." /&gt;</code> anywhere in your component tree. React 19 automatically hoists the tags into the real <code>&lt;head&gt;</code> element:
      </p>

      <CodeBlock
        code={`import { Head } from 'ureact';

export function ProductPage({ product }) {
  return (
    <div>
      <Head 
        title={\`\${product.name} | My Store\`}
        description={product.summary}
      />
      <h1>{product.name}</h1>
    </div>
  );
}`}
        language="tsx"
        title="ProductPage.tsx"
      />

      <h2 id="live-demo">3. Interactive Live Demo</h2>
      <LiveResourceWidget />
    </article>
  );
}
