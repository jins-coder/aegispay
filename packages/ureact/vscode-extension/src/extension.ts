import * as vscode from 'vscode';

interface DocumentationEntry {
  title: string;
  signature: string;
  summary: string;
  reactComparison: string;
  example: string;
  docUrl: string;
}

const UREACT_DOCS: Record<string, DocumentationEntry> = {
  signal: {
    title: 'uReact Signal Atom',
    signature: 'function signal<T>(initialValue: T): Signal<T>',
    summary: 'Creates a fine-grained reactive scalar atom. Components subscribing via `useSignal` update surgically with **zero re-renders** in parent components or sibling branches.',
    reactComparison: '💡 **React vs uReact**: Replaces `useState`. Eliminates stale closures, callback prop drilling, and unnecessary re-renders of the entire component tree.',
    example: `const count = signal(0);\n\n// Read or update directly:\ncount.value++;\n\n// Subscribe inside component:\nconst [val, setVal] = useSignal(count);`,
    docUrl: 'http://localhost:3000/docs/signals'
  },
  computed: {
    title: 'uReact Computed Signal',
    signature: 'function computed<T>(fn: () => T): ReadonlySignal<T>',
    summary: 'Creates an auto-tracked, lazily evaluated reactive signal derived from other signals. Automatically re-evaluates only when upstream dependencies change.',
    reactComparison: '💡 **React vs uReact**: Replaces `useMemo`. Zero manual dependency arrays to maintain; dependencies are tracked dynamically at runtime.',
    example: `const count = signal(10);\nconst doubled = computed(() => count.value * 2);\n\nconsole.log(doubled.value); // 20`,
    docUrl: 'http://localhost:3000/docs/signals'
  },
  useSignal: {
    title: 'uReact useSignal Hook',
    signature: 'function useSignal<T>(signal: Signal<T>): [T, (val: T | ((prev: T) => T)) => void, Signal<T>]',
    summary: 'Subscribes a React component to a signal using `useSyncExternalStore`. Re-renders only when this specific atom emits a new value.',
    reactComparison: '💡 **React vs uReact**: High-efficiency hook that avoids React 18/19 tearing without overhead.',
    example: `const [count, setCount] = useSignal(counterSignal);\nreturn <button onClick={() => setCount(c => c + 1)}>{count}</button>;`,
    docUrl: 'http://localhost:3000/docs/signals'
  },
  createStore: {
    title: 'uReact Reactive Proxy Store',
    signature: 'function createStore<T extends object>(initialState: T): T & StoreExtension',
    summary: 'Creates a deeply reactive proxy store supporting direct mutations (`store.user.name = "Alice"`), micro-batched subscriber notifications, and `$bind(key)` input proxies.',
    reactComparison: '💡 **React vs uReact**: Replaces Redux, Zustand, and complex Context reducers in under 2KB. Mutate state directly without manual spread operators.',
    example: `export const userStore = createStore({\n  name: 'Alex',\n  score: 100,\n  increment() {\n    this.score++;\n  }\n});\n\n// In JSX:\n<input {...userStore.$bind('name')} />`,
    docUrl: 'http://localhost:3000/docs/state-management'
  },
  useStore: {
    title: 'uReact useStore Hook',
    signature: 'function useStore<T extends object>(store: T, selector?: (state: T) => any): T',
    summary: 'Binds a React component to a uReact reactive store with optional selector-level re-render optimization.',
    reactComparison: '💡 **React vs uReact**: Eliminates Context re-rendering waterfalls. Components only update when selected fields change.',
    example: `const user = useStore(userStore);\nreturn <h1>Hello, {user.name}!</h1>;`,
    docUrl: 'http://localhost:3000/docs/state-management'
  },
  createFormStore: {
    title: 'uReact Reactive Form Store',
    signature: 'function createFormStore<T extends object>(config: FormStoreConfig<T>): FormStore<T>',
    summary: 'Declarative reactive form manager with synchronous validation rules, dirty & touched state tracking, 2-way `$bind()` input adapters, and async submit handling.',
    reactComparison: '💡 **React vs uReact**: Replaces Formik and React Hook Form with zero external dependencies and effortless 2-way bindings.',
    example: `const form = createFormStore({\n  initialValues: { email: '', password: '' },\n  rules: {\n    email: [rules.required('Email is required'), rules.email('Invalid email address')],\n    password: [rules.required('Password is required'), rules.minLength(8, 'Min 8 chars')]\n  },\n  onSubmit: async (values) => {\n    await api.login(values);\n  }\n});\n\n// In JSX:\n<input {...form.$bind('email')} />\n{form.errors.email && <span className="error">{form.errors.email}</span>}`,
    docUrl: 'http://localhost:3000/docs/dev-features'
  },
  rules: {
    title: 'uReact Form Validation Rules',
    signature: 'const rules = { required, email, minLength, maxLength, pattern, custom }',
    summary: 'Built-in composable validation rule builders for `createFormStore`.',
    reactComparison: '💡 **React vs uReact**: Lightweight validation without heavy schema libraries like Yup or Zod.',
    example: `rules: {\n  email: [rules.required(), rules.email()],\n  age: [rules.custom(v => v >= 18, 'Must be at least 18 years old')]\n}`,
    docUrl: 'http://localhost:3000/docs/dev-features'
  },
  Scoped: {
    title: 'uReact <Scoped> CSS Component',
    signature: '<Scoped css={string} as?: keyof JSX.IntrinsicElements>{children}</Scoped>',
    summary: 'Injects component-isolated CSS with automatic `[data-scope="..."]` namespace scoping into `<head>`. Automatically cleans up styles when unmounted.',
    reactComparison: '💡 **React vs uReact**: Zero-build CSS-in-JS without Styled-Components overhead, CSS Modules configuration, or Tailwind class pollution.',
    example: `<Scoped css={\`\n  .card {\n    background: #0f172a;\n    padding: 20px;\n    border-radius: 12px;\n  }\n  .card:hover { border-color: #3b82f6; }\n\`}>\n  <div className="card">\n    <h3>Isolated Card</h3>\n  </div>\n</Scoped>`,
    docUrl: 'http://localhost:3000/docs/dev-features'
  },
  useScopedCSS: {
    title: 'uReact useScopedCSS Hook',
    signature: 'function useScopedCSS(css: string): { scopeProps: { "data-scope": string }, className: string }',
    summary: 'Dynamic CSS-in-JS hook generating a unique isolated scope hash with reference-counted DOM cleanup.',
    reactComparison: '💡 **React vs uReact**: Perfect for dynamic theming or micro-frontends without style leaking.',
    example: `const { scopeProps, className } = useScopedCSS(\`\n  .title { color: #38bdf8; font-size: 24px; }\n\`);\nreturn <h1 {...scopeProps} className="title">Scoped Title</h1>;`,
    docUrl: 'http://localhost:3000/docs/dev-features'
  },
  watch: {
    title: 'uReact State Watcher (watch / useWatchReactive)',
    signature: 'function useWatchReactive<T>(source: WatchSource<T>, cb: (next: T, prev: T) => void, options?: WatchOptions): void',
    summary: 'Watches signals, store slices, or getter functions with `(newValue, oldValue)` parameters without `useEffect` dependency array bugs or re-renders.',
    reactComparison: '💡 **React vs uReact**: Unlike `useEffect`, fires precisely on state transition with access to previous values without manual `useRef` caching.',
    example: `useWatchReactive(\n  () => userStore.name,\n  (newName, oldName) => {\n    console.log(\`User changed from \${oldName} to \${newName}\`);\n  }\n);`,
    docUrl: 'http://localhost:3000/docs/dev-features'
  },
  useWatchReactive: {
    title: 'uReact useWatchReactive Hook',
    signature: 'function useWatchReactive<T>(source: WatchSource<T>, cb: (next: T, prev: T) => void, options?: WatchOptions): void',
    summary: 'React hook version of `watch`. Automatically disposes listener on component unmount.',
    reactComparison: '💡 **React vs uReact**: No stale closures, explicit old vs new state comparisons, optional `immediate: true` or `deep: true`.',
    example: `useWatchReactive(cartSignal, (newCart, oldCart) => {\n  syncCartToAnalytics(newCart);\n}, { deep: true });`,
    docUrl: 'http://localhost:3000/docs/dev-features'
  },
  useAction: {
    title: 'uReact React 19 useAction Primitive',
    signature: 'function useAction<P, R>(actionFn: (prev: R, payload: P) => Promise<R>, initialState: R, options?: ActionOptions): ActionReturn<P, R>',
    summary: 'Unified React 19 Action handler integrating `useActionState` and `useOptimistic` into a single, type-safe API with automatic rollback on rejection.',
    reactComparison: '💡 **React vs uReact**: Replaces 3-4 separate hooks (`useState`, `useTransition`, `useOptimistic`, `useEffect`) in one clean primitive.',
    example: `const todoAction = useAction(async (prev, newTodo: string) => {\n  return await api.addTodo(newTodo);\n}, initialTodos, {\n  optimisticUpdate: (prev, newTodo) => [...prev, { id: 'temp', title: newTodo }]\n});\n\n// Usage:\n<button onClick={() => todoAction.run('Buy groceries')}>Add</button>\n{todoAction.isPending && <span>Saving...</span>}`,
    docUrl: 'http://localhost:3000/docs/react-19'
  },
  DevTools: {
    title: 'uReact Quantum DevTools HUD',
    signature: '<DevTools defaultOpen?: boolean, position?: "bottom-right" | "bottom-left" | "top-right" />',
    summary: 'Embedded Quantum DevTools telemetry HUD. Displays live 60 FPS render meter, 98.4% VDOM bypass gauge, state matrix, time-travel history scrubber, and chaos simulator.',
    reactComparison: '💡 **React vs uReact**: Built directly into the runtime. Zero browser extension installation needed for teammates or QA.',
    example: `import { DevTools } from 'ureact';\n\nexport function App() {\n  return (\n    <>\n      <Router />\n      <DevTools defaultOpen={false} position="bottom-right" />\n    </>\n  );\n}`,
    docUrl: 'http://localhost:3000/docs/devtools'
  },
  registerDevTools: {
    title: 'uReact DevTools Registry',
    signature: 'function registerDevTools(name: string, type: "store" | "signal" | "form" | "computed", target: any): void',
    summary: 'Registers any store, signal, or form into the Quantum DevTools HUD for live inspection and time-travel debugging.',
    reactComparison: '💡 **React vs uReact**: Makes any reactive entity immediately visible in the HUD telemetry tabs.',
    example: `registerDevTools('AuthStore', 'store', authStore);\nregisterDevTools('ThemeSignal', 'signal', themeSignal);`,
    docUrl: 'http://localhost:3000/docs/devtools'
  },
  Show: {
    title: 'uReact Declarative <Show>',
    signature: '<Show><Show.When is={condition}>{children}</Show.When><Show.Else>{fallback}</Show.Else></Show>',
    summary: 'Declarative conditional branching in JSX. Eliminates nested ternaries and dangling boolean operators.',
    reactComparison: '💡 **React vs uReact**: Avoids `condition && <Component />` falsey zero rendering bugs.',
    example: `<Show>\n  <Show.When is={user.isAdmin}>\n    <AdminDashboard />\n  </Show.When>\n  <Show.Else>\n    <UserDashboard />\n  </Show.Else>\n</Show>`,
    docUrl: 'http://localhost:3000/docs/control-flow'
  },
  For: {
    title: 'uReact Declarative <For>',
    signature: '<For each={items} fallback={emptySlot}>{(item, index) => JSX}</For>',
    summary: 'Declarative collection rendering with built-in empty fallback slot and automatic key management.',
    reactComparison: '💡 **React vs uReact**: Replaces `.map()` with clean empty array fallback handling.',
    example: `<For each={products} fallback={<p>No products in stock</p>}>\n  {(product) => <ProductCard key={product.id} item={product} />}\n</For>`,
    docUrl: 'http://localhost:3000/docs/control-flow'
  },
  Await: {
    title: 'uReact Declarative <Await>',
    signature: '<Await for={promise} fallback={loadingSlot}>{(data) => JSX}</Await>',
    summary: 'Direct asynchronous promise unwrapping in JSX without `useEffect` or manual loading state flags.',
    reactComparison: '💡 **React vs uReact**: Unwraps promises directly in your JSX template.',
    example: `<Await for={fetchUserProfile()} fallback={<Spinner />}>\n  {(profile) => <UserProfile user={profile} />}\n</Await>`,
    docUrl: 'http://localhost:3000/docs/control-flow'
  },
  useQuery: {
    title: 'uReact Lightweight SWR useQuery',
    signature: 'function useQuery<T>(key: string, fetcher: () => Promise<T>, options?: QueryOptions): QueryResult<T>',
    summary: 'Global SWR data cache with automatic request deduplication, memory caching, background refetching, and focus revalidation in <2KB.',
    reactComparison: '💡 **React vs uReact**: Eliminates 15KB TanStack Query bundle weight for typical web applications.',
    example: `const { data, loading, error, refetch } = useQuery(\n  'user-profile',\n  () => fetch('/api/me').then(r => r.json()),\n  { staleTime: 30000 }\n);`,
    docUrl: 'http://localhost:3000/docs/data-fetching'
  },
  Catch: {
    title: 'uReact <Catch> Component Fault Isolation',
    signature: '<Catch fallback?: ReactNode | ((err, retry) => ReactNode) resetKeys?: any[]>{children}</Catch>',
    summary: 'Component-level fault isolation. If a wrapped component crashes or throws an unhandled error during render, only that component renders a fallback, while all other sibling and parent components continue running without interruption.',
    reactComparison: '💡 **React vs uReact**: Standard React unmounts the ENTIRE tree on unhandled errors, crashing the app into a white screen. <Catch> confines failures to the offending component with built-in retry capabilities and DevTools telemetry.',
    example: `<Catch fallback={(err, retry) => (\n  <div>\n    <p>Widget crashed: {err.message}</p>\n    <button onClick={retry}>Retry</button>\n  </div>\n)}>\n  <FlakyWidget />\n</Catch>`,
    docUrl: 'http://localhost:3000/docs/dev-features#fault-isolation'
  },
  isolate: {
    title: 'uReact isolate() HOC',
    signature: 'function isolate<P>(Component: React.ComponentType<P>, options?: CatchProps | ReactNode): React.FC<P>',
    summary: 'Higher-order component that wraps any component with <Catch> for automatic fault isolation and self-healing recovery.',
    reactComparison: '💡 **React vs uReact**: Turn any third-party or flaky widget into a crash-proof, self-healing component in one line.',
    example: `export const SafeAnalyticsWidget = isolate(AnalyticsWidget);`,
    docUrl: 'http://localhost:3000/docs/dev-features#fault-isolation'
  }
};

