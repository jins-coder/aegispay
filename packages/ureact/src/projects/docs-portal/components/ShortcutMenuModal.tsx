import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useShortcut, useDeferred } from 'ureact';
import {
  Keyboard,
  X,
  Undo2,
  Redo2,
  Sparkles,
  FileText,
  Zap,
  Layers,
  History,
  CornerDownLeft,
  Database,
  Search,
  BookOpen,
  Cpu,
  Package,
  Sun,
  Moon,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Terminal,
  Clock,
  ArrowRight,
  Compass,
  Hash,
  Share2,
  Sliders,
  Trash2
} from 'lucide-react';
import { ALL_DOC_PAGES, DocItem } from '../docs/docsData';

export interface ShortcutMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (id: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  currentVersion?: string;
  onSelectVersion?: (version: string) => void;
  onOpenRoadmap?: () => void;
}

export type PaletteItemType = 'doc' | 'hook' | 'action';

export interface PaletteItem {
  id: string;
  type: PaletteItemType;
  title: string;
  subtitle: string;
  category: string;
  badge?: string;
  badgeType?: 'react19' | 'core' | 'action' | 'emerald';
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  // Precomputed lowercase search index for zero-allocation performance
  _searchIndex: string;
  // Metadata for split preview pane
  hookSignature?: string;
  hookSnippet?: string;
  docPath?: string;
  toc?: { id: string; text: string }[];
}

interface RecentSearchEntry {
  id: string;
  title: string;
  type: PaletteItemType;
  timestamp: string;
}

// Helper to highlight matching query substrings safely with zero regex injection
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim()) return <>{text}</>;
  
  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  const index = lower.indexOf(q);
  
  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const after = text.slice(index + q.length);

  return (
    <>
      {before}
      <mark className="palette-highlight">{match}</mark>
      {after}
    </>
  );
}

