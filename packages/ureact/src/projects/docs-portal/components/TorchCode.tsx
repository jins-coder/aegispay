import React from 'react';
import { ReactDevCodeBlock } from './ReactDevCodeBlock';

export interface TorchCodeProps {
  code: string;
  language?: string;
  title?: string;
  badge?: string;
  badgeType?: 'bad' | 'good' | 'emerald' | 'neutral' | 'react19';
  highlightLines?: number[];
  showLineNumbers?: boolean;
  collapsible?: boolean;
  initialCollapsed?: boolean;
  maxLines?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function TorchCode({
  code,
  language = 'tsx',
  title,
  badge,
  badgeType = 'neutral',
  highlightLines = [],
  showLineNumbers = true,
  collapsible,
  initialCollapsed,
  maxLines,
  className = '',
  style = {}
}: TorchCodeProps) {
  return (
    <ReactDevCodeBlock
      code={code}
      language={language}
      title={title}
      badge={badge}
      badgeType={badgeType}
      highlightLines={highlightLines}
      showLineNumbers={showLineNumbers}
      collapsible={collapsible}
      initialCollapsed={initialCollapsed}
      maxLines={maxLines}
      className={className}
      style={style}
    />
  );
}
