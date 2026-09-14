export interface TOCItem {
  id: string;
  text: string;
}

export interface DocItem {
  id: string;
  path: string;
  title: string;
  badge?: string;
  badgeType?: 'react19' | 'new' | 'reduction' | 'core' | 'swr' | 'flow' | 'shortcuts';
  description: string;
  toc?: TOCItem[];
}

export interface DocCategory {
  title: string;
  items: DocItem[];
}

export const DOC_CATEGORIES: DocCategory[] = [
  {
    title: 'GETTING STARTED',
    items: [
      {
        id: 'quickstart',
        path: '/docs/quickstart',
        title: 'Quickstart & Architecture',
        badge: 'v2.3',
        badgeType: 'core',
        description: 'Install uReact, understand the architecture, and build your first component.',
        toc: [
          { id: 'installation', text: '1. Installation' },
          { id: 'first-component', text: '2. First Component' },
          { id: 'architecture', text: '3. Architecture Deep-Dive' }
        ]
      },
      {
        id: 'playground',
        path: '/docs/playground',
        title: 'Live Code Playground',
        badge: 'Live Sandbox',
        badgeType: 'new',
        description: 'Experiment with Signals v2, $bind, and React 19 ActionForm live in browser.',
        toc: [
          { id: 'signals-preset', text: '1. Signals v2 Preset' },
          { id: 'binding-preset', text: '2. Form Auto-Binding' },
          { id: 'actions-preset', text: '3. React 19 Action Form' }
        ]
      },
      {
        id: 'roadmap',
        path: '/docs/roadmap',
        title: 'Next Version & Roadmap',
        badge: 'v2.3 ➔ v4.0',
        badgeType: 'react19',
        description: 'Complete roadmap: v2.3.0 Latest, v3.0.0 RFC Compiler & Streaming, and v4.0.0 Autonomous Multi-Threaded Horizon.',
        toc: [
          { id: 'v23-features', text: '1. v2.3.0 Features' },
          { id: 'v30-rfcs', text: '2. v3.0 RFC Specifications' },
          { id: 'v40-vision', text: '3. v4.0 Autonomous Horizon' },
          { id: 'changelog', text: '4. Release History' }
        ]
      },
      {
        id: 'dev-features',
        path: '/docs/dev-features',
        title: 'Scoped CSS, Forms & DevTools',
        badge: 'New in v2.3',
        badgeType: 'new',
        description: 'Native Scoped CSS, createFormStore validation, watch(), and built-in DevTools HUD.',
        toc: [
          { id: 'scoped-css', text: '1. Scoped CSS (<Scoped>)' },
          { id: 'form-validation', text: '2. Form Store & Rules' },
          { id: 'reactive-watcher', text: '3. State Watcher (watch)' },
          { id: 'devtools-hud', text: '4. DevTools HUD & Inspector' }
        ]
      },
      {
        id: 'compiler',
        path: '/docs/compiler',
        title: 'Zero-Runtime Compiler',
        badge: 'v3.0 AOT',
        badgeType: 'new',
        description: 'Ahead-of-time compiler: atomic __patch, JSX signal DOM pruning, and Vite plugin.',
        toc: [
          { id: 'compiler-overview', text: '1. Compiler Architecture' },
          { id: 'live-studio', text: '2. Live AST Studio' },
          { id: 'benchmarks', text: '3. Mutation Benchmark' },
          { id: 'vite-config', text: '4. Vite & Rollup Config' }
        ]
      }
    ]

  },
  {
    title: 'REACTIVE STATE (CORE)',
    items: [
      {
        id: 'reactive-state',
        path: '/docs/reactive-state',
        title: 'createStore & view()',
        badge: '0 Hooks',
        badgeType: 'core',
        description: 'Direct mutable syntax mapped to React 18/19 concurrent rendering.',
        toc: [
          { id: 'create-store', text: '1. createStore' },
          { id: 'view', text: '2. view() Reactive Wrapping' },
          { id: 'batching', text: '3. Concurrent Batching' },
          { id: 'live-demo', text: '4. Interactive Live Demo' }
        ]
      },
      {
        id: 'direct-binding',
        path: '/docs/direct-binding',
        title: 'store.$bind & Two-Way Binding',
        badge: 'No Boilerplate',
        badgeType: 'reduction',
        description: 'Universal two-way form binding directly on proxy properties.',
        toc: [
          { id: 'syntax', text: '1. Syntax & Usage' },
          { id: 'forms-vs-react', text: '2. Comparison vs Standard React' },
          { id: 'live-demo', text: '3. Interactive Live Demo' }
        ]
      },
      {
        id: 'collections',
        path: '/docs/collections',
        title: 'createListStore (1-Line CRUD)',
        badge: 'New in v2.1',
        badgeType: 'new',
        description: 'Reactive collections with built-in add, remove, toggle, and auto-IDs.',
        toc: [
          { id: 'create-list-store', text: '1. 1-Line CRUD Operations' },
          { id: 'live-demo', text: '2. Interactive Live Demo' }
        ]
      }
    ]
  },
  {
    title: 'REACT 19 NATIVE ENGINE',
    items: [
      {
        id: 'react19-actions',
        path: '/docs/react19-actions',
        title: 'Actions & useOptimistic',
        badge: 'React 19',
        badgeType: 'react19',
        description: 'Native concurrent transitions, typed payloads, and 0ms optimistic updates.',
        toc: [
          { id: 'use-action', text: '1. useAction & Actions' },
          { id: 'optimistic', text: '2. useOptimistic Updates' },
          { id: 'form-status', text: '3. useActionStatus & Pending' },
          { id: 'live-demo', text: '4. Live Comments Stream' }
        ]
      },
      {
        id: 'auto-form',
        path: '/docs/auto-form',
        title: '<AutoForm> & <ActionForm>',
        badge: '1-Tag Forms',
        badgeType: 'new',
        description: 'Auto-inferred reactive forms and React 19 Action forms.',
        toc: [
          { id: 'auto-form-usage', text: '1. Single-Tag <AutoForm>' },
          { id: 'action-form', text: '2. React 19 <ActionForm>' },
          { id: 'live-demo', text: '3. Interactive Live Demo' }
        ]
      },
      {
        id: 'react19-async',
        path: '/docs/react19-async',
        title: 'use(Promise) & Suspense',
        badge: 'React 19',
        badgeType: 'react19',
        description: 'Native promise unwrapping during render without useEffect.',
        toc: [
          { id: 'use-promise', text: '1. use(Promise) & Suspense' },
          { id: 'action-transition', text: '2. useActionTransition' },
          { id: 'use-deferred', text: '3. useDeferred Initial Value' },
          { id: 'live-demo', text: '4. Live Promise Resolver' }
        ]
      },
      {
        id: 'react19-resources',
        path: '/docs/react19-resources',
        title: 'Resource Preloading & <Head>',
        badge: 'React 19',
        badgeType: 'react19',
        description: 'preload, preconnect, prefetchDNS, and document metadata hoisting.',
        toc: [
          { id: 'preloading', text: '1. Resource Preloading APIs' },
          { id: 'head-metadata', text: '2. <Head> Document Hoisting' },
          { id: 'live-demo', text: '3. Resource Diagnostics' }
        ]
      }
    ]
  },
  {
    title: 'DATA FETCHING & CACHE',
    items: [
      {
        id: 'query-cache',
        path: '/docs/query-cache',
        title: 'Global Query & SWR Cache',
        badge: 'SWR',
        badgeType: 'swr',
        description: 'Global request deduplication, optimistic mutations, and window refetch.',
        toc: [
          { id: 'use-query', text: '1. useQuery & SWR Engine' },
          { id: 'use-mutation', text: '2. useMutation & Rollback' },
          { id: 'live-demo', text: '3. Global Cache Inspector' }
        ]
      }
    ]
  },
  {
    title: 'DECLARATIVE CONTROL FLOW',
    items: [
      {
        id: 'control-flow',
        path: '/docs/control-flow',
        title: '<When>, <Show>, <For>, <Fetch>',
        badge: 'Clean JSX',
        badgeType: 'flow',
        description: 'Eliminate nested ternary operators, .map() boilerplate, and IIFEs.',
        toc: [
          { id: 'show-when', text: '1. <When> & <Show>' },
          { id: 'for-loop', text: '2. <For> Declarative Lists' },
          { id: 'fetch', text: '3. <Fetch> Declarative Await' },
          { id: 'live-demo', text: '4. Control Flow Playground' }
        ]
      }
    ]
  },
  {
    title: 'TIME-TRAVEL & SHORTCUTS',
    items: [
      {
        id: 'time-travel',
        path: '/docs/time-travel',
        title: 'Time-Travel & Keyboard Shortcuts',
        badge: 'Undo/Redo',
        badgeType: 'shortcuts',
        description: 'Multi-step state history stack and declarative hotkey bindings.',
        toc: [
          { id: 'history-store', text: '1. createHistoryStore' },
          { id: 'shortcuts', text: '2. useShortcut Keybindings' },
          { id: 'live-demo', text: '3. Undo/Redo Canvas' }
        ]
      }
    ]
  },
  {
    title: 'REFERENCE & TOOLS',
    items: [
      {
        id: 'hooks-reference',
        path: '/docs/hooks-reference',
        title: 'Complete Hooks Reference',
        badge: '15+ APIs',
        badgeType: 'core',
        description: 'Full reference for useMount, useWatch, useDeferred, useInView, and more.',
        toc: [
          { id: 'reference-table', text: '1. Complete APIs Table' },
          { id: 'react19-hooks', text: '2. React 19 Hooks' },
          { id: 'reactivity-hooks', text: '3. Reactivity & State Hooks' },
          { id: 'utility-hooks', text: '4. UI & Utility Hooks' }
        ]
      },
      {
        id: 'code-reducer',
        path: '/docs/code-reducer',
        title: 'Code Reduction Lab',
        badge: '-89.2% Code',
        badgeType: 'reduction',
        description: 'Live side-by-side comparison: Standard React (65 lines) vs uReact (7 lines).',
        toc: [
          { id: 'reduction-metrics', text: '1. Reduction Breakdown (-89.2%)' },
          { id: 'side-by-side', text: '2. Side-by-Side Comparison' },
          { id: 'live-demo', text: '3. Interactive Reduction Lab' }
        ]
      },
      {
        id: 'devtools',
        path: '/docs/devtools',
        title: 'Quantum DevTools HUD',
        badge: 'Built-in HUD',
        badgeType: 'new',
        description: 'Comprehensive guide to the built-in uReact DevTools HUD: 60 FPS meter, 98.4% VDOM bypass, time-travel, and telemetry.',
        toc: [
          { id: 'overview', text: '1. Overview & Setup' },
          { id: 'state-matrix', text: '2. State Matrix' },
          { id: 'quantum-timeline', text: '3. Quantum Timeline & Rewind' },
          { id: 'neural-mesh', text: '4. Neural Dependency Mesh' },
          { id: 'telemetry-chaos', text: '5. Telemetry & Chaos Lab' },
          { id: 'registration-api', text: '6. Registration API' },
          { id: 'live-interactive', text: '7. Live Interactive Controller' }
        ]
      }
    ]
  }
];


export const ALL_DOC_PAGES: DocItem[] = DOC_CATEGORIES.flatMap((c) => c.items);

export function getDocPageByPath(path: string): DocItem | undefined {
  const normalized = path.replace(/\/$/, '') || '/docs/quickstart';
  return (
    ALL_DOC_PAGES.find((p) => p.path === normalized || p.id === normalized.replace(/^\/docs\//, '')) ||
    ALL_DOC_PAGES[0]
  );
}

export function getDocPageById(id: string): DocItem {
  return ALL_DOC_PAGES.find((p) => p.id === id) || ALL_DOC_PAGES[0];
}
