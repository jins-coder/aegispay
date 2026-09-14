import React, { useTransition, useState, useCallback, useDeferredValue, useContext, Context } from 'react';
import { requestFormReset as rdRequestFormReset } from 'react-dom';
import { Store } from '../core/types';
import { useStore } from '../core/state';
import { useOptimisticImpl } from './useAction';

/**
 * Standalone React 19 useOptimistic helper.
 * Provides instant optimistic state with automatic rollback.
 */
export function useOptimisticState<T, U>(
  passthrough: T,
  updateFn: (current: T, update: U) => T
): [T, (update: U) => void] {
  return (useOptimisticImpl as any)(passthrough, updateFn);
}

/**
 * Connects any uReact Store directly to React 19's useOptimistic engine!
 */
export function useOptimisticStore<T extends object, U>(
  store: Store<T>,
  updateFn: (current: T, update: U) => T
): [T, (update: U) => void] {
  const currentState = useStore(store);
  return (useOptimisticImpl as any)(currentState, updateFn);
}

/**
 * Resets a form element in React 19 using requestFormReset, with fallback to standard form.reset().
 */
export function resetForm(form: HTMLFormElement | null | undefined) {
  if (!form) return;
  if (typeof rdRequestFormReset === 'function') {
    try {
      rdRequestFormReset(form);
      return;
    } catch {
      // Fallback if invoked outside a transition
    }
  }
  form.reset();
}

/**
 * Hook providing a resilient form reset helper.
 */
export function useFormReset() {
  return resetForm;
}

/**
 * Enhanced React 19 useTransition hook supporting async actions and automatic error state capture.
 */
export function useActionTransition() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback((asyncAction: () => Promise<void> | void) => {
    setError(null);
    startTransition(async () => {
      try {
        await asyncAction();
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }, []);

  return { isPending, run, error, startTransition };
}

/**
 * React 19 enhanced useDeferredValue wrapper supporting optional initialValue.
 */
export function useDeferred<T>(value: T, initialValue?: T): T {
  return (useDeferredValue as any)(value, initialValue);
}

/**
 * Universal React 19 use() hook wrapper.
 * Safely resolves Promises or Contexts inside Suspense boundaries.
 */
export function useResource<T>(usable: Promise<T> | Context<T>): T {
  const nativeUse = (React as any).use;
  if (typeof nativeUse === 'function') {
    return nativeUse(usable);
  }

  // Fallback for Context
  if (usable && (usable as any).$$typeof === Symbol.for('react.context')) {
    return useContext(usable as Context<T>);
  }

  // Fallback for Promise in Suspense
  if (usable && typeof (usable as any).then === 'function') {
    const p: any = usable;
    if (!p.status) {
      p.status = 'pending';
      p.then(
        (val: any) => {
          p.status = 'fulfilled';
          p.value = val;
        },
        (err: any) => {
          p.status = 'rejected';
          p.reason = err;
        }
      );
    }
    if (p.status === 'fulfilled') {
      return p.value;
    } else if (p.status === 'rejected') {
      throw p.reason;
    } else {
      throw p;
    }
  }

  return usable as any;
}
