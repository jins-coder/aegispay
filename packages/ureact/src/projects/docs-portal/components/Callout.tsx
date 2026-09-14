import React, { ReactNode } from 'react';
import { Info, AlertOctagon, Sparkles, BookOpen } from 'lucide-react';

export interface CalloutProps {
  type?: 'note' | 'tip' | 'important' | 'pitfall' | 'react19' | 'deep-dive';
  title?: string;
  children: ReactNode;
}

export function Callout({ type = 'note', title, children }: CalloutProps) {
  if (type === 'deep-dive') {
    return (
      <div className="react-dev-deep-dive">
        <div className="react-dev-deep-dive-header">
          <BookOpen size={18} className="deep-dive-icon" />
          <span className="deep-dive-tag">DEEP DIVE</span>
          {title && <span className="deep-dive-title">— {title}</span>}
        </div>
        <div className="react-dev-deep-dive-content">{children}</div>
      </div>
    );
  }

  if (type === 'pitfall') {
    return (
      <div className="react-dev-pitfall">
        <div className="react-dev-pitfall-header">
          <AlertOctagon size={18} className="pitfall-icon" />
          <span className="pitfall-tag">PITFALL</span>
          {title && <span className="pitfall-title">— {title}</span>}
        </div>
        <div className="react-dev-pitfall-content">{children}</div>
      </div>
    );
  }

  // Standard Note / Pro-tip / React19
  const isTip = type === 'tip';
  const isReact19 = type === 'react19';

  return (
    <div className={`react-dev-note ${isTip ? 'tip' : ''} ${isReact19 ? 'react19' : ''}`}>
      <div className="react-dev-note-header">
        {isTip ? (
          <Sparkles size={16} className="note-icon tip-icon" />
        ) : (
          <Info size={16} className="note-icon" />
        )}
        <span className="note-tag">
          {isReact19 ? 'REACT 19' : isTip ? 'PRO TIP' : 'NOTE'}
        </span>
        {title && <span className="note-title">— {title}</span>}
      </div>
      <div className="react-dev-note-content">{children}</div>
    </div>
  );
}
