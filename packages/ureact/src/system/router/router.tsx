import React, { useSyncExternalStore, forwardRef } from 'react';
import { RouteLocation, NavigateOptions, LinkProps, RouterContextValue } from './types';

function parseCurrentLocation(): RouteLocation {
  if (typeof window === 'undefined') {
    return { pathname: '/', search: '', hash: '', fullPath: '/' };
  }

  let pathname = window.location.pathname;
  const hash = window.location.hash;
  const search = window.location.search;

  // Support hash routing fallback if #/ is present
  if (hash.startsWith('#/')) {
    pathname = hash.slice(1);
  } else if (search.includes('page=')) {
    const params = new URLSearchParams(search);
    const page = params.get('page');
    if (page) {
      pathname = page.startsWith('/') ? page : `/docs/${page}`;
    }
  }

  return {
    pathname: pathname || '/',
    search,
    hash,
    fullPath: window.location.pathname + window.location.search + window.location.hash
  };
}

class RouterStore {
  private listeners = new Set<() => void>();
  private current: RouteLocation = parseCurrentLocation();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => this.notify());
      window.addEventListener('hashchange', () => this.notify());
    }
  }

  getSnapshot = () => {
    return this.current;
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify() {
    this.current = parseCurrentLocation();
    this.listeners.forEach((fn) => fn());
  }

  navigate(to: string, options: NavigateOptions = {}) {
    if (typeof window === 'undefined') return;

    const { replace = false, scroll = true } = options;

    if (replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }

    this.notify();

    if (scroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  back() {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }

  forward() {
    if (typeof window !== 'undefined') {
      window.history.forward();
    }
  }
}

export const routerStore = new RouterStore();

export function navigate(to: string, options?: NavigateOptions) {
  routerStore.navigate(to, options);
}

export function useRouter(): RouterContextValue {
  const location = useSyncExternalStore(
    routerStore.subscribe,
    routerStore.getSnapshot,
    routerStore.getSnapshot
  );

  return {
    ...location,
    navigate: (to, opts) => routerStore.navigate(to, opts),
    back: () => routerStore.back(),
    forward: () => routerStore.forward()
  };
}

export function usePath(): string {
  const router = useRouter();
  return router.pathname;
}

/**
 * First-class <Link> component for fast client-side SPA navigation with multi-page URL semantics.
 * Renders native <a> tag, supporting right-click new tab, SEO crawlers, and Ctrl+Click.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({
  href,
  replace = false,
  scroll = true,
  activeClassName = 'active',
  className = '',
  onClick,
  children,
  ...props
}, ref) => {
  const { pathname } = useRouter();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
  const combinedClass = [className, isActive ? activeClassName : ''].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    // Allow default browser behavior for modifier keys (Cmd/Ctrl click opens in new tab)
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey ||
      props.target === '_blank'
    ) {
      return;
    }

    e.preventDefault();
    routerStore.navigate(href, { replace, scroll });
  };

  return (
    <a
      ref={ref}
      href={href}
      className={combinedClass}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
});

Link.displayName = 'Link';
