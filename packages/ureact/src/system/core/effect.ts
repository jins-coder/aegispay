import { useEffect, useRef } from 'react';

/**
 * Runs a function once when the component mounts.
 * Eliminates `useEffect(() => { ... }, [])` ceremony and linter warnings.
 */
export function useMount(fn: () => void | (() => void)) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    return fnRef.current?.();
  }, []);
}

/**
 * Runs a function when the component unmounts.
 */
export function useUnmount(fn: () => void) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    return () => {
      fnRef.current?.();
    };
  }, []);
}

export interface WatchOptions {
  immediate?: boolean;
}

/**
 * Watch dependencies with explicit control over immediate execution and access to previous values.
 * No more stale closures or weird effect trigger loops.
 */
export function useWatch<T extends readonly any[]>(
  fn: (current: T, prev: T | null) => void | (() => void),
  deps: T,
  options: WatchOptions = {}
) {
  const { immediate = false } = options;
  const isFirstRun = useRef(true);
  const prevDepsRef = useRef<T | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (!immediate) {
        prevDepsRef.current = deps;
        return;
      }
    }

    const cleanup = fnRef.current(deps, prevDepsRef.current);
    prevDepsRef.current = deps;

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, deps);
}
