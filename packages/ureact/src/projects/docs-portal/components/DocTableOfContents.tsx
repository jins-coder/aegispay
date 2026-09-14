import React from 'react';
import { AlignLeft } from 'lucide-react';

export interface TOCItem {
  id: string;
  text: string;
}

export interface DocTableOfContentsProps {
  items: TOCItem[];
}

export function DocTableOfContents({ items }: DocTableOfContentsProps) {
  if (!items || items.length === 0) return null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside
      className="doc-toc"
      style={{
        width: '220px',
        flexShrink: 0,
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: '64px',
        overflowY: 'auto',
        padding: '24px 16px 40px',
        fontSize: '0.82rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 700,
          color: 'var(--text-dim, #64748b)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.72rem',
          marginBottom: '12px'
        }}
      >
        <AlignLeft size={13} />
        <span>On this page</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #94a3b8)',
              textAlign: 'left',
              cursor: 'pointer',
              padding: '2px 0',
              lineHeight: '1.4',
              transition: 'color 0.15s ease'
            }}
            className="toc-link"
          >
            {item.text}
          </button>
        ))}
      </nav>
    </aside>
  );
}
