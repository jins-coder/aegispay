import React, { useState, useEffect } from 'react';
import { CodeBlock } from './CodeBlock';
import { X, Sparkles, Copy, Check, Code2, ArrowRight, Layers, FileText, CheckCircle2 } from 'lucide-react';

export interface HookUsageModalData {
  name: string;
  version?: string;
  purpose?: string;
  signature: string;
  ureactEquivalent?: string;
  whyBetter?: string;
  example: string;
  standardReactExample?: string;
  parameters?: { name: string; type: string; description: string }[];
  returns?: string;
}

export interface HookUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HookUsageModalData | null;
}

export function HookUsageModal({ isOpen, onClose, data }: HookUsageModalProps) {
  const [activeTab, setActiveTab] = useState<'ureact' | 'react' | 'specs'>('ureact');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab('ureact');
  }, [data?.name]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const handleCopy = () => {
    const codeToCopy = activeTab === 'react' && data.standardReactExample
      ? data.standardReactExample
      : data.example;
    navigator.clipboard?.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          background: 'var(--bg-card, #0f172a)',
          border: '1px solid var(--border-subtle, #1e293b)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle, #1e293b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary, #0b1120)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                fontSize: '1.15rem',
                color: 'var(--accent-cyan, #38bdf8)'
              }}
            >
              {data.name}()
            </span>

            {data.version && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                {data.version}
              </span>
            )}

            {data.ureactEquivalent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim, #94a3b8)' }}>
                <ArrowRight size={13} color="var(--accent-cyan, #38bdf8)" />
                <span style={{ color: 'var(--accent-emerald, #34d399)', fontWeight: 600, fontFamily: 'var(--font-mono, monospace)' }}>
                  {data.ureactEquivalent}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim, #64748b)', fontFamily: 'var(--font-mono, monospace)' }}>
              ESC to close
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim, #94a3b8)',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 20px',
            borderBottom: '1px solid var(--border-subtle, #1e293b)',
            background: 'var(--bg-card, #0f172a)'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('ureact')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeTab === 'ureact' ? 'var(--accent-cyan, #38bdf8)' : 'transparent',
                background: activeTab === 'ureact' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: activeTab === 'ureact' ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-dim, #94a3b8)',
                fontWeight: activeTab === 'ureact' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={13} />
              <span>uReact Usage Example</span>
            </button>

            {data.standardReactExample && (
              <button
                onClick={() => setActiveTab('react')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: activeTab === 'react' ? '#818cf8' : 'transparent',
                  background: activeTab === 'react' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: activeTab === 'react' ? '#818cf8' : 'var(--text-dim, #94a3b8)',
                  fontWeight: activeTab === 'react' ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Code2 size={13} />
                <span>Standard React (Legacy)</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('specs')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeTab === 'specs' ? '#34d399' : 'transparent',
                background: activeTab === 'specs' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                color: activeTab === 'specs' ? '#34d399' : 'var(--text-dim, #94a3b8)',
                fontWeight: activeTab === 'specs' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={13} />
              <span>Signature &amp; Specs</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle, #1e293b)',
              background: 'var(--bg-secondary, #0b1120)',
              color: copied ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-dim, #94a3b8)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {data.purpose && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid rgba(56, 189, 248, 0.15)',
                fontSize: '0.86rem',
                color: 'var(--text-main, #e2e8f0)',
                lineHeight: 1.5
              }}
            >
              <strong style={{ color: 'var(--accent-cyan, #38bdf8)' }}>Purpose: </strong>
              {data.purpose}
            </div>
          )}

          {activeTab === 'ureact' && (
            <div>
              <CodeBlock
                code={data.example}
                language="tsx"
                title={`${data.name}.example.tsx`}
                showLineNumbers
              />

              {data.whyBetter && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary, #0b1120)',
                    border: '1px solid var(--border-subtle, #1e293b)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted, #94a3b8)',
                    lineHeight: 1.6
                  }}
                >
                  <Sparkles size={16} style={{ color: 'var(--accent-cyan, #38bdf8)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-main, #f8fafc)' }}>Why uReact is better: </strong>
                    {data.whyBetter}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'react' && data.standardReactExample && (
            <div>
              <CodeBlock
                code={data.standardReactExample}
                language="tsx"
                title={`Legacy_${data.name}.tsx`}
                showLineNumbers
              />
              <div
                style={{
                  marginTop: '14px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.82rem',
                  color: '#f87171'
                }}
              >
                ⚠️ Standard React requires manual boilerplate, dependency arrays, or setter ceremony that uReact eliminates.
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim, #64748b)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Signature:
                </div>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#040711',
                    border: '1px solid var(--border-subtle, #1e293b)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.84rem',
                    color: 'var(--accent-indigo, #818cf8)',
                    overflowX: 'auto'
                  }}
                >
                  {data.signature}
                </div>
              </div>

              {data.returns && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim, #64748b)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Return Value:
                  </div>
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-secondary, #0b1120)',
                      border: '1px solid var(--border-subtle, #1e293b)',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.82rem',
                      color: 'var(--accent-emerald, #34d399)'
                    }}
                  >
                    {data.returns}
                  </div>
                </div>
              )}

              {data.parameters && data.parameters.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim, #64748b)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Parameters:
                  </div>
                  <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle, #1e293b)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-secondary, #0b1120)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle, #1e293b)' }}>
                          <th style={{ padding: '8px 12px', color: 'var(--accent-cyan, #38bdf8)' }}>Name</th>
                          <th style={{ padding: '8px 12px', color: 'var(--text-main, #f8fafc)' }}>Type</th>
                          <th style={{ padding: '8px 12px', color: 'var(--text-main, #f8fafc)' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.parameters.map((p, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle, #1e293b)' }}>
                            <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-main, #f8fafc)', fontWeight: 600 }}>
                              {p.name}
                            </td>
                            <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-indigo, #818cf8)' }}>
                              {p.type}
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-muted, #94a3b8)' }}>
                              {p.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-subtle, #1e293b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary, #0b1120)'
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim, #64748b)' }}>
            Official uReact v2.3.0 Interactive Hook Documentation
          </span>

          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              background: 'var(--accent-cyan, #0ea5e9)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
