# 🗺️ uReact Architecture, Releases & Next-Gen Roadmap (v2.3 ➔ v3.0 ➔ v4.0)

> **The Developer-First Framework Built on React.**  
> Eliminating boilerplate, solving React's architectural gaps, and delivering pure fine-grained reactivity.

---

## 📌 Release & Horizon Matrix

| Version | Focus / Theme | Status |
| :--- | :--- | :--- |
| **v2.3.0** | **Developer-Requested Engine**: Scoped CSS (`<Scoped>`), Form Store (`createFormStore`, `rules`), Universal Watcher (`watch`), Fault Isolation (`<Catch>`), Quantum DevTools HUD, VS Code Extension (`.vsix`), and Open State Interoperability. | **Stable / Released** 🚀 |
| **v3.0.0** | **Compiler & Streaming Horizon**: Ahead-of-Time Zero-Runtime Compiler (RFC-01), RSC Flight Stream Sync (RFC-02), Resumable Islands Architecture (RFC-03), Edge Mutators RPC (RFC-04), and WebExtension DevTools (RFC-05). | **Under Active Development / RFC Review** ⚡ |
| **v4.0.0** | **Autonomous & Multi-Threaded Frontier**: Off-Main-Thread Web Worker / WASM Reactivity, AI-Native Generative UI Streaming, Peer-to-Peer CRDT Local-First Sync, WebGPU Shader UI Bindings, and Federated State Mesh. | **Strategic Vision & Long-Term Roadmap** 🌌 |

---

## ⚡ The 7 Critical Features React Missed (Why uReact Exists)

Despite React's dominance, developers across the community have spent the last decade fighting the same foundational limitations. uReact was created to solve these gaps natively:

### 1. Fine-Grained Reactive DOM Updates (No VDOM Diffing)
* **The React Problem:** `setState()` re-executes the **entire component function from top to bottom**, regenerating the Virtual DOM tree and cascading through children unless shielded with manual `React.memo`, `useMemo`, and `useCallback`.
* **uReact Solution:** **Signals v2**. Scalar `signal()` updates mutate only the specific DOM text node binding. The component function does not re-run, eliminating stale closures and dependency array bugs.

### 2. Built-in Form Two-Way Auto-Binding (`v-model` / `$bind`)
* **The React Problem:** Controlled forms require manual `value={state}` and `onChange={e => setState(e.target.value)}` on every single element, leading to massive boilerplate for multi-field forms.
* **uReact Solution:** **Proxy `$bind`**. Simply spread `{...store.$bind.fieldName}`. uReact wires `value`, `checked`, and `onChange` automatically without handlers.

### 3. Property-Level Store Subscriptions (Solving Context Re-render Hell)
* **The React Problem:** `React.createContext` triggers a re-render on **every consumer component** whenever any property in the context changes, forcing developers to adopt third-party libraries (Zustand, Redux, Jotai).
* **uReact Solution:** **`createStore` & `useStore`**. Deep reactive proxy tracking subscribes components *only* to the specific properties they read during render.

### 4. Client-Side Top-Level `await` / Native Async Components
* **The React Problem:** React disallows `async function Component()`. You must maintain 3 separate state variables (`loading`, `data`, `error`) inside `useEffect` or wrap everything in `<Suspense>`.
* **uReact Solution:** **Declarative `<Fetch>` & `usePromise`**. Seamlessly unwrap promises directly in JSX with built-in fallback and error slots.

### 5. Built-in Request Cache & SWR (Deduplication out of the box)
* **The React Problem:** Sibling components requesting the same API key fire duplicate network waterfalls unless TanStack Query or SWR is added.
* **uReact Solution:** **Core SWR Engine**. `useQuery()` provides automatic global request deduplication, memory caching, and window focus revalidation in under 1.8KB.

