import React, { useEffect } from 'react';
import {
  preload as rdPreload,
  preinit as rdPreinit,
  prefetchDNS as rdPrefetchDNS,
  preconnect as rdPreconnect,
  preloadModule as rdPreloadModule,
  preinitModule as rdPreinitModule
} from 'react-dom';

export interface PreloadOptions {
  as: 'script' | 'style' | 'font' | 'image' | 'fetch';
  crossOrigin?: string;
  integrity?: string;
  type?: string;
  nonce?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  imageSrcSet?: string;
  imageSizes?: string;
  referrerPolicy?: string;
}

export interface PreinitOptions {
  as: 'script' | 'style';
  crossOrigin?: string;
  integrity?: string;
  nonce?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}

export interface PreconnectOptions {
  crossOrigin?: string;
}

export interface PreloadModuleOptions {
  as?: 'script' | 'worker';
  crossOrigin?: string;
  integrity?: string;
  nonce?: string;
}

export interface PreinitModuleOptions {
  as?: 'script';
  crossOrigin?: string;
  integrity?: string;
  nonce?: string;
}

/**
 * Preload a resource imperatively in React 19.
 */
export function preload(href: string, options: PreloadOptions) {
  if (typeof rdPreload === 'function') {
    rdPreload(href, options as any);
  } else if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = options.as;
    if (options.crossOrigin) link.crossOrigin = options.crossOrigin;
    document.head.appendChild(link);
  }
}

/**
 * Pre-initialize an active stylesheet or script in React 19.
 */
export function preinit(href: string, options: PreinitOptions) {
  if (typeof rdPreinit === 'function') {
    rdPreinit(href, options as any);
  } else if (typeof document !== 'undefined') {
    if (options.as === 'style') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    } else {
      const script = document.createElement('script');
      script.src = href;
      script.async = true;
      document.head.appendChild(script);
    }
  }
}

/**
 * Prefetch a domain name for DNS resolution in React 19.
 */
export function prefetchDNS(href: string) {
  if (typeof rdPrefetchDNS === 'function') {
    rdPrefetchDNS(href);
  } else if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
}

/**
 * Establish an early connection to a remote server in React 19.
 */
export function preconnect(href: string, options?: PreconnectOptions) {
  if (typeof rdPreconnect === 'function') {
    rdPreconnect(href, options as any);
  } else if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (options?.crossOrigin) link.crossOrigin = options.crossOrigin;
    document.head.appendChild(link);
  }
}

/**
 * Preload an ES module script in React 19.
 */
export function preloadModule(href: string, options?: PreloadModuleOptions) {
  if (typeof rdPreloadModule === 'function') {
    rdPreloadModule(href, options as any);
  } else if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = href;
    document.head.appendChild(link);
  }
}

/**
 * Pre-initialize an ES module in React 19.
 */
export function preinitModule(href: string, options?: PreinitModuleOptions) {
  if (typeof rdPreinitModule === 'function') {
    rdPreinitModule(href, options as any);
  } else if (typeof document !== 'undefined') {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = href;
    script.async = true;
    document.head.appendChild(script);
  }
}

/**
 * Declarative <Preload /> component for React 19 JSX.
 */
export function Preload({ href, ...options }: { href: string } & PreloadOptions) {
  preload(href, options);
  return null;
}

/**
 * Declarative <Preconnect /> component for React 19 JSX.
 */
export function Preconnect({ href, crossOrigin }: { href: string; crossOrigin?: string }) {
  preconnect(href, { crossOrigin });
  return null;
}

/**
 * Declarative <PrefetchDNS /> component for React 19 JSX.
 */
export function PrefetchDNS({ href }: { href: string }) {
  prefetchDNS(href);
  return null;
}
