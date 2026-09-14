import React, { useState, ReactNode } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';

export interface ReactDevChallengeProps {
  number: number;
  total?: number;
  title: string;
  description: ReactNode;
  solution: ReactNode;
}

export function ReactDevChallenge({
  number,
  total = 2,
  title,
  description,
  solution
}: ReactDevChallengeProps) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="react-dev-challenge">
      <div className="react-dev-challenge-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} className="challenge-icon" />
          <span className="challenge-counter">Challenge {number} of {total}:</span>
          <span className="challenge-title">{title}</span>
        </div>
      </div>

      <div className="react-dev-challenge-body">
        {description}
      </div>

      <div className="react-dev-challenge-footer">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="challenge-solution-btn"
        >
          {showSolution ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span>{showSolution ? 'Hide solution' : 'Show solution'}</span>
        </button>

        {showSolution && (
          <div className="challenge-solution-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '8px', fontSize: '0.82rem' }}>
              <CheckCircle2 size={16} />
              <span>Recommended Solution</span>
            </div>
            {solution}
          </div>
        )}
      </div>
    </div>
  );
}
