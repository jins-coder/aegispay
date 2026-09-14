import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { QueryDemo } from '../../examples/QueryDemo';
import { Database, RefreshCw, Zap } from 'lucide-react';

export function QueryCachePage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">Data Fetching &amp; Cache &gt; Global Query &amp; SWR Cache</div>

      <h1 className="doc-title">Global Query &amp; SWR Cache</h1>
      <p className="doc-lead">
        uReact includes a built-in query client engine with <strong>automatic request deduplication</strong>, <strong>Stale-While-Revalidate (SWR)</strong> caching, window focus revalidation, and optimistic mutations with automatic rollback.
      </p>

      <h2 id="use-query">1. Fetching Data with useQuery</h2>
      <p>
        Identical query keys automatically share the same in-flight network request, eliminating redundant network calls across disparate components:
      </p>

      <CodeBlock
        code={`import { useQuery } from 'ureact';

export function UserHeader() {
  const { data, loading, error, refetch } = useQuery(
    ['user', 42],
    () => api.fetchUser(42),
    {
      staleTime: 60_000,       // Cached for 1 minute
      revalidateOnFocus: true  // Auto-refetch when user focuses browser window
    }
  );

  if (loading) return <div>Loading...</div>;
  return <div>Welcome, {data.name}!</div>;
}`}
        language="tsx"
        title="useQueryExample.tsx"
        showLineNumbers
      />

      <h2 id="use-mutation">2. Optimistic Mutations with useMutation</h2>
      <p>
        Update the UI immediately and rollback automatically if the server throws:
      </p>

      <CodeBlock
        code={`import { useMutation, defaultQueryClient } from 'ureact';

export function UpdateProfileButton() {
  const mutation = useMutation(
    (newName) => api.updateUser(newName),
    {
      // Rollback context saved automatically if network fails:
      onMutate: async (newName) => {
        defaultQueryClient.setQueryData(['user', 42], { name: newName });
      },
      onSuccess: () => {
        defaultQueryClient.invalidate(['user', 42]);
      }
    }
  );

  return (
    <button onClick={() => mutation.mutate('Alex 2.0')}>
      {mutation.loading ? 'Updating...' : 'Update Name'}
    </button>
  );
}`}
        language="tsx"
        title="useMutationExample.tsx"
      />

      <h2 id="live-demo">3. Interactive Live Demo: Request Deduplication &amp; Cache</h2>
      <p style={{ marginBottom: '16px' }}>
        Observe how multiple subscriber widgets share a single network call below:
      </p>

      <QueryDemo />
    </article>
  );
}