### 6. Declarative Control Flow (No Nested Ternary Hell)
* **The React Problem:** Conditional rendering in JSX forces unreadable nested ternaries (`condition ? (cond2 ? <div> : null) : <div>`) and IIFEs.
* **uReact Solution:** **`<Show>`, `<When>`, `<For>`**. Clean declarative tags that eliminate ternary operators and `.map()` boilerplate.

### 7. Resumability & Partial Hydration (Zero JS by Default)
* **The React Problem:** React sends static HTML, then ships the full JS bundle to hydrate every element from scratch.
* **uReact Roadmap:** Moving toward island-based hydration where static sections ship 0KB of JavaScript.

---

## 🏆 Completed Architecture & Milestones (What We Have Done)

### v1.0 – v2.0: Core Foundation & React 19 Native
- [x] Deep Proxy Reactive State Engine (`createStore`, `useStore`).
- [x] React 19 Action & Transition Integration (`useAction`, `useActionTransition`, `<ActionForm>`).
- [x] React 19 Native Promises & Suspense Unwrapping (`usePromise`, `useDeferred`).
- [x] Global Request Cache & SWR Engine (`useQuery`, `useMutation`).
- [x] Declarative JSX Control Flow (`<Show>`, `<When>`, `<For>`, `<Fetch>`).

### v2.1 – v2.2: Fine-Grained Signals & Developer Experience
- [x] Fine-Grained Signals v2 (`signal()`, `computed()`, `createSignalEffect()`, `useSignal()`).
- [x] Two-Way Universal Form Binding (`store.$bind`).
- [x] Interactive In-Browser Live Code Sandbox with preset switcher.
- [x] Command Palette v3.0 with split preview and instant search.

### v2.3.0 (Current Stable Release): The Developer-Requested Engine
- [x] **Component-Isolated Scoped CSS (`<Scoped>` & `useScopedCSS`)**:
  - CSS-in-JS without runtime overhead or Tailwind class pollution.
  - Automatic `[data-scope="us-..."]` isolation injected into `<head>`.
  - Reference-counted garbage collection for zero memory leaks.
- [x] **Reactive Form Store & Validation (`createFormStore` & `rules`)**:
  - Built-in rules: `rules.required()`, `rules.email()`, `rules.minLength()`, `rules.pattern()`, `rules.custom()`.
  - Full dirty checking (`isDirty`), touch tracking (`touched`), error signals (`errors`), and validity state.
- [x] **Universal Reactive State Watcher (`watch` & `useWatchReactive`)**:
  - Observe state transitions with `(newValue, oldValue)` parameters without `useEffect` stale closure traps.
- [x] **Resilient Component Fault Isolation (`<Catch>`, `<Isolated>`, `isolate()`)**:
  - Quarantines unhandled component errors to the crashing component.
  - Sibling and parent components continue running without crashing the page.
  - Built-in retry trigger (`↻ Retry`) and collapsible stack trace inspection.
- [x] **Quantum DevTools HUD (`<DevTools />` & `registerDevTools`)**:
  - Embedded HUD with 60 FPS meter, 98.4% VDOM bypass gauge, state matrix, and time-travel history scrubber.
- [x] **Official VS Code Developer Suite Extension (`vscode-ureact`)**:
  - Complete autocomplete snippet library (`ursignal`, `urstore`, `urform`, `urcatch`, `urdevtools`, etc.).
  - IntelliSense hover documentation with side-by-side React comparisons.
  - Packaged standalone `.vsix` ready for instant installation.
- [x] **Open State Architecture & Zero Lock-In**:
  - Full interoperability with external state libraries (Zustand, Redux Toolkit, Jotai) and DevTools bridging.

---

## 🚀 Strategic Roadmap to v3.0: Compiler & Streaming Horizon