// Static Hook Index: All 19 uReact & React 19 hooks with pre-compiled tokens
const PALETTE_HOOKS: Omit<PaletteItem, 'action'>[] = [
  {
    id: 'hook-use-action',
    type: 'hook',
    title: 'useAction(fn, initial, options)',
    subtitle: 'React 19 ActionState + useOptimistic unified in 1 hook with typed payloads',
    category: 'React 19 Hooks',
    badge: 'React 19',
    badgeType: 'react19',
    icon: <Zap size={16} style={{ color: 'var(--accent-amber)' }} />,
    hookSignature: 'const action = useAction<TInput, TState>(actionFn, initial, options?);',
    hookSnippet: `import { useAction } from 'ureact';

const action = useAction(
  async (prev, text) => api.save(text),
  initialData,
  { optimisticUpdate: (prev, text) => [...prev, text] }
);`,
    _searchIndex: 'useaction actions optimistic react 19 mutation form action'
  },
  {
    id: 'hook-use-action-status',
    type: 'hook',
    title: 'useActionStatus()',
    subtitle: 'Safe react-dom useFormStatus with fallback outside <form> boundaries',
    category: 'React 19 Hooks',
    badge: 'React 19',
    badgeType: 'react19',
    icon: <Zap size={16} style={{ color: 'var(--accent-amber)' }} />,
    hookSignature: 'const { pending, data, method, action } = useActionStatus();',
    hookSnippet: `import { useActionStatus } from 'ureact';

const { pending } = useActionStatus();
return <button disabled={pending}>{pending ? 'Saving...' : 'Submit'}</button>;`,
    _searchIndex: 'useactionstatus useformstatus form pending status submit'
  },
  {
    id: 'hook-use-form-reset',
    type: 'hook',
    title: 'useFormReset()',
    subtitle: 'Native form reset function using React 19 requestFormReset',
    category: 'React 19 Hooks',
    badge: 'React 19',
    badgeType: 'react19',
    icon: <Zap size={16} style={{ color: 'var(--accent-amber)' }} />,
    hookSignature: 'const resetForm = useFormReset();',
    hookSnippet: `import { useFormReset } from 'ureact';

const reset = useFormReset();
reset(formElement); // Native React 19 requestFormReset`,
    _searchIndex: 'useformreset requestformreset reset form uncontrolled'
  },
  {
    id: 'hook-use-action-transition',
    type: 'hook',
    title: 'useActionTransition()',
    subtitle: 'React 19 async transition runner with automatic error boundary capture',
    category: 'React 19 Hooks',
    badge: 'Concurrent',
    badgeType: 'react19',
    icon: <Zap size={16} style={{ color: 'var(--accent-amber)' }} />,
    hookSignature: 'const { run, isPending, error } = useActionTransition();',
    hookSnippet: `import { useActionTransition } from 'ureact';

const transition = useActionTransition();
transition.run(async () => {
  await fetchTab(id);
  setTab(id);
});`,
    _searchIndex: 'useactiontransition usetransition async concurrent starttransition'
  },
  {
    id: 'hook-use-deferred',
    type: 'hook',
    title: 'useDeferred(val, initial)',
    subtitle: 'React 19 useDeferredValue with support for initial fallback values',
    category: 'React 19 Hooks',
    badge: 'Concurrent',
    badgeType: 'react19',
    icon: <Zap size={16} style={{ color: 'var(--accent-amber)' }} />,
    hookSignature: 'const deferredValue = useDeferred<T>(value, initialValue?);',
    hookSnippet: `import { useDeferred } from 'ureact';

const deferredQuery = useDeferred(query, 'Default query');`,
    _searchIndex: 'usedeferred usedeferredvalue fallback concurrent debounce'
  },
  {
    id: 'hook-use-promise',
    type: 'hook',
    title: 'usePromise(promise)',
    subtitle: 'Directly unwrap promises inside render functions via React 19 use()',
    category: 'React 19 Hooks',
    badge: 'Suspense',
    badgeType: 'react19',
    icon: <Zap size={16} style={{ color: 'var(--accent-amber)' }} />,
    hookSignature: 'const data = usePromise<T>(promise);',
    hookSnippet: `import { usePromise } from 'ureact';

// Unwraps promise synchronously inside Suspense:
const user = usePromise(fetchUserPromise);
return <div>{user.name}</div>;`,
    _searchIndex: 'usepromise use promise suspense unwrap async data'
  },
  {
    id: 'hook-use-store',
    type: 'hook',
    title: 'useStore(store)',
    subtitle: 'Subscribes to reactive createStore using useSyncExternalStore',
    category: 'Core Reactivity',
    badge: 'Store',
    badgeType: 'core',
    icon: <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />,
    hookSignature: 'const state = useStore(store);',
    hookSnippet: `import { createStore, useStore } from 'ureact';

const cart = useStore(cartStore);
return <button onClick={() => cart.addItem('Item')}>Add</button>;`,
    _searchIndex: 'usestore createstore proxy store state sync external store'
  },
  {
    id: 'hook-use-local-store',
    type: 'hook',
    title: 'useLocalStore(initial)',
    subtitle: 'Deep reactive proxy store scoped locally to component instance',
    category: 'Core Reactivity',
    badge: 'Local State',
    badgeType: 'core',
    icon: <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />,
    hookSignature: 'const state = useLocalStore<T>(initialState);',
    hookSnippet: `import { useLocalStore } from 'ureact';

const form = useLocalStore({ name: 'Alex', dark: true });
// Mutate directly:
form.dark = false;`,
    _searchIndex: 'uselocalstore local store proxy state usestate'
  },
  {
    id: 'hook-signal',
    type: 'hook',
    title: 'signal(initialValue)',
    subtitle: 'Signals v2 fine-grained reactive primitive with automatic dependency tracking',
    category: 'Core Reactivity',
    badge: 'Signals v2',
    badgeType: 'core',
    icon: <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />,
    hookSignature: 'const count = signal<number>(0);',
    hookSnippet: `import { signal } from 'ureact';

const count = signal(0);
// Read: count.value or count.peek()
// Write: count.value++ or count.set(v => v + 1)`,
    _searchIndex: 'signal signals v2 reactivity primitive fine grained value peek'
  },
  {
    id: 'hook-computed',
    type: 'hook',
    title: 'computed(getter)',
    subtitle: 'Signals v2 lazily-evaluated memoized computed signal with auto-dependency tracking',
    category: 'Core Reactivity',
    badge: 'Signals v2',
    badgeType: 'core',
    icon: <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />,
    hookSignature: 'const double = computed(() => count.value * 2);',
    hookSnippet: `import { signal, computed } from 'ureact';

const count = signal(2);
const double = computed(() => count.value * 2);
console.log(double.value); // 4`,
    _searchIndex: 'computed memoized lazy signal derived dependency tracking'
  },
  {
    id: 'hook-create-signal-effect',
    type: 'hook',
    title: 'createSignalEffect(fn)',
    subtitle: 'Signals v2 reactive reaction runner that auto-subscribes to signals read inside it',
    category: 'Core Reactivity',
    badge: 'Signals v2',
    badgeType: 'core',
    icon: <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />,
    hookSignature: 'const cleanup = createSignalEffect(() => { console.log(count.value); });',
    hookSnippet: `import { createSignalEffect } from 'ureact';

const cleanup = createSignalEffect(() => {
  console.log('Count updated:', count.value);
});`,
    _searchIndex: 'createsignaleffect effect reaction auto subscribe signals v2'
  },
  {
    id: 'hook-use-signal',
    type: 'hook',
    title: 'useSignal(initialOrSignal)',
    subtitle: 'Consume or create a Signals v2 reactive signal directly in React JSX components',
    category: 'Core Reactivity',
    badge: 'Signals v2',
    badgeType: 'core',
    icon: <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />,
    hookSignature: 'const [val, setVal, signalInstance] = useSignal(initialValue | existingSignal);',
    hookSnippet: `import { useSignal } from 'ureact';

export function Counter() {
  const [count, setCount] = useSignal(0);
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}`,
    _searchIndex: 'usesignal signal scalar reactivity fine grained hook jsx'
  },
  {
    id: 'hook-use-computed',
    type: 'hook',
    title: 'useComputed(getter, deps?)',
    subtitle: 'Signals v2 React hook to subscribe component to a computed reactive value',
    category: 'Core Reactivity',
    badge: 'Signals v2',
    badgeType: 'core',
    icon: <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />,
    hookSignature: 'const result = useComputed(() => count.value * multiplier.value);',
    hookSnippet: `import { useComputed } from 'ureact';

const total = useComputed(() => items.value.reduce((a, b) => a + b.price, 0));`,
    _searchIndex: 'usecomputed computed memoized reactive signal hook'
  },
  {
    id: 'hook-use-query',
    type: 'hook',
    title: 'useQuery(key, fetcher, options)',
    subtitle: 'Built-in 1.8KB global SWR cache, deduplication, and window revalidation',
    category: 'Data Fetching',
    badge: 'SWR Cache',
    badgeType: 'core',
    icon: <Database size={16} style={{ color: 'var(--accent-indigo)' }} />,
    hookSignature: 'const { data, loading, error, refetch } = useQuery(key, fetcher, options?);',
    hookSnippet: `import { useQuery } from 'ureact';

const { data, loading } = useQuery('feed', fetchFeed, { staleTime: 10000 });`,
    _searchIndex: 'usequery swr cache data fetch request deduplication'
  },
  {
    id: 'hook-use-mutation',
    type: 'hook',
    title: 'useMutation(fn, options)',
    subtitle: 'Optimistic server mutations with automatic cache context rollback',
    category: 'Data Fetching',
    badge: 'Optimistic',
    badgeType: 'core',
    icon: <Database size={16} style={{ color: 'var(--accent-indigo)' }} />,
    hookSignature: 'const { mutate, loading, error } = useMutation(fn, options?);',
    hookSnippet: `import { useMutation, setQueryData } from 'ureact';

const { mutate } = useMutation(updateUser, {
  onMutate: (newVal) => setQueryData('user', newVal)
});`,
    _searchIndex: 'usemutation mutate optimistic rollback server action'
  },
  {
    id: 'hook-use-shortcut',
    type: 'hook',
    title: 'useShortcut(keys, handler, options)',
    subtitle: 'Declarative keyboard hotkeys (e.g. "mod+k", "ctrl+z", "escape")',
    category: 'Browser & DOM',
    badge: 'Hotkeys',
    badgeType: 'emerald',
    icon: <Keyboard size={16} style={{ color: 'var(--accent-emerald)' }} />,
    hookSignature: 'useShortcut(keys, handler, options?);',
    hookSnippet: `import { useShortcut } from 'ureact';

useShortcut('mod+k', (e) => {
  e.preventDefault();
  setIsOpen(prev => !prev);
});`,
    _searchIndex: 'useshortcut shortcut hotkeys keyboard mod k ctrl keybinding'
  },
  {
    id: 'hook-use-in-view',
    type: 'hook',
    title: 'useInView(options)',
    subtitle: 'Intersection Observer hook for viewport detection and lazy loading',
    category: 'Browser & DOM',
    badge: 'Observer',
    badgeType: 'emerald',
    icon: <Compass size={16} style={{ color: 'var(--accent-emerald)' }} />,
    hookSignature: 'const { ref, inView, entry } = useInView(options?);',
    hookSnippet: `import { useInView } from 'ureact';

const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
return <div ref={ref}>{inView ? <Content /> : <Skeleton />}</div>;`,
    _searchIndex: 'useinview intersection observer viewport scroll lazy animation'
  },
  {
    id: 'hook-use-query-param',
    type: 'hook',
    title: 'useQueryParam(key, defaultValue)',
    subtitle: 'Two-way reactive URL search parameter synchronization',
    category: 'Browser & DOM',
    badge: 'URL State',
    badgeType: 'emerald',
    icon: <Share2 size={16} style={{ color: 'var(--accent-emerald)' }} />,
    hookSignature: 'const [val, setVal] = useQueryParam(key, defaultValue);',
    hookSnippet: `import { useQueryParam } from 'ureact';

const [tab, setTab] = useQueryParam('tab', 'all');`,
    _searchIndex: 'usequeryparam query url search params browser history'
  },
  {
    id: 'hook-use-counter',
    type: 'hook',
    title: 'useCounter(initialValue?, options?)',
    subtitle: '1-line reactive numeric counter with step increments and clamp limits',
    category: '1-Line Helpers',
    badge: 'Helper',
    badgeType: 'emerald',
    icon: <Sliders size={16} style={{ color: 'var(--accent-emerald)' }} />,
    hookSignature: 'const counter = useCounter(initialValue?, options?);',
    hookSnippet: `import { useCounter } from 'ureact';

const qty = useCounter(1, { min: 1, max: 10 });
// qty.inc(), qty.dec(), qty.reset()`,
    _searchIndex: 'usecounter counter number numeric increment decrement'
  },
  {
    id: 'hook-use-array',
    type: 'hook',
    title: 'useArray(initialItems?)',
    subtitle: '1-line array state manager with built-in push, remove, and reset',
    category: '1-Line Helpers',
    badge: 'Helper',
    badgeType: 'emerald',
    icon: <Layers size={16} style={{ color: 'var(--accent-emerald)' }} />,
    hookSignature: 'const list = useArray<T>(initialItems?);',
    hookSnippet: `import { useArray } from 'ureact';

const tags = useArray(['React 19', 'uReact']);
// tags.push('TypeScript'), tags.remove(idx)`,
    _searchIndex: 'usearray array list items push remove collection state'
  },
  {
    id: 'hook-use-mount',
    type: 'hook',
    title: 'useMount(fn)',
    subtitle: 'Executes strictly once on mount. Zero [] empty dependency array traps',
    category: 'Lifecycles',
    badge: 'Lifecycle',
    badgeType: 'emerald',
    icon: <Clock size={16} style={{ color: 'var(--accent-emerald)' }} />,
    hookSignature: 'useMount(() => { ... });',
    hookSnippet: `import { useMount } from 'ureact';

useMount(() => {
  analytics.logPageView();
});`,
    _searchIndex: 'usemount mount useeffect onmount lifecycle'
  },
  {
    id: 'hook-use-unmount',
    type: 'hook',
    title: 'useUnmount(fn)',
    subtitle: 'Dedicated teardown callback executed strictly on unmount',
    category: 'Lifecycles',
    badge: 'Lifecycle',
    badgeType: 'emerald',
    icon: <Clock size={16} style={{ color: 'var(--accent-emerald)' }} />,
    hookSignature: 'useUnmount(() => { ... });',
    hookSnippet: `import { useUnmount } from 'ureact';

useUnmount(() => {
  socket.disconnect();
});`,
    _searchIndex: 'useunmount unmount cleanup teardown lifecycle'
  },
  {
    id: 'hook-use-watch',
    type: 'hook',
    title: 'useWatch(fn, deps, options)',
    subtitle: 'Smart watcher providing both previous and current dependency values',
    category: 'Lifecycles',
    badge: 'Watcher',
    badgeType: 'emerald',
    icon: <Clock size={16} style={{ color: 'var(--accent-emerald)' }} />,
    hookSignature: 'useWatch(([curr], [prev]) => { ... }, [deps]);',
    hookSnippet: `import { useWatch } from 'ureact';

useWatch(([currPrice], [prevPrice]) => {
  console.log('Price changed:', prevPrice, '->', currPrice);
}, [price]);`,
    _searchIndex: 'usewatch watch watcher previous next dependencies effect'
  }
];

