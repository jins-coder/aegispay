import React, { useState } from 'react';
import { useForm } from 'ureact';
import { Check, ShieldCheck, AlertCircle, FileText, Send, RotateCcw } from 'lucide-react';

export function FormDemo() {
  const [submittedData, setSubmittedData] = useState<any>(null);

  const form = useForm({
    initialValues: {
      fullName: 'Sarah Connor',
      email: 'sarah@skynet.defense',
      department: 'engineering',
      securityLevel: 3,
      termsAccepted: true,
      bio: 'Leading tactical cyber operations.'
    },
    validate: (vals) => {
      const errs: any = {};
      if (!vals.fullName || vals.fullName.trim().length < 3) {
        errs.fullName = 'Full name must be at least 3 characters.';
      }
      if (!vals.email || !vals.email.includes('@')) {
        errs.email = 'Please provide a valid email address.';
      }
      if (!vals.termsAccepted) {
        errs.termsAccepted = 'You must accept the security protocol.';
      }
      return errs;
    },
    onSubmit: async (vals) => {
      // Simulate API submit latency
      await new Promise((r) => setTimeout(r, 600));
      setSubmittedData(vals);
    }
  });

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">
            <FileText size={20} style={{ color: 'var(--accent-indigo)' }} />
            Two-Way Form Binding (<code>useForm</code>)
          </h3>
          <p className="panel-subtitle">
            Say goodbye to wiring <code>value={'{...}'}</code> and <code>onChange={'{e => ...}'}</code> for every field. <code>form.bind('field')</code> handles inputs, checkboxes, selects, validation, and aria attributes automatically.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              form.reset();
              setSubmittedData(null);
            }}
            className="btn btn-secondary"
          >
            <RotateCcw size={15} /> Reset Form
          </button>
        </div>
      </div>

      <div className="comparison-grid">
        {/* Standard React Boilerplate */}
        <div className="code-box standard">
          <div className="code-box-header">
            <span>Standard React (Controlled Inputs Hell)</span>
            <span className="code-box-badge badge-bad">Tedious Boilerplate</span>
          </div>
          <pre className="code-content">
            <code>{`const [email, setEmail] = useState('');
const [terms, setTerms] = useState(false);
const [errors, setErrors] = useState({});

const handleSubmit = (e) => {
  e.preventDefault();
  if (!email.includes('@')) {
    setErrors({ email: 'Invalid email' });
    return;
  }
  submitData({ email, terms });
};

// JSX:
<form onSubmit={handleSubmit}>
  <input 
    value={email} 
    onChange={e => setEmail(e.target.value)} 
  />
  <input 
    type="checkbox" 
    checked={terms} 
    onChange={e => setTerms(e.target.checked)} 
  />
</form>`}</code>
          </pre>
        </div>

        {/* uReact Clean Code */}
        <div className="code-box ureact">
          <div className="code-box-header">
            <span>uReact (Declarative Form Binding)</span>
            <span className="code-box-badge badge-good">One-liner Binding</span>
          </div>
          <pre className="code-content">
            <code>{`const form = useForm({
  initialValues: { email: '', terms: false },
  validate: (v) => ({
    email: !v.email.includes('@') ? 'Invalid email' : null,
    terms: !v.terms ? 'Required' : null
  }),
  onSubmit: (values) => submitData(values)
});

// JSX: Zero ceremony binding:
<form {...form.bindForm()}>
  <input {...form.bind('email')} />
  {form.errors.email && <span>{form.errors.email}</span>}

  <input type="checkbox" {...form.bind('terms')} />
  <button type="submit" disabled={form.isSubmitting}>Submit</button>
</form>`}</code>
          </pre>
        </div>
      </div>

      <div className="interactive-playground">
        {/* Form Interactive Widget */}
        <div className="widget-card">
          <h4 className="widget-title">Live Registration & Profile Form</h4>

          <form {...form.bindForm()}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter full name"
                {...form.bind('fullName')}
              />
              {form.touched.fullName && form.errors.fullName && (
                <div className="form-error">
                  <AlertCircle size={13} /> {form.errors.fullName}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="Enter email"
                {...form.bind('email')}
              />
              {form.touched.email && form.errors.email && (
                <div className="form-error">
                  <AlertCircle size={13} /> {form.errors.email}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="select-field" {...form.bind('department')}>
                  <option value="engineering">Engineering</option>
                  <option value="product">Product & UX</option>
                  <option value="security">Cyber Defense</option>
                  <option value="operations">DevOps</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Security Clearance (Level {form.values.securityLevel})</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  className="input-field"
                  style={{ padding: '6px' }}
                  {...form.bind('securityLevel')}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Operational Notes</label>
              <textarea
                className="textarea-field"
                rows={2}
                placeholder="Brief description..."
                {...form.bind('bio')}
              />
            </div>

            <div className="form-group">
              <label className="form-check">
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  {...form.bind('termsAccepted')}
                />
                <span style={{ fontSize: '0.88rem' }}>I accept the encrypted system protocol</span>
              </label>
              {form.touched.termsAccepted && form.errors.termsAccepted && (
                <div className="form-error">
                  <AlertCircle size={13} /> {form.errors.termsAccepted}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
              <button
                type="submit"
                disabled={form.isSubmitting}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {form.isSubmitting ? (
                  <>Encrypting & Saving...</>
                ) : (
                  <>
                    <Send size={16} /> Submit Record
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Form State Visualizer */}
        <div className="widget-card">
          <h4 className="widget-title">
            <ShieldCheck size={18} style={{ color: 'var(--accent-indigo)' }} />
            Form Telemetry (Dirty, Valid, Touched, Submitting)
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <div className="chip" style={{ justifyContent: 'space-between' }}>
              <span>isDirty:</span>
              <strong style={{ color: form.isDirty ? 'var(--accent-cyan)' : 'var(--text-dim)' }}>
                {form.isDirty ? 'true' : 'false'}
              </strong>
            </div>
            <div className="chip" style={{ justifyContent: 'space-between' }}>
              <span>isValid:</span>
              <strong style={{ color: form.isValid ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {form.isValid ? 'true' : 'false'}
              </strong>
            </div>
            <div className="chip" style={{ justifyContent: 'space-between' }}>
              <span>isSubmitting:</span>
              <strong>{form.isSubmitting ? 'true' : 'false'}</strong>
            </div>
            <div className="chip" style={{ justifyContent: 'space-between' }}>
              <span>Error Count:</span>
              <strong style={{ color: Object.keys(form.errors).length ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                {Object.keys(form.errors).length}
              </strong>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Current Form Values & State:
          </p>
          <pre className="state-inspector" style={{ maxHeight: '180px' }}>
            {JSON.stringify(
              {
                values: form.values,
                errors: form.errors,
                touched: form.touched
              },
              null,
              2
            )}
          </pre>

          {submittedData && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px' }}>
                <Check size={16} /> Submission Received Successfully!
              </div>
              <p style={{ fontSize: '0.8rem' }}>
                Form successfully validated and submitted without writing any manual <code>e.preventDefault()</code> or custom state setters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
