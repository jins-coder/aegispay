# ⚡ uReact Developer Suite - VS Code Extension

**Elevate your uReact development experience with instant IntelliSense, intelligent autocomplete snippets, hover documentation, and reactive scaffolding.**

Designed specifically for developers using **uReact v2.3+**, this extension brings the speed and clarity of fine-grained reactive primitives directly into your editor.

---

## 🌟 Key Features

### 1. 🚀 Instant Reactive Snippets
Type any prefix starting with `ur` in TypeScript (`.ts`, `.tsx`) or JavaScript (`.js`, `.jsx`) files to immediately scaffold full uReact patterns:

| Prefix | Snippet Name | Description |
| :--- | :--- | :--- |
| `ursignal` | Signal Atom | Create fine-grained reactive scalar atom |
| `urcomputed` | Computed Signal | Auto-tracked, lazily evaluated derivation |
| `urusesignal` | useSignal Hook | Subscribe component with zero parent re-renders |
| `urstore` | Reactive Store | Deep proxy store with direct mutations & `$bind` |
| `urusestore` | useStore Hook | Subscribe React component with sync external store |
| `urform` | Reactive Form Store | Validated form state with `rules` & 2-way bindings |
| `urscoped` | `<Scoped>` Component | Component-isolated CSS with automatic head cleanup |
| `urusescoped` | `useScopedCSS` Hook | Dynamic scoped stylesheet generator |
| `urwatch` | `useWatchReactive` | Watch state changes with `(newVal, oldVal)` |
| `uraction` | `useAction` (React 19) | Unified `useActionState` + `useOptimistic` |
| `urshow` | Declarative `<Show>` | Conditional branching without nested ternaries |
| `urwhen` | Declarative `<When>` | Single condition guard with fallback slot |
| `urfor` | Declarative `<For>` | Declarative list loop with empty fallback |
| `urawait` | Declarative `<Await>` | Async promise unwrapping directly in JSX |
| `urquery` | SWR `useQuery` | SWR caching, request deduplication & revalidation |
| `urdevtools` | `<DevTools />` HUD | Mount Quantum DevTools HUD with 60 FPS meter |
| `urregdevtools` | Register DevTools | Register store, signal, or form into DevTools |

---

### 2. 💡 Hover Documentation & React Comparison
Hover over any uReact keyword (`signal`, `computed`, `createStore`, `createFormStore`, `Scoped`, `watch`, `useAction`, `DevTools`) to see:
- Exact TypeScript function signature.
- Detailed explanation of reactivity and lifecycle.
- **Why it's better than standard React**: Direct architectural comparison against `useState`, `useEffect`, or heavy state management libraries.
- Ready-to-use code examples.
- Direct links to the local interactive documentation portal.

---

### 3. 🛠️ Command Palette & Status Bar Integration
- Click the **`⚡ uReact v2.3`** badge in the bottom-right status bar to trigger the quick actions menu.
- Or open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search:
  - `uReact: Open Interactive Documentation Portal`
  - `uReact: Insert Reactive Store Template`
  - `uReact: Insert Form Validation Store Template`
  - `uReact: Insert <Scoped> Component Template`
  - `uReact: Mount <DevTools /> HUD`

---

## 📦 Installation & Packaging

### Option A: Local Development / Testing
1. In your VS Code window, press `F5` while opening this folder to launch an **Extension Development Host**.
2. Open any `.tsx` or `.ts` file and try typing `urstore` or hovering over `signal`.

### Option B: Build `.vsix` Package
Install the VS Code Extension CLI and package the extension:
```bash
npm install -g @vscode/vsce
vsce package
```
Then install the generated `.vsix` in VS Code via:
- Extensions View (`Ctrl+Shift+X`) -> `...` Menu -> **Install from VSIX...**

---

## ⚡ Requirements
- Visual Studio Code version `^1.80.0` or newer.
- `ureact` version `^2.3.0` installed in your project.

---

## 📄 License
MIT © uReact Team
