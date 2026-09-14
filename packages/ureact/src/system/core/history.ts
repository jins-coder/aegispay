import { useSyncExternalStore, useRef, useCallback } from 'react';
import { createStore } from './state';
import { Store, Unsubscribe, Listener } from './types';

export interface HistorySnapshot<T> {
  canUndo: boolean;
  canRedo: boolean;
  length: number;
  pointer: number;
  version: number;
}

export interface HistoryStore<T extends object> {
  state: T;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: boolean;
  canRedo: boolean;
  history: T[];
  reset: () => void;
  subscribe: (listener: Listener) => Unsubscribe;
  getSnapshot: () => HistorySnapshot<T>;
  getBaseStore: () => Store<T>;
}

function clone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Creates a reactive store with full Time-Travel (Undo / Redo) capabilities.
 */
export function createHistoryStore<T extends object>(
  initialState: T,
  options: { maxHistory?: number } = {}
): HistoryStore<T> {
  const { maxHistory = 50 } = options;
  const initialSnapshot = clone(initialState);
  let past: T[] = [clone(initialState)];
  let pointer = 0;
  let version = 0;
  let isInternalChange = false;

  const baseStore = createStore(initialState);
  const listeners = new Set<Listener>();

  let cachedSnapshot: HistorySnapshot<T> = {
    canUndo: false,
    canRedo: false,
    length: 1,
    pointer: 0,
    version: 0
  };

  function updateHistorySnapshot() {
    version++;
    cachedSnapshot = {
      canUndo: pointer > 0,
      canRedo: pointer < past.length - 1,
      length: past.length,
      pointer,
      version
    };
    listeners.forEach((l) => l());
  }

  // Subscribe to base store mutations
  baseStore.subscribe(() => {
    if (isInternalChange) return;

    const current = clone(baseStore.getSnapshot());

    // Truncate redo stack when new action is taken
    past = past.slice(0, pointer + 1);
    past.push(current);

    if (past.length > maxHistory) {
      past.shift();
    } else {
      pointer = past.length - 1;
    }

    updateHistorySnapshot();
  });

  return {
    get state() {
      return baseStore.state;
    },
    undo(): boolean {
      if (pointer > 0) {
        pointer--;
        isInternalChange = true;
        baseStore.replace(clone(past[pointer]));
        isInternalChange = false;
        updateHistorySnapshot();
        return true;
      }
      return false;
    },
    redo(): boolean {
      if (pointer < past.length - 1) {
        pointer++;
        isInternalChange = true;
        baseStore.replace(clone(past[pointer]));
        isInternalChange = false;
        updateHistorySnapshot();
        return true;
      }
      return false;
    },
    get canUndo() {
      return pointer > 0;
    },
    get canRedo() {
      return pointer < past.length - 1;
    },
    get history() {
      return past;
    },
    reset() {
      pointer = 0;
      past = [clone(initialSnapshot)];
      isInternalChange = true;
      baseStore.reset();
      isInternalChange = false;
      updateHistorySnapshot();
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      const unsubBase = baseStore.subscribe(listener);
      return () => {
        listeners.delete(listener);
        unsubBase();
      };
    },
    getSnapshot() {
      return cachedSnapshot;
    },
    getBaseStore() {
      return baseStore;
    }
  };
}

/**
 * Hook to consume a time-travel history store
 */
export function useHistoryStore<T extends object>(historyStore: HistoryStore<T>) {
  // Subscribe to history metadata (canUndo, canRedo, pointer, version)
  const meta = useSyncExternalStore(
    historyStore.subscribe,
    historyStore.getSnapshot,
    historyStore.getSnapshot
  );

  // Subscribe to state snapshot
  const baseStore = historyStore.getBaseStore();
  useSyncExternalStore(
    baseStore.subscribe,
    baseStore.getSnapshot,
    baseStore.getSnapshot
  );

  return {
    state: historyStore.state,
    undo: historyStore.undo,
    redo: historyStore.redo,
    canUndo: meta.canUndo,
    canRedo: meta.canRedo,
    history: historyStore.history,
    pointer: meta.pointer,
    reset: historyStore.reset
  };
}