export function activate(context: vscode.ExtensionContext) {
  // 1. Status Bar Item for quick actions
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = '$(zap) uReact v2.3';
  statusBar.tooltip = 'Click for uReact actions, quick templates, and documentation';
  statusBar.command = 'ureact.showQuickMenu';
  statusBar.show();
  context.subscriptions.push(statusBar);

  // 2. Hover Provider
  const hoverProvider = vscode.languages.registerHoverProvider(
    ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
    {
      provideHover(document: vscode.TextDocument, position: vscode.Position) {
        const range = document.getWordRangeAtPosition(position);
        if (!range) return;

        const word = document.getText(range);
        const doc = UREACT_DOCS[word];
        if (!doc) return;

        const markdown = new vscode.MarkdownString();
        markdown.isTrusted = true;
        markdown.supportHtml = true;

        markdown.appendMarkdown(`### ⚡ ${doc.title}\n\n`);
        markdown.appendCodeblock(doc.signature, 'typescript');
        markdown.appendMarkdown(`\n${doc.summary}\n\n`);
        markdown.appendMarkdown(`${doc.reactComparison}\n\n`);
        markdown.appendMarkdown(`**Example:**\n`);
        markdown.appendCodeblock(doc.example, 'typescript');
        markdown.appendMarkdown(`\n[📖 Open Interactive Docs](${doc.docUrl}) | [⚡ Insert Snippet](command:ureact.insertStoreTemplate)`);

        return new vscode.Hover(markdown, range);
      }
    }
  );
  context.subscriptions.push(hoverProvider);

  // 3. IntelliSense Completion Item Provider
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const completions: vscode.CompletionItem[] = [];

        for (const [key, doc] of Object.entries(UREACT_DOCS)) {
          const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Function);
          item.detail = `uReact 2.3: ${doc.title}`;
          item.documentation = new vscode.MarkdownString(
            `${doc.summary}\n\n${doc.reactComparison}\n\n\`\`\`typescript\n${doc.example}\n\`\`\``
          );
          completions.push(item);
        }

        return completions;
      }
    }
  );
  context.subscriptions.push(completionProvider);

  // 4. Quick Menu Command
  const quickMenuCmd = vscode.commands.registerCommand('ureact.showQuickMenu', async () => {
    const selected = await vscode.window.showQuickPick(
      [
        {
          label: '$(book) Open uReact Documentation Portal',
          description: 'Launch official guide & interactive examples',
          action: 'openDocs'
        },
        {
          label: '$(pulse) Insert Reactive Store (createStore)',
          description: 'Deep proxy store with direct mutations & $bind proxy',
          action: 'insertStore'
        },
        {
          label: '$(checklist) Insert Form Store with Rules (createFormStore)',
          description: 'Reactive form validation with email, required & minLength',
          action: 'insertForm'
        },
        {
          label: '$(symbol-color) Insert Scoped CSS Component (<Scoped>)',
          description: 'Component-isolated CSS with head auto-cleanup',
          action: 'insertScoped'
        },
        {
          label: '$(dashboard) Mount Quantum DevTools HUD (<DevTools />)',
          description: '60 FPS render meter, VDOM bypass telemetry & time-travel',
          action: 'insertDevTools'
        }
      ],
      {
        placeHolder: '⚡ uReact 2.3 - Select Developer Action'
      }
    );

    if (!selected) return;

    switch (selected.action) {
      case 'openDocs':
        vscode.commands.executeCommand('ureact.openDocs');
        break;
      case 'insertStore':
        vscode.commands.executeCommand('ureact.insertStoreTemplate');
        break;
      case 'insertForm':
        vscode.commands.executeCommand('ureact.insertFormTemplate');
        break;
      case 'insertScoped':
        vscode.commands.executeCommand('ureact.insertScopedTemplate');
        break;
      case 'insertDevTools':
        vscode.commands.executeCommand('ureact.insertDevTools');
        break;
    }
  });
  context.subscriptions.push(quickMenuCmd);

  // 5. Open Docs Command
  const openDocsCmd = vscode.commands.registerCommand('ureact.openDocs', () => {
    vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000/docs'));
  });
  context.subscriptions.push(openDocsCmd);

  // 6. Template Insertion Commands
  const insertStoreCmd = vscode.commands.registerCommand('ureact.insertStoreTemplate', () => {
    insertSnippet(`export const \${1:appStore} = createStore({
  \${2:title}: '\${3:uReact Dashboard}',
  \${4:count}: \${5:0},
  \${6:increment}() {
    this.\${4:count}++;
  }
});
`);
  });
  context.subscriptions.push(insertStoreCmd);

  const insertFormCmd = vscode.commands.registerCommand('ureact.insertFormTemplate', () => {
    insertSnippet(`const \${1:form} = createFormStore({
  initialValues: {
    email: '',
    password: ''
  },
  rules: {
    email: [rules.required('Email is required'), rules.email('Invalid email address')],
    password: [rules.required('Password is required'), rules.minLength(8, 'Min 8 characters')]
  },
  onSubmit: async (values) => {
    await \${2:api.submit}(values);
  }
});
`);
  });
  context.subscriptions.push(insertFormCmd);

  const insertScopedCmd = vscode.commands.registerCommand('ureact.insertScopedTemplate', () => {
    insertSnippet(`<Scoped css={\`
  .\${1:container} {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 24px;
    color: #f8fafc;
  }
  .\${1:container}:hover {
    border-color: #38bdf8;
    box-shadow: 0 8px 30px rgba(56, 189, 248, 0.15);
  }
\`}>
  <div className="\${1:container}">
    \${0:<h3>Scoped uReact Component</h3>}
  </div>
</Scoped>
`);
  });
  context.subscriptions.push(insertScopedCmd);

  const insertDevToolsCmd = vscode.commands.registerCommand('ureact.insertDevTools', () => {
    insertSnippet(`<DevTools defaultOpen={false} position="bottom-right" />\n`);
  });
  context.subscriptions.push(insertDevToolsCmd);
}

function insertSnippet(template: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('Please open a file to insert the uReact template.');
    return;
  }
  editor.insertSnippet(new vscode.SnippetString(template));
}

export function deactivate() {}
