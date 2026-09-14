# ⚛️ uReact Framework — Changes & Upstream Improvement Recommendations

This document outlines the modifications made to the **uReact** library during the AegisPay implementation, along with recommended upstream enhancements for future releases of [`jins-coder/uReact`](https://github.com/jins-coder/uReact).

---

## 1. Modifications Made in AegisPay

### A. `<SignalValue />` Prop Polymorphism (`signal` vs `value`)
- **Location:** `packages/ureact/src/system/components/SignalValue.tsx`
- **Context:** In the README and examples, `<SignalValue value={count} />` was documented, while the initial TypeScript interface strictly required `signal={count}`.
- **Change Applied:**
  ```tsx
  export interface SignalValueProps<T = any> {
    signal?: Signal<T> | Computed<T>;
    value?: Signal<T> | Computed<T>; // Prop alias for ergonomic JSX
    render?: (val: T) => React.ReactNode;
    fallback?: React.ReactNode;
  }

  export function SignalValue<T = any>({ 
    signal, 
    value, 
    render, 
    fallback = null 
  }: SignalValueProps<T>): React.ReactElement | null {
    const targetSignal = signal || value;
    // ...
  }
  ```
### B. Unified `Store<T>` Direct Member Access (`Store<T> = StoreBase<T> & T`)
- **Location:** `packages/ureact/src/system/core/types.ts` & `packages/ureact/src/system/core/state.ts`
- **Context:** When consuming a store outside React components (such as in background interval timers or direct module exports), developers expect `store.isAuthenticated` or `store.syncAdminData()` to be directly accessible without having to write `store.state.isAuthenticated` or suffering TypeScript errors.
- **Change Applied:**
  ```ts
  export interface StoreBase<T extends object> {
    state: T;
    subscribe: (listener: Listener) => Unsubscribe;
    getSnapshot: () => T;
    reset: () => void;
    replace: (newState: T) => void;
    batch: (fn: () => void) => void;
    $bind: StoreBindingProxy<T>;
    $toggle: (property: keyof T) => void;
    __patch: (path: (string | number)[], valueOrMutator: any) => void;
    $patch: (path: (string | number)[], valueOrMutator: any) => void;
  }

  export type Store<T extends object> = StoreBase<T> & T;
  ```
  And inside `createStore`, returning a proxy that delegates unknown member lookups to `proxyState`.
- **Benefit:** Seamless ergonomics allowing direct property access, method calls, and component hooks (`useStore(myStore)`) with 100% strict TypeScript type checking.

---

## 2. Recommended Upstream Improvements for uReact `v2.4.0+`

### 1. Fast Refresh Store Separation Warning Helper
- **Observation:** In Vite/Next.js HMR environments, exporting non-component constants (e.g. `export const myStore = createStore(...)`) from the same file as a React component triggers React Fast Refresh warnings.
- **Recommendation:**
  - Document the best practice of placing shared stores in `stores/*.ts` files.
  - Or provide a `useCreateStore(() => ({ ... }))` hook for locally scoped component stores that safely survive Fast Refresh.

### 2. Universal Form `$bind` Custom Component Adapters
- **Observation:** Currently, `{...form.$bind.email}` emits standard `{ value, onChange, onBlur }` targeting native HTML `<input>` elements (`e.target.value`).
- **Recommendation:**
  - Support custom component value handlers (e.g. UI libraries where `onChange` passes the direct value `(val) => ...` instead of `(e) => e.target.value`).
  - Example API proposal:
    ```tsx
    <CustomSelect {...form.$bind.asset.custom()} />
    ```

### 3. Nested Media Queries in `<Scoped>` CSS
- **Observation:** Component-scoped styles `<Scoped css="...">` work by prefixing rules with `[data-scope="..."]`.
- **Recommendation:**
  - Ensure the regex scoped-CSS transformer automatically transforms nested `@media` and `@container` queries:
    ```css
    @media (max-width: 768px) {
      .card { grid-template-columns: 1fr; }
    }
    ```
    into:
    ```css
    @media (max-width: 768px) {
      [data-scope="..."] .card { grid-template-columns: 1fr; }
    }
    ```

### 4. DevTools HUD Mini-Docking & Mobile Mode
- **Observation:** The embedded `<DevTools />` HUD (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>) is excellent for desktop debugging, but on narrow screens it can overlap active UI elements.
- **Recommendation:**
  - Add a collapsed mini-pill mode that shows only the 60 FPS counter in the corner until clicked to expand.
  - Config prop: `<DevTools defaultMode="collapsed" position="bottom-right" />`.

### 5. SSR / Next.js Hydration Safety Guards
- **Observation:** When running under Server-Side Rendering (SSR) environments, accessing `window`, `document`, or `localStorage` during initial store creation can cause hydration mismatch warnings.
- **Recommendation:**
  - Wrap DOM and Storage accesses in `typeof window !== 'undefined'` checks across all core primitives.

---

## 3. Summary of Files in `packages/ureact`

| File | Status | Description |
| :--- | :--- | :--- |
| `src/system/components/SignalValue.tsx` | **Modified & Tested** | Added `value` prop alias and dual prop support |
| `src/system/core/store.ts` | **Active** | Direct-mutation proxy stores |
| `src/system/components/Scoped.tsx` | **Active** | Zero-bleed scoped CSS runtime |
| `src/system/components/Show.tsx` / `For.tsx` | **Active** | Declarative control flow components |
| `src/system/devtools/DevTools.tsx` | **Active** | Quantum DevTools HUD with FPS telemetry |
