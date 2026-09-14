import React, { useSyncExternalStore } from 'react';
import { Signal, Computed } from '../core/types';

export interface SignalValueProps<T = any> {
  signal?: Signal<T> | Computed<T>;
  value?: Signal<T> | Computed<T>;
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
export function SignalValue<T = any>({ signal, value, render, fallback = null }: SignalValueProps<T>): React.ReactElement | null {
  const targetSignal = signal || value;

  if (!targetSignal || typeof targetSignal.subscribe !== 'function') {
    return <>{(targetSignal as any)?.value ?? (targetSignal as any) ?? fallback}</>;
  }

  const val = useSyncExternalStore(
    targetSignal.subscribe,
    targetSignal.getSnapshot,
    targetSignal.getSnapshot
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
