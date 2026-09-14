import React from 'react';
import { ReactDevCodeBlock } from './ReactDevCodeBlock';

export interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  badge?: string;
  badgeType?: 'bad' | 'good' | 'emerald' | 'neutral' | 'react19';
  collapsible?: boolean;
  initialCollapsed?: boolean;
  maxLines?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Enhanced Documentation CodeBlock Component
 * Powered by ReactDevCodeBlock with full Beast mode features:
 * - Word wrap toggle
 * - Font size zoomer (A- / A / A+)
 * - Line pinning & click selection
 * - Diff recognition (+ / -)
 * - File download (.tsx / .ts)
 * - Fullscreen distraction-free modal
 * - Auto-folding for long snippets
 */
export function CodeBlock({
  code,
  language = 'tsx',
  title,
  showLineNumbers = true,
  highlightLines = [],
  badge,
  badgeType = 'neutral',
  collapsible,
  initialCollapsed,
  maxLines,
  className,
  style
}: CodeBlockProps) {
  // Infer smart title if not provided (e.g. "example.tsx" or "App.tsx")
  const smartTitle = title || (language === 'bash' || language === 'shell' ? 'terminal' : `example.${language === 'typescript' || language === 'ts' ? 'ts' : 'tsx'}`);

  return (
    <ReactDevCodeBlock
      code={code}
      language={language}
      title={smartTitle}
      showLineNumbers={showLineNumbers}
      highlightLines={highlightLines}
      badge={badge}
      badgeType={badgeType}
      collapsible={collapsible}
      initialCollapsed={initialCollapsed}
      maxLines={maxLines}
      className={className}
      style={style}
    />
  );
}