export function ShortcutMenuModal({
  isOpen,
  onClose,
  onSelectPage,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  theme = 'light',
  onToggleTheme,
  currentVersion = '2.2.0-next',
  onSelectVersion,
  onOpenRoadmap
}: ShortcutMenuModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeScope, setActiveScope] = useState<'all' | 'docs' | 'hooks' | 'actions'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentItems, setRecentItems] = useState<RecentSearchEntry[]>([]);

  // Performance Optimization: Defer query filtering to keep typing 120fps smooth
  const deferredSearch = useDeferred(searchTerm, '');

  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load bounded recent history (Max 6) on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ureact_recent_palette');
      if (saved) {
        setRecentItems(JSON.parse(saved).slice(0, 6));
      }
    } catch {
      // Ignore storage errors safely
    }
  }, [isOpen]);

  const saveRecentItem = useCallback((item: PaletteItem) => {
    try {
      const entry: RecentSearchEntry = {
        id: item.id,
        title: item.title,
        type: item.type,
        timestamp: 'Just now'
      };
      setRecentItems((prev) => {
        const filtered = prev.filter((p) => p.id !== item.id);
        const next = [entry, ...filtered].slice(0, 6);
        localStorage.setItem('ureact_recent_palette', JSON.stringify(next));
        return next;
      });
    } catch {
      // Ignore storage errors
    }
  }, []);

  const clearRecentHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentItems([]);
    try {
      localStorage.removeItem('ureact_recent_palette');
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Focus on open & reset state
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close modal on Escape
  useShortcut('escape', () => {
    if (isOpen) onClose();
  }, { enabled: isOpen });

  // Developer Quick Actions
  const devActions = useMemo(() => [
    {
      id: 'action-toggle-theme',
      type: 'action' as PaletteItemType,
      title: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: `Toggle UI appearance (Currently: ${theme.toUpperCase()})`,
      category: 'Developer Tools',
      badge: 'Theme',
      badgeType: 'action' as const,
      icon: theme === 'dark' ? <Sun size={16} style={{ color: '#fbbf24' }} /> : <Moon size={16} style={{ color: 'var(--accent-indigo)' }} />,
      shortcut: ['Ctrl', 'T'],
      action: () => {
        onToggleTheme?.();
        showToast(`Theme switched to ${theme === 'dark' ? 'Light' : 'Dark'} mode!`);
      },
      _searchIndex: 'theme toggle light dark mode appearance switch'
    },
    {
      id: 'action-undo',
      type: 'action' as PaletteItemType,
      title: 'Undo Last Mutation (Time-Travel)',
      subtitle: canUndo ? 'Revert last reactive state mutation' : 'No state mutations to undo',
      category: 'Time-Travel',
      badge: 'History',
      badgeType: 'action' as const,
      icon: <Undo2 size={16} style={{ color: canUndo ? 'var(--accent-cyan)' : 'var(--text-dim)' }} />,
      shortcut: ['Ctrl', 'Z'],
      action: () => {
        if (canUndo) {
          onUndo?.();
          showToast('Undid state mutation');
        }
      },
      _searchIndex: 'undo time travel history revert state mutation'
    },
    {
      id: 'action-redo',
      type: 'action' as PaletteItemType,
      title: 'Redo Mutation (Time-Travel)',
      subtitle: canRedo ? 'Re-apply next reactive state mutation' : 'No state mutations to redo',
      category: 'Time-Travel',
      badge: 'History',
      badgeType: 'action' as const,
      icon: <Redo2 size={16} style={{ color: canRedo ? 'var(--accent-cyan)' : 'var(--text-dim)' }} />,
      shortcut: ['Ctrl', 'Y'],
      action: () => {
        if (canRedo) {
          onRedo?.();
          showToast('Redid state mutation');
        }
      },
      _searchIndex: 'redo time travel history advance state mutation'
    },
    {
      id: 'action-copy-url',
      type: 'action' as PaletteItemType,
      title: 'Copy Current Page URL',
      subtitle: 'Copy full browser address to clipboard',
      category: 'Developer Tools',
      badge: 'Link',
      badgeType: 'action' as const,
      icon: <Share2 size={16} style={{ color: 'var(--accent-cyan)' }} />,
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Page URL copied to clipboard!');
      },
      _searchIndex: 'copy link url share address clipboard'
    },
    {
      id: 'action-github',
      type: 'action' as PaletteItemType,
      title: 'View React 19 on GitHub',
      subtitle: 'Official facebook/react repository & changelog',
      category: 'External Resources',
      badge: 'GitHub',
      badgeType: 'action' as const,
      icon: <ExternalLink size={16} style={{ color: 'var(--text-dim)' }} />,
      action: () => {
        window.open('https://github.com/facebook/react', '_blank');
      },
      _searchIndex: 'github repo source react 19 external link'
    },
    {
      id: 'action-open-playground',
      type: 'action' as PaletteItemType,
      title: 'Open Interactive Live Playground',
      subtitle: 'In-browser editable code sandbox with live state inspection',
      category: 'Developer Tools',
      badge: 'Playground',
      badgeType: 'action' as const,
      icon: <Code2 size={16} style={{ color: 'var(--accent-cyan)' }} />,
      action: () => {
        onSelectPage('playground');
        onClose();
      },
      _searchIndex: 'playground live sandbox run interactive code editor'
    },
    {
      id: 'action-open-roadmap',
      type: 'action' as PaletteItemType,
      title: "What's New in v2.2.0 Roadmap & Releases",
      subtitle: 'Signals v2, Live Sandbox, React 19 ActionForm, and v3.0 RFCs',
      category: 'Releases & Versions',
      badge: 'Roadmap',
      badgeType: 'action' as const,
      icon: <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />,
      action: () => {
        onOpenRoadmap?.();
        onClose();
      },
      _searchIndex: 'roadmap changelog releases next version v2.2 v3.0 rfcs'
    },
    {
      id: 'action-switch-next',
      type: 'action' as PaletteItemType,
      title: 'Switch Channel: v2.2.0-next (Canary)',
      subtitle: 'Active: Signals v2, Live Sandbox, React 19 Actions',
      category: 'Releases & Versions',
      badge: 'Canary',
      badgeType: 'action' as const,
      icon: <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />,
      action: () => {
        onSelectVersion?.('2.2.0-next');
        showToast('Switched documentation channel to v2.2.0-next');
      },
      _searchIndex: 'version channel switch v2.2 next canary'
    },
    {
      id: 'action-switch-stable',
      type: 'action' as PaletteItemType,
      title: 'Switch Channel: v2.1.0 (Stable)',
      subtitle: 'Active: Concurrent proxy store, $bind, SWR cache',
      category: 'Releases & Versions',
      badge: 'Stable',
      badgeType: 'action' as const,
      icon: <Package size={16} style={{ color: '#22c55e' }} />,
      action: () => {
        onSelectVersion?.('2.1.0');
        showToast('Switched documentation channel to v2.1.0');
      },
      _searchIndex: 'version channel switch v2.1 stable production'
    },
    {
      id: 'action-copy-install',
      type: 'action' as PaletteItemType,
      title: 'Copy Install Command: npm i ureact@next',
      subtitle: 'Quickly install the latest v2.2.0 Canary build with Signals v2',
      category: 'Developer Tools',
      badge: 'NPM',
      badgeType: 'action' as const,
      icon: <Terminal size={16} style={{ color: 'var(--accent-cyan)' }} />,
      action: () => {
        navigator.clipboard.writeText('npm i ureact@next');
        showToast('Copied: npm i ureact@next');
      },
      _searchIndex: 'npm install command ureact@next terminal copy'
    }
  ], [theme, canUndo, canRedo, onToggleTheme, onUndo, onRedo, onSelectPage, onClose, onOpenRoadmap, onSelectVersion]);

  // Transform Docs into PaletteItems
  const docItems: PaletteItem[] = useMemo(() => {
    return ALL_DOC_PAGES.map((doc) => ({
      id: `doc-${doc.id}`,
      type: 'doc',
      title: doc.title,
      subtitle: doc.description,
      category: 'Documentation Pages',
      badge: doc.badge,
      badgeType: doc.badgeType === 'react19' ? 'react19' : 'core',
      icon: <BookOpen size={16} style={{ color: 'var(--accent-cyan)' }} />,
      docPath: doc.path,
      toc: doc.toc,
      action: () => {
        onSelectPage(doc.id);
        onClose();
      },
      _searchIndex: `${doc.title} ${doc.description} ${doc.id} ${doc.badge || ''}`.toLowerCase()
    }));
  }, [onSelectPage, onClose]);

  // Combined searchable catalogue
  const allPaletteItems: PaletteItem[] = useMemo(() => {
    const hooks: PaletteItem[] = PALETTE_HOOKS.map((h) => ({
      ...h,
      action: () => {
        onSelectPage('hooks-reference');
        onClose();
      }
    }));

    return [...docItems, ...hooks, ...devActions];
  }, [docItems, devActions, onSelectPage, onClose]);

  // Handle prefix scope triggers: typing "@hooks", "@docs", ">"
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);

    const lower = val.toLowerCase();
    if (lower.startsWith('@hooks') || lower.startsWith('@hook ')) {
      setActiveScope('hooks');
    } else if (lower.startsWith('@docs') || lower.startsWith('@doc ')) {
      setActiveScope('docs');
    } else if (lower.startsWith('>') || lower.startsWith('@cmd ')) {
      setActiveScope('actions');
    }
  };

  // Filter items using deferredSearch for high typing performance
  const filteredItems = useMemo(() => {
    let list = allPaletteItems;

    if (activeScope === 'docs') list = list.filter((i) => i.type === 'doc');
    if (activeScope === 'hooks') list = list.filter((i) => i.type === 'hook');
    if (activeScope === 'actions') list = list.filter((i) => i.type === 'action');

    const rawClean = deferredSearch.replace(/^(@hooks|@hook|@docs|@doc|>|@cmd)\s*/i, '').trim();
    const clean = rawClean.toLowerCase();

    // Command Palette v3.0: Instant Live Expression Evaluator (e.g. "= 2 + 2", "128 * 4", "calc 100/5")
    let evalItem: PaletteItem | null = null;
    if (
      rawClean.startsWith('=') ||
      rawClean.startsWith('calc ') ||
      (/^[\d\.\s\+\-\*\/\%\(\)]+$/.test(rawClean) && /[\+\-\*\/]/.test(rawClean))
    ) {
      try {
        const expr = rawClean.replace(/^(=|calc\s*)/i, '').trim();
        if (/^[\d\.\s\+\-\*\/\%\(\)]+$/.test(expr)) {
          // eslint-disable-next-line no-new-func
          const result = Function(`"use strict"; return (${expr})`)();
          if (typeof result === 'number' && !isNaN(result)) {
            evalItem = {
              id: 'action-live-calc',
              type: 'action',
              title: `${expr} = ${result}`,
              subtitle: 'Computed live in-browser. Press Enter to copy value to clipboard.',
              category: 'Live Evaluator',
              badge: 'Calculator',
              badgeType: 'action',
              icon: <Cpu size={16} style={{ color: 'var(--accent-cyan)' }} />,
              action: () => {
                navigator.clipboard.writeText(String(result));
                showToast(`Copied result: ${result}`);
              },
              _searchIndex: `${clean} calc eval calculate math`
            };
          }
        }
      } catch {
        // Ignore math eval errors
      }
    }

    if (!clean) return list;

    const matched = list.filter((item) => item._searchIndex.includes(clean));
    return evalItem ? [evalItem, ...matched] : matched;
  }, [allPaletteItems, activeScope, deferredSearch]);

  // Ensure selectedIndex stays valid when list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length, activeScope]);

  const selectedItem = filteredItems[selectedIndex] || filteredItems[0];

  // Keyboard navigation handler for ArrowUp, ArrowDown, Enter, Ctrl+C
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredItems.length === 0) return;

    // Ctrl+C / Cmd+C hotkey to copy code snippet of selected hook or page link
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      if (selectedItem?.hookSnippet) {
        e.preventDefault();
        navigator.clipboard.writeText(selectedItem.hookSnippet);
        showToast('Code snippet copied to clipboard!');
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = (prev + 1) % filteredItems.length;
        itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = (prev - 1 + filteredItems.length) % filteredItems.length;
        itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) {
        saveRecentItem(current);
        current.action();
      }
    }
  };

  const handleCopySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    showToast('Code snippet copied!');
  };

  if (!isOpen) return null;

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Search Bar Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--accent-cyan-bg)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Keyboard size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>uReact Command Palette &amp; Search</span>
                  <span style={{ fontSize: '0.66rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--accent-cyan-bg)', color: 'var(--accent-cyan)', border: '1px solid var(--border-subtle)', fontWeight: 700 }}>
                    v2.0
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Search 19+ hooks, documentation pages, or type <code>@hook</code>, <code>@doc</code>, <code>&gt;</code> for scope
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="chip-btn"
              style={{
                padding: '6px',
                borderRadius: '6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Input with Keyboard Indicator */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-dim)' }} />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search hooks (e.g. useAction), pages, or commands..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                background: 'var(--bg-primary)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: '10px',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                boxShadow: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-cyan)';
                e.target.style.boxShadow = '0 0 0 3px var(--accent-cyan-bg)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-subtle)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Scope Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              className={`palette-tag-chip ${activeScope === 'all' ? 'active' : ''}`}
              onClick={() => setActiveScope('all')}
            >
              All Results ({allPaletteItems.length})
            </button>
            <button
              className={`palette-tag-chip ${activeScope === 'hooks' ? 'active' : ''}`}
              onClick={() => setActiveScope('hooks')}
            >
              🪝 Hooks API ({PALETTE_HOOKS.length})
            </button>
            <button
              className={`palette-tag-chip ${activeScope === 'docs' ? 'active' : ''}`}
              onClick={() => setActiveScope('docs')}
            >
              📖 Documentation ({docItems.length})
            </button>
            <button
              className={`palette-tag-chip ${activeScope === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveScope('actions')}
            >
              ⚙️ Commands ({devActions.length})
            </button>
          </div>
        </div>

        {/* Split View: Results List (Left) + Rich Preview Pane (Right) */}
        <div className="palette-split-view">
          {/* Left: Interactive Navigable Items List */}
          <div className="palette-list-pane">
            {/* Recent History Section when search is empty */}
            {!searchTerm.trim() && recentItems.length > 0 && activeScope === 'all' && (
              <div style={{ marginBottom: '12px' }}>
                <div className="palette-history-header">
                  <span>Recent Visited</span>
                  <button
                    onClick={clearRecentHistory}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                    title="Clear history"
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '0 4px 6px' }}>
                  {recentItems.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        const target = allPaletteItems.find((p) => p.id === r.id);
                        if (target) {
                          saveRecentItem(target);
                          target.action();
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Clock size={11} style={{ color: 'var(--accent-cyan)' }} />
                      <span>{r.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredItems.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Search size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>No results found for "{searchTerm}"</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Try searching for <code>useAction</code>, <code>useStore</code>, or <code>Quickstart</code>.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      ref={(el) => { itemRefs.current[idx] = el; }}
                      className={`palette-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        saveRecentItem(item);
                        item.action();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                          {item.icon}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            <HighlightMatch text={item.title} query={deferredSearch.replace(/^(@hooks|@hook|@docs|@doc|>|@cmd)\s*/i, '')} />
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: '0.66rem',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              background:
                                item.badgeType === 'react19'
                                  ? 'var(--callout-react19-bg)'
                                  : item.badgeType === 'action'
                                  ? 'var(--bg-secondary)'
                                  : 'var(--accent-cyan-bg)',
                              color:
                                item.badgeType === 'react19'
                                  ? 'var(--accent-amber)'
                                  : item.badgeType === 'action'
                                  ? 'var(--text-muted)'
                                  : 'var(--accent-cyan)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            {item.badge}
                          </span>
                        )}

                        {item.shortcut && (
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {item.shortcut.map((k) => (
                              <kbd
                                key={k}
                                style={{
                                  padding: '1px 5px',
                                  background: 'var(--bg-secondary)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: '3px',
                                  fontSize: '0.68rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--text-dim)'
                                }}
                              >
                                {k}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Raycast-Style Rich Preview Pane */}
          <div className="palette-preview-pane">
            {selectedItem ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header Badge & Category */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {selectedItem.category}
                  </span>
                  {selectedItem.badge && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        background: 'var(--accent-cyan-bg)',
                        color: 'var(--accent-cyan)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {selectedItem.badge}
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                  {selectedItem.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  {selectedItem.subtitle}
                </p>

                {/* Hook-Specific Preview: Signature & Code Snippet */}
                {selectedItem.type === 'hook' && selectedItem.hookSnippet && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        Quick Snippet:
                      </span>
                      <button
                        onClick={() => handleCopySnippet(selectedItem.hookSnippet!)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-dim)',
                          fontSize: '0.74rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Copy Code (Ctrl+C)"
                      >
                        <Copy size={12} />
                        <span>Copy Code</span>
                      </button>
                    </div>

                    <pre
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--code-text)',
                        margin: 0,
                        overflowX: 'auto',
                        lineHeight: 1.5
                      }}
                    >
                      <code>{selectedItem.hookSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Doc-Specific Preview: Table of Contents outline */}
                {selectedItem.type === 'doc' && selectedItem.toc && selectedItem.toc.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Page Outline:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedItem.toc.slice(0, 4).map((t) => (
                        <div
                          key={t.id}
                          style={{
                            fontSize: '0.76rem',
                            color: 'var(--text-muted)',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {t.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Primary Action Button */}
                <div style={{ marginTop: 'auto', paddingTop: '14px' }}>
                  <button
                    onClick={() => {
                      saveRecentItem(selectedItem);
                      selectedItem.action();
                    }}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>
                      {selectedItem.type === 'doc' ? 'Open Documentation Page' : selectedItem.type === 'hook' ? 'View Hook in Reference' : 'Execute Command'}
                    </span>
                    <kbd style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(0,0,0,0.2)' }}>↵ Enter</kbd>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                Select an item to view preview
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Keyboard Legend */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span><kbd style={{ padding: '2px 5px', borderRadius: '3px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>↑</kbd> <kbd style={{ padding: '2px 5px', borderRadius: '3px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>↓</kbd> Navigate</span>
            <span><kbd style={{ padding: '2px 5px', borderRadius: '3px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>↵</kbd> Select</span>
            <span><kbd style={{ padding: '2px 5px', borderRadius: '3px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>Ctrl+C</kbd> Copy Code</span>
            <span><kbd style={{ padding: '2px 5px', borderRadius: '3px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>Esc</kbd> Close</span>
          </div>

          <div>
            Powered by <strong style={{ color: 'var(--text-main)' }}>uReact v2.2.0-next Engine</strong>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="palette-toast">
            <Check size={14} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
