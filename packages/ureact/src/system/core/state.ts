import { useSyncExternalStore, useRef, useCallback, useEffect, useMemo } from 'react';
import { Listener, Store, Signal, Computed, Unsubscribe } from './types';
import { trackStoreAccess, notifyTrackedStores } from './view';
import { bind } from './bind';

// Track active batching
let isBatching = false;
let pendingBatchListeners = new Set<Listener>();

function notifyBatch() {
  if (isBatching) return;
  const toNotify = Array.from(pendingBatchListeners);
  pendingBatchListeners.clear();
  for (const listener of toNotify) {
    listener();
  }
}

/**
 * Deep clone for snapshotting
 */
function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags) as any;
  if (Array.isArray(obj)) {
    return obj.map(item => cloneDeep(item)) as any;
  }
  const copy: any = {};
  for (const key of Object.keys(obj)) {
    copy[key] = cloneDeep((obj as any)[key]);
  }
  return copy;
}

/**
 * Creates a reactive deep proxy store.
 * Updates happen via direct mutable assignments (e.g. `state.user.name = 'Bob'` or `state.items.push(x)`),
 * while React components subscribe cleanly via `useSyncExternalStore`.
 */
export function createStore<T extends object>(initialState: T): Store<T> {
  const initialClone = cloneDeep(initialState);
  let rawState: T = cloneDeep(initialState);
  let version = 0;
  let snapshot: T = rawState;
  const listeners = new Set<Listener>();

  function updateSnapshot() {
    version++;
    // Create a new reference for React's reconciliation
    snapshot = Array.isArray(rawState) ? ([...rawState] as any) : { ...rawState };
    notifyTrackedStores(rawState);
    if (isBatching) {
      listeners.forEach(l => pendingBatchListeners.add(l));
    } else {
      listeners.forEach(l => l());
    }
  }

  function createDeepProxy<O extends object>(target: O): O {
    const proxyMap = new WeakMap<object, object>();

    function wrap<V>(val: V): V {
      if (val !== null && typeof val === 'object') {
        if (proxyMap.has(val as object)) {
          return proxyMap.get(val as object) as V;
        }
        const p = new Proxy(val as object, handler);
        proxyMap.set(val as object, p);
        return p as V;
      }
      return val;
    }

    const handler: ProxyHandler<object> = {
      get(t: any, prop: string | symbol, receiver: any) {
        trackStoreAccess(rawState);
        const val = Reflect.get(t, prop, receiver);
        // Bind functions (actions) to the proxy so 'this' refers to reactive state
        if (typeof val === 'function') {
          return val.bind(proxy);
        }
        return wrap(val);
      },
      set(t: any, prop: string | symbol, value: any, receiver: any) {
        const prev = Reflect.get(t, prop, receiver);
        if (prev !== value) {
          const result = Reflect.set(t, prop, value, receiver);
          updateSnapshot();
          return result;
        }
        return true;
      },
      deleteProperty(t: any, prop: string | symbol) {
        const had = Reflect.has(t, prop);
        const res = Reflect.deleteProperty(t, prop);
        if (had) {
          updateSnapshot();
        }
        return res;
      }
    };

    const proxy = new Proxy(target, handler) as O;
    return proxy;
  }

  const proxyState = createDeepProxy(rawState);

  function applyStateInPlace(target: any, source: any) {
    if (Array.isArray(target) && Array.isArray(source)) {
      target.length = 0;
      target.push(...cloneDeep(source));
    } else {
      for (const key of Object.keys(target)) {
        if (!(key in source)) {
          delete target[key];
        }
      }
      Object.assign(target, cloneDeep(source));
    }
  }

  const storeInstance: Store<T> = {
    get state() {
      return proxyState;
    },
    subscribe(listener: Listener): Unsubscribe {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return snapshot;
    },
    reset() {
      applyStateInPlace(rawState, initialClone);
      updateSnapshot();
    },
    replace(newState: T) {
      applyStateInPlace(rawState, newState);
      updateSnapshot();
    },
    batch(fn: () => void) {
      const wasBatching = isBatching;
      isBatching = true;
      try {
        fn();
      } finally {
        if (!wasBatching) {
          isBatching = false;
          notifyBatch();
        }
      }
    },
    get $bind() {
      return new Proxy(
        ((prop: any) => bind(storeInstance, prop)) as any,
        {
          get(_target, prop: string | symbol) {
            if (typeof prop === 'string') {
              return bind(storeInstance, prop as any);
            }
          }
        }
      );
    },
    $toggle(prop: keyof T) {
      (proxyState as any)[prop] = !(proxyState as any)[prop];
    },
    __patch(path: (string | number)[], valueOrMutator: any) {
      if (!path || path.length === 0) return;
      let curr: any = rawState;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (curr[key] === undefined || curr[key] === null || typeof curr[key] !== 'object') {
          curr[key] = typeof path[i + 1] === 'number' ? [] : {};
        }
        curr = curr[key];
      }
      const lastKey = path[path.length - 1];
      const prevVal = curr[lastKey];
      const newVal = typeof valueOrMutator === 'function' ? valueOrMutator(prevVal) : valueOrMutator;
      if (prevVal !== newVal) {
        curr[lastKey] = newVal;
        updateSnapshot();
      }
    },
    $patch(path: (string | number)[], valueOrMutator: any) {
      storeInstance.__patch(path, valueOrMutator);
    }
  };

  return storeInstance;
}

