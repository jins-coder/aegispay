import React from 'react';
import { Check } from 'lucide-react';

export interface YouWillLearnProps {
  items: string[];
}

export function YouWillLearn({ items }: YouWillLearnProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="react-dev-summary">
      <div className="react-dev-summary-title">You will learn</div>
      <ul className="react-dev-summary-list">
        {items.map((item, idx) => (
          <li key={idx} className="react-dev-summary-item">
            <span className="react-dev-summary-check">
              <Check size={14} strokeWidth={3} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
