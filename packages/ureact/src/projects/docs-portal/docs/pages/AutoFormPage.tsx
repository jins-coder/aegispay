import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { FormDemo } from '../../examples/FormDemo';
import { Layers, CheckCircle2, Send, Sparkles } from 'lucide-react';

export function AutoFormPage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">React 19 Forms &gt; &lt;AutoForm&gt; &amp; &lt;ActionForm&gt;</div>

      <h1 className="doc-title">&lt;AutoForm&gt; &amp; &lt;ActionForm&gt;</h1>
      <p className="doc-lead">
        Forms in React often consume the highest percentage of boilerplate code. uReact provides two modern approaches: <strong>&lt;AutoForm&gt;</strong> for single-tag inferred forms, and <strong>&lt;ActionForm&gt;</strong> for native React 19 server/client actions.
      </p>

      <h2 id="auto-form">1. Single-Tag &lt;AutoForm&gt;</h2>
      <p>
        For profile, settings, and CRUD models, <code>&lt;AutoForm&gt;</code> inspects the store's keys and types to automatically generate styled two-way bound inputs, labels, and submit buttons in <strong>1 single JSX tag</strong>:
      </p>

      <CodeBlock
        code={`import { createStore, AutoForm } from 'ureact';

const projectStore = createStore({
  name: 'NextGen App',
  maxContributors: 10,
  isPublic: true
});

// Entire reactive form with two-way binding generated in 1 line:
export const SettingsPage = () => (
  <AutoForm 
    store={projectStore} 
    onSubmit={(data) => api.saveProject(data)} 
    submitText="Save Settings" 
  />
);`}
        language="tsx"
        title="AutoForm.tsx"
      />

      <h2 id="action-form">2. React 19 &lt;ActionForm&gt;</h2>
      <p>
        <code>&lt;ActionForm&gt;</code> connects directly to React 19's native action transitions. It eliminates <code>e.preventDefault()</code>, tracks pending states, and automatically disables submit buttons during submission:
      </p>

      <CodeBlock
        code={`import { ActionForm, ActionSubmitButton } from 'ureact';

async function updateProfile(formData: FormData) {
  'use server'; // Or client action
  await api.save(formData);
}

export const ProfileAction = () => (
  <ActionForm action={updateProfile} resetOnSuccess>
    <input name="email" type="email" placeholder="Email" required />
    
    {/* Automatically shows "Saving..." and disables while pending */}
    <ActionSubmitButton pendingText="Saving Profile...">
      Update Profile
    </ActionSubmitButton>
  </ActionForm>
);`}
        language="tsx"
        title="ActionFormExample.tsx"
      />

      <h2 id="live-demo">3. Interactive Live Demo: Validation &amp; Two-Way Forms</h2>
      <p style={{ marginBottom: '16px' }}>
        Test real-time validation, touch states, and dirty tracking with <code>useForm</code> below:
      </p>

      {/* Embedded Live Form Demo */}
      <FormDemo />
    </article>
  );
}
