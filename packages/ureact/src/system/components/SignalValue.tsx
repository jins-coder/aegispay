import React, { useSyncExternalStore } from 'react';
import { Signal, Computed } from '../core/types';

export interface SignalValueProps<T = any> {
  signal: Signal<T> | Computed<T>;
  render?: (val: T) => React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * <SignalValue> - AOT Compiled Fine-Grained Reactive Text Node
 *
 * Automatically injected by the uReact v3.0 compiler when encountering
 * `{signal.value}` within JSX children. Subscribes fine-grained to the signal
 * without triggering re-renders in the parent component!
 */
export function SignalValue<T = any>({ signal, render, fallback = null }: SignalValueProps<T>): React.ReactElement | null {
  if (!signal || typeof signal.subscribe !== 'function') {
    return <>{(signal as any)?.value ?? (signal as any) ?? fallback}</>;
  }

  const val = useSyncExternalStore(
    signal.subscribe,
    signal.getSnapshot,
    signal.getSnapshot
  );

  if (render) {
    return <>{render(val)}</>;
  }

  if (val === null || val === undefined) {
    return <>{fallback}</>;
  }

  return <>{String(val)}</>;
}

export default SignalValue;
