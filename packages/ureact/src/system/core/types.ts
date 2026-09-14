export type Listener = () => void;
export type Unsubscribe = () => void;

export interface AutoBinding {
  name: string;
  value?: any;
  checked?: boolean;
  onChange: (e: any) => void;
}

export type StoreBindingProxy<T> = {
  [K in keyof T]: AutoBinding;
} & (<K extends keyof T>(prop: K) => AutoBinding);

export interface StoreBase<T extends object> {
  state: T;
  subscribe: (listener: Listener) => Unsubscribe;
  getSnapshot: () => T;
  reset: () => void;
  /** Replace the entire state in-place with a new state object */
  replace: (newState: T) => void;
  /** Batch multiple mutations to trigger only one re-render */
  batch: (fn: () => void) => void;
  /** Direct two-way binding proxy: store.$bind.property or store.$bind('property') */
  $bind: StoreBindingProxy<T>;
  /** Toggle a boolean property in-place */
  $toggle: (property: keyof T) => void;
  /** AOT Compiler Direct Patch: bypasses Proxy traps and updates atom directly */
  __patch: (path: (string | number)[], valueOrMutator: any) => void;
  /** Public direct path patch alias */
  $patch: (path: (string | number)[], valueOrMutator: any) => void;
}

export type Store<T extends object> = StoreBase<T> & T;

export interface Signal<T> {
  value: T;
  get: () => T;
  set: (val: T | ((prev: T) => T)) => void;
  update: (fn: (prev: T) => T) => void;
  subscribe: (listener: Listener) => Unsubscribe;
  getSnapshot: () => T;
  peek: () => T;
}

export interface Computed<T> {
  readonly value: T;
  get: () => T;
  subscribe: (listener: Listener) => Unsubscribe;
  getSnapshot: () => T;
  peek: () => T;
}
