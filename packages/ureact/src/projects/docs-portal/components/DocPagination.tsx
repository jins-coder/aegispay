import React from 'react';
import { ALL_DOC_PAGES, DocItem } from '../docs/docsData';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'ureact';

export interface DocPaginationProps {
  currentPageId: string;
  onSelectPage: (id: string) => void;
}

export function DocPagination({ currentPageId, onSelectPage }: DocPaginationProps) {
  const currentIndex = ALL_DOC_PAGES.findIndex((p) => p.id === currentPageId);
  const prevPage: DocItem | undefined = currentIndex > 0 ? ALL_DOC_PAGES[currentIndex - 1] : undefined;
  const nextPage: DocItem | undefined =
    currentIndex >= 0 && currentIndex < ALL_DOC_PAGES.length - 1
      ? ALL_DOC_PAGES[currentIndex + 1]
      : undefined;

  return (
    <div
      style={{
        marginTop: '64px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '16px'
      }}
    >
      {prevPage ? (
        <Link
          href={prevPage.path}
          onClick={() => onSelectPage(prevPage.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px',
            padding: '12px 18px',
            borderRadius: '10px',
            textDecoration: 'none',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            color: 'var(--text-main, #f8fafc)',
            cursor: 'pointer',
            textAlign: 'left',
            maxWidth: '48%',
            transition: 'all 0.2s ease'
          }}
          className="pagination-btn"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim, #64748b)' }}>
            <ArrowLeft size={13} />
            <span>Previous</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--accent-cyan, #38bdf8)' }}>
            {prevPage.title}
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextPage ? (
        <Link
          href={nextPage.path}
          onClick={() => onSelectPage(nextPage.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
            padding: '12px 18px',
            borderRadius: '10px',
            textDecoration: 'none',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            color: 'var(--text-main, #f8fafc)',
            cursor: 'pointer',
            textAlign: 'right',
            maxWidth: '48%',
            transition: 'all 0.2s ease'
          }}
          className="pagination-btn"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim, #64748b)' }}>
            <span>Next</span>
            <ArrowRight size={13} />
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--accent-cyan, #38bdf8)' }}>
            {nextPage.title}
          </div>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
