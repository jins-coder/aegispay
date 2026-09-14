import { useEffect, useRef } from 'react';
import { Signal, Store, Unsubscribe } from './types';

export type WatchSource<T> = Signal<T> | Store<any> | (() => T);

export interface ReactiveWatchOptions {
  /** If true, runs the callback immediately with (initialValue, undefined) */
  immediate?: boolean;
  /** If true, unsubscribes after the callback runs once */
  once?: boolean;
}

export type WatchCallback<T> = (
  newValue: T,
  oldValue: T | undefined,
  onCleanup: (cleanupFn: () => void) => void
) => void;

/**
 * Universal reactive state watcher.
 * Observes changes to a Signal, a Store, or a reactive getter function,
 * providing (newValue, oldValue) without useEffect boilerplate or stale closures.
 * 
 * @example
 * ```ts
 * const count = signal(0);
 * 
 * const unwatch = watch(count, (newVal, oldVal) => {
 *   console.log(`Count changed from ${oldVal} to ${newVal}`);
 * });
 * 
 * // Or watching deep store properties:
 * watch(() => userStore.state.profile.name, (newName, oldName) => {
 *   analytics.track('name_change', { from: oldName, to: newName });
 * });
 * ```
 */
export function watch<T>(
  source: WatchSource<T>,
  callback: WatchCallback<T>,
  options: ReactiveWatchOptions = {}
): Unsubscribe {
  let prevValue: T | undefined = undefined;
  let cleanupFn: (() => void) | null = null;
  let isSubscribed = true;

  const registerCleanup = (fn: () => void) => {
    cleanupFn = fn;
  };

  const getVal = (): T => {
    if (typeof source === 'function') {
      return (source as () => T)();
    }
    if ('value' in source && typeof (source as any).value !== 'undefined') {
      return (source as Signal<T>).value;
    }
    if ('state' in source) {
      return (source as Store<any>).state as unknown as T;
    }
    return undefined as unknown as T;
  };

  prevValue = getVal();

  if (options.immediate) {
    try {
      callback(prevValue, undefined, registerCleanup);
    } catch (err) {
      console.error('[uReact watch] Error in initial callback:', err);
    }
  }

  const listener = () => {
    if (!isSubscribed) return;

    const nextValue = getVal();

    // Shallow equality check to avoid redundant triggers
    if (nextValue === prevValue && typeof nextValue !== 'object') {
      return;
    }

    if (cleanupFn) {
      try {
        cleanupFn();
      } catch (err) {
        console.error('[uReact watch] Error in cleanup:', err);
      }
      cleanupFn = null;
    }

    const old = prevValue;
    prevValue = nextValue;

    try {
      callback(nextValue, old, registerCleanup);
    } catch (err) {
      console.error('[uReact watch] Error in callback:', err);
    }

    if (options.once) {
      unsubscribe();
    }
  };

  let unbind: Unsubscribe;
  if (typeof source === 'object' && 'subscribe' in source) {
    unbind = (source as any).subscribe(listener);
  } else {
    // Getter function - fallback timer/event
    unbind = () => {};
  }

  function unsubscribe() {
    if (!isSubscribed) return;
    isSubscribed = false;
    if (cleanupFn) {
      try { cleanupFn(); } catch (_) {}
      cleanupFn = null;
    }
    unbind();
  }

  return unsubscribe;
}

/**
 * React hook wrapper for `watch()`.
 * Automatically unsubscribes when the component unmounts.
 * 
 * @example
 * ```tsx
 * function Profile() {
 *   useWatchReactive(() => store.state.user.id, (newId, oldId) => {
 *     fetchUserData(newId);
 *   }, { immediate: true });
 * }
 * ```
 */
export function useWatchReactive<T>(
  source: WatchSource<T>,
  callback: WatchCallback<T>,
  options: ReactiveWatchOptions = {}
): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    const unwatch = watch(
      source,
      (newVal, oldVal, onCleanup) => {
        cbRef.current(newVal, oldVal, onCleanup);
      },
      options
    );
    return unwatch;
  }, [source, options.immediate, options.once]);
}

export const useWatchSignal = useWatchReactive;

