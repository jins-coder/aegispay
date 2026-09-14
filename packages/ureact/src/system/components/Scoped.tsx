import React, { useEffect, useId, useMemo, useState } from 'react';

// Global style registry for reference counting and deduplication
const styleRegistry = new Map<string, { count: number; element: HTMLStyleElement }>();

/**
 * Fast string hash for generating stable CSS scope identifiers
 */
function hashCSS(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'us-' + Math.abs(hash).toString(36);
}

/**
 * Scopes CSS rules by prefixing selectors with the scope attribute selector
 */
export function scopeCSS(rawCSS: string, scopeId: string): string {
  const scopeSelector = `[data-scope="${scopeId}"]`;
  
  // Clean comments
  const cleanCSS = rawCSS.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Basic CSS rule matcher: selector { styles }
  return cleanCSS.replace(/([^{}]+)({[^{}]*})/g, (match, selectors, body) => {
    // Skip @keyframes, @media, @supports declarations
    const trimmedSelectors = selectors.trim();
    if (trimmedSelectors.startsWith('@')) {
      return match;
    }

    const scopedSelectors = trimmedSelectors
      .split(',')
      .map((sel: string) => {
        const s = sel.trim();
        if (!s) return '';
        // Handle :host or & to target the scoped container itself
        if (s === ':host' || s === '&') {
          return scopeSelector;
        }
        if (s.startsWith(':host(')) {
          const inner = s.slice(6, -1);
          return `${scopeSelector}${inner}`;
        }
        // Prefix selector: [data-scope="id"] .btn
        return `${scopeSelector} ${s}`;
      })
      .filter(Boolean)
      .join(', ');

    return `${scopedSelectors} ${body}`;
  });
}

/**
 * Injects scoped CSS into document.head with ref-counted lifecycle
 */
export function injectScopedCSS(css: string, scopeId: string): () => void {
  if (typeof document === 'undefined') return () => {};

  const existing = styleRegistry.get(scopeId);
  if (existing) {
    existing.count++;
    return () => {
      existing.count--;
      if (existing.count <= 0) {
        existing.element.remove();
        styleRegistry.delete(scopeId);
      }
    };
  }

  const scopedRules = scopeCSS(css, scopeId);
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-ureact-scoped', scopeId);
  styleEl.textContent = scopedRules;
  document.head.appendChild(styleEl);

  const entry = { count: 1, element: styleEl };
  styleRegistry.set(scopeId, entry);

  return () => {
    entry.count--;
    if (entry.count <= 0) {
      entry.element.remove();
      styleRegistry.delete(scopeId);
    }
  };
}

/**
 * Hook to inject and scope CSS rules to a unique component scope
 * 
 * @example
 * ```tsx
 * function Card() {
 *   const { scopeProps } = useScopedCSS(`
 *     .card { background: #1e293b; padding: 1rem; border-radius: 8px; }
 *     .title { color: #38bdf8; font-weight: bold; }
 *   `);
 *   return (
 *     <div {...scopeProps} className="card">
 *       <h2 className="title">Scoped Card</h2>
 *     </div>
 *   );
 * }
 * ```
 */
export function useScopedCSS(css: string): {
  scopeId: string;
  scopeProps: { 'data-scope': string };
  className: string;
} {
  const scopeId = useMemo(() => hashCSS(css), [css]);

  useEffect(() => {
    const cleanup = injectScopedCSS(css, scopeId);
    return cleanup;
  }, [css, scopeId]);

  return {
    scopeId,
    scopeProps: { 'data-scope': scopeId },
    className: scopeId,
  };
}

export interface ScopedProps {
  /** The CSS stylesheet content to scope exclusively to this component */
  css: string;
  /** HTML tag or component for the wrapper container (default: 'div') */
  as?: React.ElementType;
  /** Additional CSS class names for the container */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Children or render function receiving scope helpers */
  children?: React.ReactNode | ((helpers: { scopeId: string; scopeProps: { 'data-scope': string } }) => React.ReactNode);
}


/**
 * <Scoped> Component
 * 
 * Provides built-in scoped styles for React components without requiring CSS modules,
 * Tailwind, or heavy CSS-in-JS runtimes. Styles are injected on mount and removed on unmount.
 * 
 * @example
 * ```tsx
 * <Scoped css={`
 *   .badge { background: #0ea5e9; color: white; padding: 4px 8px; border-radius: 4px; }
 *   .badge:hover { background: #0284c7; }
 * `}>
 *   <span className="badge">Auto Scoped Tag</span>
 * </Scoped>
 * ```
 */
export function Scoped({
  css,
  as: Component = 'div',
  className = '',
  style,
  children,
  ...rest
}: ScopedProps & Record<string, any>) {
  const { scopeId, scopeProps } = useScopedCSS(css);

  const renderedChildren = typeof children === 'function'
    ? children({ scopeId, scopeProps })
    : children;

  const Tag = Component as any;

  return (
    <Tag
      {...rest}
      {...scopeProps}
      className={className ? `${className} ${scopeId}` : scopeId}
      style={style}
    >
      {renderedChildren}
    </Tag>
  );
}
