import React, { FC, useSyncExternalStore, useRef, useState, useEffect } from 'react';
import { Store, Listener } from './types';

// Global subscriber tracker during component render
let currentObserver: (() => void) | null = null;
const storeTrackingMap = new WeakMap<object, Set<() => void>>();

export function trackStoreAccess(target: object) {
  if (currentObserver) {
    let listeners = storeTrackingMap.get(target);
    if (!listeners) {
      listeners = new Set();
      storeTrackingMap.set(target, listeners);
    }
    listeners.add(currentObserver);
  }
}

export function notifyTrackedStores(target: object) {
  const listeners = storeTrackingMap.get(target);
  if (listeners) {
    listeners.forEach((l) => l());
  }
}

/**
 * Creates an Auto-Reactive Component (Observer View).
 * 
 * Eliminates the need to call `const state = useStore(store)` inside components!
 * Any store read inside `view(() => ...)` automatically subscribes the component.
 * 
 * Example:
 *   const counter = createStore({ count: 0 });
 * 
 *   // 3 lines instead of 10 lines of hook setup:
 *   export const Counter = view(() => (
 *     <button onClick={() => counter.state.count++}>
 *       Count: {counter.state.count}
 *     </button>
 *   ));
 */
export function view<P extends object = {}>(Component: FC<P>): FC<P> {
  const ObservedComponent: FC<P> = (props: P) => {
    const [, forceUpdate] = useState({});
    const updateRef = useRef(() => forceUpdate({}));

    const prevObserver = currentObserver;
    currentObserver = updateRef.current;

    try {
      return Component(props);
    } finally {
      currentObserver = prevObserver;
    }
  };

  ObservedComponent.displayName = `View(${Component.displayName || Component.name || 'Component'})`;
  return ObservedComponent;
}