/**
 * React hook to consume a `createStore` instance.
 * Automatically subscribes component to updates with zero stale closure bugs.
 */
export function useStore<T extends object>(store: Store<T>): T {
  useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
  return store.state;
}

/**
 * Creates a component-local reactive store.
 * Perfect replacement for complex multi-useState setups.
 */
export function useLocalStore<T extends object>(initialState: T | (() => T)): T {
  const storeRef = useRef<Store<T> | null>(null);
  if (!storeRef.current) {
    const init = typeof initialState === 'function' ? (initialState as () => T)() : initialState;
    storeRef.current = createStore(init);
  }
  return useStore(storeRef.current);
}

let activeSubscriber: Listener | null = null;
const subscriberStack: (Listener | null)[] = [];

export function pushSubscriber(sub: Listener | null) {
  subscriberStack.push(activeSubscriber);
  activeSubscriber = sub;
}

export function popSubscriber() {
  activeSubscriber = subscriberStack.pop() ?? null;
}

/**
 * Signals v2: Fine-grained reactive signal for single values with dependency tracking
 */
export function signal<T>(initialValue: T): Signal<T> {
  let val = initialValue;
  const listeners = new Set<Listener>();

  const sig: Signal<T> = {
    get value() {
      if (activeSubscriber) {
        listeners.add(activeSubscriber);
      }
      return val;
    },
    set value(newVal: T) {
      if (!Object.is(val, newVal)) {
        val = newVal;
        const copy = Array.from(listeners);
        for (const l of copy) l();
      }
    },
    peek() {
      return val;
    },
    get() {
      return this.value;
    },
    set(newVal: T | ((prev: T) => T)) {
      const next = typeof newVal === 'function' ? (newVal as (prev: T) => T)(val) : newVal;
      this.value = next;
    },
    update(fn: (prev: T) => T) {
      this.set(fn);
    },
    subscribe(listener: Listener): Unsubscribe {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return val;
    }
  };

  return sig;
}

/**
 * Signals v2: Lazily evaluated memoized computed signal with automatic dependency tracking
 */
export function computed<T>(getter: () => T): Computed<T> {
  let cachedValue: T;
  let dirty = true;
  const listeners = new Set<Listener>();
  const cleanups: Unsubscribe[] = [];

  const evaluate = (): T => {
    for (const c of cleanups) c();
    cleanups.length = 0;

    pushSubscriber(() => {
      dirty = true;
      const copy = Array.from(listeners);
      for (const l of copy) l();
    });

    try {
      cachedValue = getter();
      dirty = false;
    } finally {
      popSubscriber();
    }
    return cachedValue;
  };

  return {
    get value() {
      if (dirty) {
        evaluate();
      }
      if (activeSubscriber) {
        listeners.add(activeSubscriber);
      }
      return cachedValue;
    },
    get() {
      return this.value;
    },
    peek() {
      if (dirty) {
        evaluate();
      }
      return cachedValue;
    },
    subscribe(listener: Listener): Unsubscribe {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return this.value;
    }
  };
}

/**
 * Creates an effect that runs immediately and auto-subscribes to all signals accessed during execution.
 */
export function createSignalEffect(fn: () => void | (() => void)): Unsubscribe {
  let cleanup: void | (() => void);
  let disposed = false;

  const run = () => {
    if (disposed) return;
    if (typeof cleanup === 'function') {
      try {
        cleanup();
      } catch (err) {
        console.error('[uReact Signals] Cleanup error:', err);
      }
    }

    pushSubscriber(run);
    try {
      cleanup = fn();
    } finally {
      popSubscriber();
    }
  };

  run();

  return () => {
    disposed = true;
    if (typeof cleanup === 'function') {
      try {
        cleanup();
      } catch (err) {
        console.error('[uReact Signals] Cleanup error:', err);
      }
    }
  };
}

/**
 * Hook to subscribe to a Signal or initialize a component-level signal
 */
export function useSignal<T>(
  initialOrSignal: T | Signal<T>
): [T, (val: T | ((prev: T) => T)) => void, Signal<T>] {
  const signalRef = useRef<Signal<T> | null>(null);

  if (!signalRef.current) {
    if (
      initialOrSignal &&
      typeof initialOrSignal === 'object' &&
      'subscribe' in initialOrSignal &&
      'getSnapshot' in initialOrSignal
    ) {
      signalRef.current = initialOrSignal as Signal<T>;
    } else {
      signalRef.current = signal(initialOrSignal as T);
    }
  }

  const sig = signalRef.current;

  const val = useSyncExternalStore(
    sig.subscribe,
    sig.getSnapshot,
    sig.getSnapshot
  );

  const setter = useCallback((newVal: T | ((prev: T) => T)) => {
    sig.set(newVal);
  }, [sig]);

  return [val, setter, sig];
}

/**
 * Hook to subscribe to a Computed Signal
 */
export function useComputed<T>(getter: () => T, deps: any[] = []): T {
  const comp = useMemo(() => computed(getter), deps);
  return useSyncExternalStore(
    comp.subscribe,
    comp.getSnapshot,
    comp.getSnapshot
  );
}

/**
 * Global batch function
 */
export function batch(fn: () => void) {
  const wasBatching = isBatching;
  isBatching = true;
  try {
    fn();
  } finally {
    if (!wasBatching) {
      isBatching = false;
      notifyBatch();
    }
  }
}