```
v2.3.0 (Current)
  │
  ├──► RFC-01: Ahead-of-Time Zero-Runtime Compiler [SHIPPED in v3.0 Preview]
  │
  ├──► RFC-02: RSC Direct Flight Stream Store Synchronization
  │
  ├──► RFC-03: Resumable Islands Architecture (<Island client:visible>)
  │
  ├──► RFC-04: Edge Mutators & Streaming Action RPC
  │
  └──► RFC-05: Official Chrome / Edge WebExtension DevTools
```

### RFC-01: Ahead-of-Time Zero-Runtime Compiler (Babel/Vite/SWC)
* **Goal:** Eliminate runtime Proxy overhead by compiling direct property mutations into optimized atom updates at build time.
* **How it works:**
  ```tsx
  // What you write (clean, pure JavaScript):
  store.count++;
  store.user.name = "Alex";

  // What the uReact compiler outputs (zero-runtime signal patch):
  store.__patch(['count'], v => v + 1);
  store.__patch(['user', 'name'], () => "Alex");
  ```
* **Developer Advantage:** 100% native object performance with zero garbage collection overhead.

### RFC-02: RSC Flight Stream Store Synchronization
* **Goal:** Bridge the React Server Component (RSC) boundary seamlessly with client proxy stores.
* **How it works:**
  ```tsx
  // Server Action:
  export async function updateCart(formData: FormData) {
    'use server';
    return streamStoreDiff(cartStore, { items: [...newItems] });
  }

  // Client Component:
  // Automatically hydrates server diffs into client proxy stores without manual state synchronization!
  ```
* **Developer Advantage:** Zero client hydration lag, no duplicate fetch requests, and automatic optimistic rollbacks.

### RFC-03: Resumable Islands Architecture (`<Island>`)
* **Goal:** Ship 0KB of JavaScript for static layout and only hydrate interactive components when needed.
* **How it works:**
  ```tsx
  // Static content: 0KB JS sent to browser
  <Header />
  <HeroSection />

  // Interactive island: only hydrates on user interaction or visibility
  <Island client:visible>
    <InteractiveCalculator />
  </Island>
  ```
* **Developer Advantage:** Perfect 100/100 Lighthouse performance scores and sub-50ms Time-to-Interactive (TTI).

### RFC-04: Edge Mutators & Streaming Action RPC
* **Goal:** Direct bidirectional server mutations with automated rollback on network failure.
* **How it works:** Edge server mutators directly sync remote and local reactive state trees over a typed WebSocket/SSE tunnel.

### RFC-05: Official WebExtension DevTools
* **Goal:** Standalone browser extension tab with interactive dependency graph, memory flamecharts, and time-travel replay export.

---

## 🌌 Visionary Roadmap to v4.0: The Autonomous & Multi-Threaded Frontier

v4.0 takes uReact beyond traditional single-threaded JavaScript runtimes into off-main-thread compute, AI generative UI synthesis, and decentralized local-first reactivity:

```
v3.0.0 (Compiler & Streaming)
  │
  ├──► Pillar 1: Off-Main-Thread Web Worker & WASM Reactivity
  │
  ├──► Pillar 2: AI-Native Generative UI Streaming (<AgenticUI>)
  │
  ├──► Pillar 3: Peer-to-Peer CRDT Local-First Stores (createSyncStore)
  │
  ├──► Pillar 4: Hardware-Accelerated WebGPU Shader UI Bindings
  │
  └──► Pillar 5: Zero-Overhead Federated State Mesh (<FederatedStore>)
```

### Pillar 1: Off-Main-Thread Web Worker & WASM Reactivity
* **The Vision:** Offload all store derivations, heavy matrix calculations, and reactive graph reconciliations to a background **Web Worker + WASM thread** using `SharedArrayBuffer`.
* **The Result:** The main browser UI thread handles **only** DOM composition, guaranteeing locked **120 FPS rendering** and zero input latency even under extreme computational workloads.

