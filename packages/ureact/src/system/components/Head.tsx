import React, { ReactNode, useEffect } from 'react';

export interface HeadProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

/**
 * Native React 19 Document Metadata component.
 * 
 * In React 19, <title>, <meta>, and <link> elements are automatically hoisted
 * to the document <head> without requiring external libraries like react-helmet!
 */
export function Head({ title, description, children }: HeadProps) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (title) document.title = title;
      if (description) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'description');
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return children ? <>{children}</> : null;
}

export function useHead(options: { title?: string; description?: string }) {
  // In React 19, document.title can also be set or rendered via Head component
  if (typeof document !== 'undefined') {
    if (options.title) {
      document.title = options.title;
    }
  }
}