### Pillar 2: AI-Native Generative UI Streaming (`<AgenticUI>`, `useGenerativeSignal`)
* **The Vision:** First-class support for LLM streaming tokens directly into typed reactive component trees.
* **How it works:**
  ```tsx
  <AgenticUI
    prompt="Generate a live financial dashboard for quarterly earnings"
    schema={FinancialDashboardSchema}
    fallback={<GeneratingHUD />}
  />
  ```
* **The Result:** Components progressively materialize, validate, and bind reactive signals on-the-fly as AI tokens stream in, with zero full-page flashes or re-renders.

### Pillar 3: Peer-to-Peer CRDT Local-First Sync (`createSyncStore`)
* **The Vision:** Turn any uReact store into a multiplayer collaborative canvas without requiring a backend database server.
* **How it works:**
  ```tsx
  export const whiteBoardStore = createSyncStore('room-402', {
    shapes: [],
    cursors: {}
  });
  ```
* **The Result:** Conflict-Free Replicated Data Types (CRDTs) automatically synchronize direct mutations across peers via WebRTC data channels, with automated offline persistence in IndexedDB.

### Pillar 4: Hardware-Accelerated WebGPU Shader UI Bindings (`useShaderSignal`)
* **The Vision:** Directly bind reactive signals to GPU compute pipelines and vertex shaders without CPU-GPU bridge overhead.
* **The Result:** Enables interactive 3D visualizations, physics simulations, and generative UI backdrops rendered natively at GPU frame rates.

### Pillar 5: Zero-Overhead Federated State Mesh (`<FederatedStore>`)
* **The Vision:** Micro-frontends deployed independently across different origins share a single unified reactive state bus without serialization or `postMessage` overhead.

---

## 📊 Complete Generation Comparison Matrix

| Capability | Standard React 19 | Redux / Zustand | uReact v2.3 (Current) | uReact v3.0 (Planned) | uReact v4.0 (Vision) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Fine-Grained Signals** | ❌ No | ❌ Selector-based | ✅ `signal()` / `computed()` | ✅ AOT Compiled Atoms | ✅ Off-Thread WASM Signals |
| **Two-Way Form Binding** | ❌ Manual `onChange` | ❌ Action dispatchers | ✅ Direct `store.$bind` | ✅ Native Type-Safe Forms | ✅ AI-Inferred Dynamic Forms |
| **Context Re-render Hell** | ❌ Cascades to all | ⚠️ Requires selectors | ✅ Automatic Proxy Tracking | ✅ Micro-Atom Tracking | ✅ Zero-Main-Thread Overhead |
| **Component Fault Isolation** | ⚠️ Heavy Class Boundary | ❌ None | ✅ `<Catch>` / `isolate()` | ✅ Auto-Self-Healing Trees | ✅ Resilient Worker Sandboxes |
| **DevTools & Telemetry** | ⚠️ Browser Ext Only | ⚠️ Redux DevTools | ✅ Embedded Quantum HUD | ✅ Dedicated Chrome Ext | ✅ AI Telemetry & Diagnostics |
| **Scoped CSS Styling** | ❌ CSS Modules / Tailwind | ❌ None | ✅ `<Scoped>` + `useScopedCSS` | ✅ AOT Scoped CSS | ✅ GPU Shader Styled Shaders |
| **JavaScript Hydration Tax** | ❌ Hydrates all nodes | ❌ Full bundle hydration | ⚠️ Standard hydration | ✅ Resumable Islands (0KB JS) | ✅ Instant WASM Hydration |
| **Multi-User Collaboration** | ❌ Manual WebSockets | ❌ Manual WebSockets | ⚠️ User-implemented | ⚠️ RPC Action Mutators | ✅ Built-in P2P CRDT Stores |
| **AI Generative UI** | ❌ Manual Parser | ❌ None | ⚠️ SWR streaming | ⚠️ Streaming RPC | ✅ Native `<AgenticUI>` |

---

*Authored by the uReact Core Team · Maintained in repository root as `ROADMAP.md`.*
