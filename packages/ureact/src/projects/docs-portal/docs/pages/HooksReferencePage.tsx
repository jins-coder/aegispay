import React, { useState, useMemo, useEffect } from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';
import { HookUsageModal, HookUsageModalData } from '../../components/HookUsageModal';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  Code2,
  FileText,
  Search,
  Zap,
  Filter,
  ArrowRight,
  RotateCcw,
  Maximize2,
  ExternalLink
} from 'lucide-react';


export interface HookParameter {
  name: string;
  type: string;
  description: string;
}

export interface DetailedHookItem {
  id: string;
  name: string;
  shortName: string;
  category: 'React 19 Native' | 'Core Reactive State' | 'Lifecycles' | 'Data Fetching' | 'Browser & DOM' | '1-Line Primitives';
  section: 'react19' | 'reactivity' | 'utility';
  badge?: string;
  badgeType?: 'react19' | 'core' | 'emerald' | 'amber';
  returns: string;
  signature: string;
  description: string;
  whyBetter: string;
  parameters: HookParameter[];
  example: string;
}

const ALL_HOOK_ITEMS: DetailedHookItem[] = [
  // ==========================================
  // Section 2: React 19 Native Primitives
  // ==========================================
  {
    id: 'use-action',
    name: 'useAction(actionFn, initialData, options?)',
    shortName: 'useAction',
    category: 'React 19 Native',
    section: 'react19',
    badge: 'React 19 Native',
    badgeType: 'react19',
    returns: '{ data, isPending, error, run, formAction, reset }',
    signature: 'const action = useAction<TInput, TState>(actionFn, initialData, options?);',
    description: 'Combines React 19 useActionState and useOptimistic into a unified, type-safe mutation primitive with automatic rollback.',
    whyBetter: 'Eliminates separate optimistic hook boilerplate and manual try/catch state resets. Works seamlessly with both standard buttons and <form action={...}>.',
    parameters: [
      { name: 'actionFn', type: '(prev: TState, input: TInput) => Promise<TState>', description: 'The asynchronous server action function to execute.' },
      { name: 'initialData', type: 'TState', description: 'Initial state value rendered before any action runs.' },
      { name: 'options.optimisticUpdate', type: '(prev: TState, input: TInput) => TState', description: 'Optional immediate optimistic state calculator before the action settles.' }
    ],
    example: `import { useAction } from 'ureact';

export function CommentSystem() {
  // Combines React 19 useActionState + useOptimistic in 1 hook
  const action = useAction<string, string[]>(
    async (prev, newComment) => {
      const saved = await api.postComment(newComment);
      return [...prev, saved];
    },
    ['First comment!'],
    {
      // Instant React 19 optimistic feedback
      optimisticUpdate: (prev, newComment) => [...prev, \`\${newComment} (optimistic)\`]
    }
  );

  return (
    <div>
      <form action={(formData) => action.run(formData.get('text') as string)}>
        <input name="text" placeholder="Write a comment..." required />
        <button disabled={action.isPending}>
          {action.isPending ? 'Saving...' : 'Post Comment'}
        </button>
      </form>

      <ul>
        {action.data.map((comment, idx) => (
          <li key={idx}>{comment}</li>
        ))}
      </ul>
    </div>
  );
}`
  },
  {
    id: 'use-action-status',
    name: 'useActionStatus()',
    shortName: 'useActionStatus',
    category: 'React 19 Native',
    section: 'react19',
    badge: 'React 19 Form',
    badgeType: 'react19',
    returns: '{ pending: boolean, data: FormData | null, method: string | null, action: any }',
    signature: 'const { pending, data, method, action } = useActionStatus();',
    description: 'Safe wrapper around react-dom useFormStatus that provides parent form action status without throwing errors when rendered outside a form.',
    whyBetter: 'Standard React 19 useFormStatus throws an exception outside <form> contexts. useActionStatus returns safe fallback defaults.',
    parameters: [],
    example: `import { useActionStatus } from 'ureact';

// Child component rendered anywhere deep inside a <form>
export function SaveButton() {
  const { pending } = useActionStatus();

  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? '⏳ Action Transitioning...' : 'Save Changes'}
    </button>
  );
}`
  },
  {
    id: 'use-form-reset',
    name: 'useFormReset()',
    shortName: 'useFormReset',
    category: 'React 19 Native',
    section: 'react19',
    badge: 'React 19 Native',
    badgeType: 'react19',
    returns: '(formElement: HTMLFormElement) => void',
    signature: 'const resetForm = useFormReset();',
    description: 'Triggers React 19 native requestFormReset to flush form inputs and uncontrolled fields safely without clobbering controlled states.',
    whyBetter: 'Standard HTML form.reset() ignores React internal reconciliation. requestFormReset dispatches native React 19 reset event listeners.',
    parameters: [],
    example: `import { useFormReset } from 'ureact';

export function MessageForm() {
  const resetForm = useFormReset();

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await api.sendMessage(new FormData(e.currentTarget));
    
    // Safely resets form fields using React 19 requestFormReset
    resetForm(e.currentTarget);
  };

  return (
    <form onSubmit={handleSend}>
      <input name="subject" placeholder="Subject" required />
      <textarea name="body" placeholder="Your message..." required />
      <button type="submit">Send Message</button>
    </form>
  );
}`
  },
  {
    id: 'use-action-transition',
    name: 'useActionTransition()',
    shortName: 'useActionTransition',
    category: 'React 19 Native',
    section: 'react19',
    badge: 'Concurrent',
    badgeType: 'react19',
    returns: '{ run, isPending, error, startTransition }',
    signature: 'const { run, isPending, error } = useActionTransition();',
    description: 'Executes async transitions in React 19 background concurrent lanes with automatic error boundary capture.',
    whyBetter: 'Standard React 18 useTransition required synchronous updates. React 19 accepts async functions, and uReact adds automatic error tracking.',
    parameters: [
      { name: 'asyncFn', type: '() => Promise<void>', description: 'Asynchronous transition callback executed inside React 19 transition lane.' }
    ],
    example: `import { useState } from 'react';
import { useActionTransition } from 'ureact';

export function TabNavigation() {
  const [activeTab, setActiveTab] = useState('home');
  const transition = useActionTransition();

  const handleSwitchTab = (tabId: string) => {
    // Executes in React 19 concurrent transition lane
    transition.run(async () => {
      await preloadTabContent(tabId);
      setActiveTab(tabId);
    });
  };

  return (
    <div>
      <button 
        onClick={() => handleSwitchTab('settings')} 
        disabled={transition.isPending}
      >
        {transition.isPending ? 'Switching...' : 'Settings'}
      </button>
      {transition.error && <p>Error: {transition.error.message}</p>}
    </div>
  );
}`
  },
  {
    id: 'use-deferred',
    name: 'useDeferred(value, initialValue?)',
    shortName: 'useDeferred',
    category: 'React 19 Native',
    section: 'react19',
    badge: 'Concurrent',
    badgeType: 'react19',
    returns: 'T',
    signature: 'const deferredValue = useDeferred<T>(value, initialValue?);',
    description: 'Defers updating secondary UI components during high-frequency input. Supports React 19 initialValue fallback to avoid blank renders.',
    whyBetter: 'Eliminates blank layout shifts on initial mount while preventing typing stutter during heavy list filter computations.',
    parameters: [
      { name: 'value', type: 'T', description: 'The dynamic input value to defer during main thread contention.' },
      { name: 'initialValue', type: 'T (optional)', description: 'React 19 fallback value rendered immediately on initial component mount.' }
    ],
    example: `import { useState } from 'react';
import { useDeferred } from 'ureact';

export function FilterableUserList() {
  const [query, setQuery] = useState('');
  
  // React 19 initialValue ensures instant fallback rendering on mount
  const deferredQuery = useDeferred(query, 'Default query');

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="Type to filter..." 
      />
      <HeavyFilteredGrid filter={deferredQuery} />
    </div>
  );
}`
  },
  {
    id: 'use-promise',
    name: 'usePromise(promise)',
    shortName: 'usePromise',
    category: 'React 19 Native',
    section: 'react19',
    badge: 'React 19 Suspense',
    badgeType: 'react19',
    returns: 'T',
    signature: 'const data = usePromise<T>(promise);',
    description: 'Directly unwraps promises inside render functions using React 19 use(Promise) API inside Suspense boundaries.',
    whyBetter: 'Zero useEffect or useState data fetching boilerplate. Can be called conditionally inside if-statements and loops.',
    parameters: [
      { name: 'promise', type: 'Promise<T>', description: 'The pending or fulfilled promise to unwrap synchronously in render.' }
    ],
    example: `import { Suspense } from 'react';
import { usePromise } from 'ureact';

interface User {
  name: string;
  role: string;
}

function UserCard({ userPromise }: { userPromise: Promise<User> }) {
  // React 19 use(Promise) unwraps directly during render!
  const user = usePromise(userPromise);

  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.role}</p>
    </div>
  );
}

export function App() {
  const promise = fetchUser();

  return (
    <Suspense fallback={<div>Loading profile via React 19 use()...</div>}>
      <UserCard userPromise={promise} />
    </Suspense>
  );
}`
  },

  // ==========================================
  // Section 3: Core Reactivity & State Hooks
  // ==========================================
  {
    id: 'use-store',
    name: 'useStore(store)',
    shortName: 'useStore',
    category: 'Core Reactive State',
    section: 'reactivity',
    badge: 'Proxy Store',
    badgeType: 'core',
    returns: 'T',
    signature: 'const state = useStore(store);',
    description: 'Subscribes a component to an external createStore() using React 18/19 useSyncExternalStore for tearing-free rendering.',
    whyBetter: 'Mutate objects directly: state.user.name = "Alex" or state.items.push(item). Zero setter callbacks, zero spread operators.',
    parameters: [
      { name: 'store', type: 'Store<T>', description: 'Reactive store created via createStore().' }
    ],
    example: `import { createStore, useStore } from 'ureact';

// 1. Define external store with methods & state
export const shopStore = createStore({
  items: ['Keyboard', 'Mouse'],
  addItem(name: string) {
    this.items.push(name);
  },
  get count(): number {
    return this.items.length;
  }
});

// 2. Subscribe in component with direct proxy access
export function ShoppingCart() {
  const shop = useStore(shopStore);

  return (
    <div>
      <h3>Cart Items ({shop.count})</h3>
      <button onClick={() => shop.addItem('USB-C Hub')}>+ Add Item</button>
      <ul>
        {shop.items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}`
  },
  {
    id: 'use-local-store',
    name: 'useLocalStore(initialState)',
    shortName: 'useLocalStore',
    category: 'Core Reactive State',
    section: 'reactivity',
    badge: 'Component State',
    badgeType: 'core',
    returns: 'T',
    signature: 'const state = useLocalStore<T>(initialState);',
    description: 'Creates a deep reactive proxy store scoped locally to the component instance. Completely replaces multi-useState setups.',
    whyBetter: 'No setter boilerplate. Eliminates nested immutability gymnastics: state.settings.theme = "dark" works instantly.',
    parameters: [
      { name: 'initialState', type: 'T', description: 'Initial state object with nested properties or arrays.' }
    ],
    example: `import { useLocalStore } from 'ureact';

export function EditProfile() {
  // Deep reactive local state with single declaration
  const state = useLocalStore({
    name: 'Alex Johnson',
    contact: { email: 'alex@example.com', phone: '+1 555-0199' },
    notifications: { email: true, push: false }
  });

  return (
    <form>
      <input
        value={state.name}
        onChange={(e) => { state.name = e.target.value; }}
      />
      <input
        value={state.contact.email}
        onChange={(e) => { state.contact.email = e.target.value; }}
      />
      <label>
        <input
          type="checkbox"
          checked={state.notifications.email}
          onChange={(e) => { state.notifications.email = e.target.checked; }}
        />
        Email notifications
      </label>
    </form>
  );
}`
  },
  {
    id: 'use-signal',
    name: 'useSignal(signal)',
    shortName: 'useSignal',
    category: 'Core Reactive State',
    section: 'reactivity',
    badge: 'Fine-grained',
    badgeType: 'core',
    returns: '[value, setValue, signal]',
    signature: 'const [value, setValue, signal] = useSignal<T>(scalarSignal);',
    description: 'Lightweight reactive scalar primitive with direct get/set. Perfect for standalone counters, flags, and toggles.',
    whyBetter: 'Fine-grained reactivity with zero store setup ceremony. Can be exported globally or declared inside a component.',
    parameters: [
      { name: 'signal', type: 'Signal<T>', description: 'Scalar signal created via signal(initialValue).' }
    ],
    example: `import { signal, useSignal } from 'ureact';

// Module-level shared scalar signal
const themeSignal = signal<'light' | 'dark'>('dark');

export function ThemeSwitcher() {
  const [theme, setTheme] = useSignal(themeSignal);

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Current Theme: {theme} (Click to toggle)
    </button>
  );
}`
  },

  // ==========================================
  // Section 4: Lifecycle, SWR & Browser Hooks
  // ==========================================
  {
    id: 'use-mount',
    name: 'useMount(fn)',
    shortName: 'useMount',
    category: 'Lifecycles',
    section: 'utility',
    badge: 'Lifecycle',
    badgeType: 'emerald',
    returns: 'void',
    signature: 'useMount(effectFn);',
    description: 'Executes a callback strictly once when the component mounts. Replaces useEffect(fn, []).',
    whyBetter: 'Zero empty dependency array [] traps. Immune to missing dependency ESLint errors.',
    parameters: [
      { name: 'fn', type: '() => void', description: 'Callback executed once on initial mount.' }
    ],
    example: `import { useMount } from 'ureact';

export function AnalyticsTracker({ pageId }: { pageId: string }) {
  useMount(() => {
    // Guaranteed to execute strictly once on mount
    analytics.logPageView(pageId);
    console.log('Component mounted successfully');
  });

  return <div>Tracking active for {pageId}</div>;
}`
  },
  {
    id: 'use-unmount',
    name: 'useUnmount(fn)',
    shortName: 'useUnmount',
    category: 'Lifecycles',
    section: 'utility',
    badge: 'Lifecycle',
    badgeType: 'emerald',
    returns: 'void',
    signature: 'useUnmount(teardownFn);',
    description: 'Executes a teardown callback strictly when the component unmounts.',
    whyBetter: 'Eliminates messy return () => { cleanup } functions inside useEffect.',
    parameters: [
      { name: 'fn', type: '() => void', description: 'Teardown callback executed during unmount phase.' }
    ],
    example: `import { useUnmount } from 'ureact';

export function RealtimeSocket({ channel }: { channel: string }) {
  const socket = connectChannel(channel);

  // Dedicated unmount teardown
  useUnmount(() => {
    socket.disconnect();
    console.log('Socket closed cleanly');
  });

  return <div>Channel: {channel} (Connected)</div>;
}`
  },
  {
    id: 'use-watch',
    name: 'useWatch(fn, deps, options?)',
    shortName: 'useWatch',
    category: 'Lifecycles',
    section: 'utility',
    badge: 'Smart Watcher',
    badgeType: 'emerald',
    returns: 'void',
    signature: 'useWatch((curr, prev) => { ... }, [deps], options?);',
    description: 'Watches dependencies and passes both current and previous values to the callback.',
    whyBetter: 'Native useEffect does not provide previous dependency values without manual useRef bookkeeping.',
    parameters: [
      { name: 'fn', type: '(currentValues, previousValues) => void', description: 'Watcher callback receiving current and previous values.' },
      { name: 'deps', type: 'any[]', description: 'Array of reactive dependencies to track.' },
      { name: 'options.immediate', type: 'boolean (optional)', description: 'Run callback immediately on mount (default: false).' }
    ],
    example: `import { useState } from 'react';
import { useWatch } from 'ureact';

export function StockPrice({ price }: { price: number }) {
  useWatch(
    ([currPrice], [prevPrice]) => {
      if (currPrice > prevPrice) {
        console.log(\`Price rose from \${prevPrice} to \${currPrice}!\`);
      }
    },
    [price]
  );

  return <div>Live Price: \${price}</div>;
}`
  },
  {
    id: 'use-query',
    name: 'useQuery(key, fetcher, options?)',
    shortName: 'useQuery',
    category: 'Data Fetching',
    section: 'utility',
    badge: 'SWR Engine',
    badgeType: 'core',
    returns: '{ data, loading, error, refetch }',
    signature: 'const { data, loading, error, refetch } = useQuery<T>(key, fetcher, options?);',
    description: 'Built-in 1.8KB global SWR cache with automatic request deduplication and window re-focus revalidation.',
    whyBetter: 'Built directly into uReact — zero external 15KB dependencies like react-query needed for standard applications.',
    parameters: [
      { name: 'key', type: 'string | any[]', description: 'Unique cache key identifying the resource.' },
      { name: 'fetcher', type: '() => Promise<T>', description: 'Async function that retrieves the data.' },
      { name: 'options.staleTime', type: 'number (optional)', description: 'Time in ms before cached data is considered stale.' }
    ],
    example: `import { useQuery } from 'ureact';

export function UsersList() {
  const { data, loading, error, refetch } = useQuery(
    'users/all',
    async () => {
      const res = await fetch('/api/users');
      return res.json();
    },
    { staleTime: 10000 }
  );

  if (loading) return <div>Fetching users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh Data</button>
      <ul>{data?.map((u: any) => <li key={u.id}>{u.name}</li>)}</ul>
    </div>
  );
}`
  },
  {
    id: 'use-mutation',
    name: 'useMutation(mutationFn, options?)',
    shortName: 'useMutation',
    category: 'Data Fetching',
    section: 'utility',
    badge: 'Optimistic',
    badgeType: 'core',
    returns: '{ mutate, loading, error, data }',
    signature: 'const { mutate, loading, error } = useMutation(mutationFn, options?);',
    description: 'Asynchronous server mutation hook with automatic optimistic context rollback on failure.',
    whyBetter: 'Manages mutation loading state and integrates with uReact cache for automatic invalidation.',
    parameters: [
      { name: 'mutationFn', type: '(payload: TInput) => Promise<TData>', description: 'Async mutation callback.' },
      { name: 'options.onMutate', type: '(payload: TInput) => void', description: 'Optimistic state updater called before network request.' }
    ],
    example: `import { useMutation, setQueryData } from 'ureact';

export function LikeButton({ postId }: { postId: string }) {
  const { mutate, loading } = useMutation(
    async (id: string) => api.likePost(id),
    {
      onMutate: (id) => {
        // Optimistically increment like count immediately
        setQueryData(['post', id], (old: any) => ({
          ...old,
          likes: (old?.likes || 0) + 1
        }));
      }
    }
  );

  return (
    <button onClick={() => mutate(postId)} disabled={loading}>
      {loading ? 'Saving...' : '❤️ Like'}
    </button>
  );
}`
  },
  {
    id: 'use-shortcut',
    name: 'useShortcut(keys, handler, options?)',
    shortName: 'useShortcut',
    category: 'Browser & DOM',
    section: 'utility',
    badge: 'Hotkeys',
    badgeType: 'amber',
    returns: 'void',
    signature: 'useShortcut(keys, handler, options?);',
    description: 'Declarative keyboard hotkeys (e.g. "mod+k", "ctrl+z", "escape") with automatic cleanup.',
    whyBetter: 'Handles key combinations, cross-platform Mod/Ctrl modifiers, and conditional enablement in one clean declaration.',
    parameters: [
      { name: 'keys', type: 'string', description: 'Key combo string like "mod+k", "ctrl+z", "escape", "shift+enter".' },
      { name: 'handler', type: '(e: KeyboardEvent) => void', description: 'Callback executed when keys are pressed.' },
      { name: 'options.enabled', type: 'boolean (optional)', description: 'Conditional toggle for the shortcut.' }
    ],
    example: `import { useState } from 'react';
import { useShortcut } from 'ureact';

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle with Ctrl+K or Cmd+K
  useShortcut('mod+k', (e) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  });

  // Close with Esc
  useShortcut('escape', () => setIsOpen(false), { enabled: isOpen });

  return <div>Palette is {isOpen ? 'OPEN' : 'CLOSED'}</div>;
}`
  },
  {
    id: 'use-in-view',
    name: 'useInView(options?)',
    shortName: 'useInView',
    category: 'Browser & DOM',
    section: 'utility',
    badge: 'Observer',
    badgeType: 'amber',
    returns: '{ ref, inView, entry }',
    signature: 'const { ref, inView, entry } = useInView(options?);',
    description: 'Intersection Observer hook for viewport detection, infinite scroll triggers, and lazy-loading animations.',
    whyBetter: 'Zero manual IntersectionObserver bookkeeping. Provides reactive ref callback and boolean flag in 1 line.',
    parameters: [
      { name: 'options.threshold', type: 'number (optional)', description: 'Intersection ratio required to trigger inView (0.0 - 1.0).' },
      { name: 'options.triggerOnce', type: 'boolean (optional)', description: 'Keep inView true after first intersection.' }
    ],
    example: `import { useInView } from 'ureact';

export function LazyImage({ src, alt }: { src: string; alt: string }) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <div ref={ref} style={{ minHeight: 220 }}>
      {inView ? (
        <img src={src} alt={alt} style={{ width: '100%', borderRadius: 8 }} />
      ) : (
        <div className="skeleton-placeholder" />
      )}
    </div>
  );
}`
  },
  {
    id: 'use-query-param',
    name: 'useQueryParam(key, defaultValue)',
    shortName: 'useQueryParam',
    category: 'Browser & DOM',
    section: 'utility',
    badge: 'URL State',
    badgeType: 'amber',
    returns: '[value, setValue]',
    signature: 'const [val, setVal] = useQueryParam(key, defaultValue);',
    description: 'Two-way reactive URL search parameter synchronization using the browser History API.',
    whyBetter: 'Automatically updates the browser address bar without causing full-page reloads or requiring router wrappers.',
    parameters: [
      { name: 'key', type: 'string', description: 'URL query parameter name (e.g. ?tab=...)' },
      { name: 'defaultValue', type: 'string', description: 'Default value returned if param is missing.' }
    ],
    example: `import { useQueryParam } from 'ureact';

export function ProductCatalog() {
  // Syncs with ?category=electronics in browser URL
  const [category, setCategory] = useQueryParam('category', 'all');

  return (
    <div>
      <button onClick={() => setCategory('electronics')}>Electronics</button>
      <button onClick={() => setCategory('books')}>Books</button>
      <p>Current URL query: ?category={category}</p>
    </div>
  );
}`
  },
  {
    id: 'use-counter',
    name: 'useCounter(initialValue?, options?)',
    shortName: 'useCounter',
    category: '1-Line Primitives',
    section: 'utility',
    badge: '1-Line Helper',
    badgeType: 'emerald',
    returns: '{ value, inc, dec, reset, set }',
    signature: 'const counter = useCounter(initialValue?, options?);',
    description: '1-line reactive numeric counter with step increments, min/max clamps, and reset methods.',
    whyBetter: 'Eliminates repetitive setCount(c => Math.min(max, c + 1)) boilerplate.',
    parameters: [
      { name: 'initialValue', type: 'number (optional)', description: 'Initial counter value (default: 0).' },
      { name: 'options.min', type: 'number (optional)', description: 'Minimum allowed value constraint.' },
      { name: 'options.max', type: 'number (optional)', description: 'Maximum allowed value constraint.' }
    ],
    example: `import { useCounter } from 'ureact';

export function QuantityInput() {
  const qty = useCounter(1, { min: 1, max: 20 });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button onClick={() => qty.dec()}>-</button>
      <span>Qty: {qty.value}</span>
      <button onClick={() => qty.inc()}>+</button>
      <button onClick={() => qty.reset()}>Reset</button>
    </div>
  );
}`
  },
  {
    id: 'use-array',
    name: 'useArray(initialItems?)',
    shortName: 'useArray',
    category: '1-Line Primitives',
    section: 'utility',
    badge: '1-Line Helper',
    badgeType: 'emerald',
    returns: '{ items, push, remove, clear, reset, set }',
    signature: 'const list = useArray<T>(initialItems?);',
    description: '1-line array state manager with built-in push, remove, clear, and reset methods.',
    whyBetter: 'No more writing setItems(prev => prev.filter((_, i) => i !== idx)) everywhere.',
    parameters: [
      { name: 'initialItems', type: 'T[] (optional)', description: 'Initial array elements.' }
    ],
    example: `import { useArray } from 'ureact';

export function TagManager() {
  const tags = useArray(['React 19', 'uReact', 'TypeScript']);

  return (
    <div>
      <button onClick={() => tags.push(\`Tag #\${tags.items.length + 1}\`)}>
        + Add Tag
      </button>
      <ul>
        {tags.items.map((tag, idx) => (
          <li key={idx}>
            {tag} <button onClick={() => tags.remove(idx)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`
  }
];

const OFFICIAL_REACT_HOOKS: (HookUsageModalData & { version: string; purpose: string; ureactEquivalent: string; whyBetter: string })[] = [
  {
    name: 'useState',
    version: 'React 16.8+',
    purpose: 'Local component state management.',
    signature: 'const [state, setState] = useState(initialState)',
    ureactEquivalent: 'createStore / useLocalStore / signal',
    whyBetter: 'Direct proxy mutations (user.name = "Alex"), 0 setter boilerplate, automated input 2-way binding with store.$bind.',
    example: `import { createStore, signal, useStore } from 'ureact';

// Option A: Deep Proxy Store with zero-boilerplate $bind
const user = createStore({ name: 'Alex', age: 28, isPro: true });

export function UserProfile() {
  return (
    <div>
      <input {...user.$bind.name} placeholder="Name" />
      <button onClick={() => user.state.age++}>Age: {user.state.age}</button>
      <button onClick={() => user.$toggle('isPro')}>
        Status: {user.state.isPro ? 'PRO' : 'FREE'}
      </button>
    </div>
  );
}

// Option B: Fine-grained atomic signal (0 parent re-renders)
export function QuickCounter() {
  const count = signal(0);
  return <button onClick={() => count.value++}>Count: {count.value}</button>;
}`,
    standardReactExample: `import { useState } from 'react';

export function LegacyUser() {
  const [name, setName] = useState('Alex');
  const [age, setAge] = useState(28);
  const [isPro, setIsPro] = useState(true);

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => setAge(a => a + 1)}>Age: {age}</button>
      <button onClick={() => setIsPro(p => !p)}>
        Status: {isPro ? 'PRO' : 'FREE'}
      </button>
    </div>
  );
}`
  },
  {
    name: 'useReducer',
    version: 'React 16.8+',
    purpose: 'Complex state updates with action dispatches & reducers.',
    signature: 'const [state, dispatch] = useReducer(reducer, initialArg, init)',
    ureactEquivalent: 'createStore with direct methods',
    whyBetter: 'Eliminates switch/case action ceremony. Call store.increment() or state mutations directly.',
    example: `import { createStore, useStore } from 'ureact';

// Methods are colocated directly on the store. No switch/case action ceremony!
export const cartStore = createStore({
  items: [] as { id: string; title: string; price: number }[],
  addItem(title: string, price: number) {
    this.items.push({ id: Math.random().toString(), title, price });
  },
  removeItem(id: string) {
    this.items = this.items.filter(item => item.id !== id);
  },
  get total() {
    return this.items.reduce((sum, i) => sum + i.price, 0);
  }
});

export function Cart() {
  const cart = useStore(cartStore);
  return (
    <div>
      <h3>Total: \${cart.total}</h3>
      <button onClick={() => cartStore.addItem('Course', 49)}>Add Item</button>
    </div>
  );
}`,
    standardReactExample: `import { useReducer } from 'react';

type Action = { type: 'ADD'; title: string } | { type: 'REMOVE'; id: string };

function reducer(state: string[], action: Action) {
  switch (action.type) {
    case 'ADD': return [...state, action.title];
    case 'REMOVE': return state.filter(i => i !== action.id);
    default: return state;
  }
}

export function LegacyCart() {
  const [items, dispatch] = useReducer(reducer, []);
  return <button onClick={() => dispatch({ type: 'ADD', title: 'Course' })}>Add</button>;
}`
  },
  {
    name: 'useRef',
    version: 'React 16.8+',
    purpose: 'Mutable container that persists without triggering re-renders; DOM element references.',
    signature: 'const ref = useRef(initialValue)',
    ureactEquivalent: 'Native useRef + signal (for reactive refs)',
    whyBetter: 'Fully compatible. Pair with signals for fine-grained scalar tracking without re-renders.',
    example: `import { useRef } from 'react';
import { signal } from 'ureact';

export function InputWithReactiveRef() {
  // 1. Standard DOM element ref (100% compatible with React)
  const inputRef = useRef<HTMLInputElement>(null);

  // 2. Reactive scalar reference without component re-render
  const scrollY = signal(0);

  return (
    <div>
      <input ref={inputRef} placeholder="Focus target" />
      <button onClick={() => inputRef.current?.focus()}>Focus Input</button>
      <div>Scroll offset: {scrollY.value}px</div>
    </div>
  );
}`,
    standardReactExample: `import { useRef } from 'react';

export function LegacyRef() {
  const countRef = useRef(0);
  function handleClick() {
    countRef.current++;
    console.log(countRef.current);
  }
  return <button onClick={handleClick}>Increment Ref</button>;
}`
  },
  {
    name: 'useImperativeHandle',
    version: 'React 16.8+',
    purpose: 'Customizes the ref handle exposed by forwardRef to parent components.',
    signature: 'useImperativeHandle(ref, createHandle, [deps])',
    ureactEquivalent: 'Native useImperativeHandle',
    whyBetter: 'Fully compatible. In React 19, forwardRef is optional (ref is a direct prop).',
    example: `import { useImperativeHandle, useRef } from 'react';

// In React 19 + uReact, ref is a direct prop (no forwardRef wrapper required)
export function FancyInput({ ref }: { ref: any }) {
  const nativeInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusAndSelect() {
      nativeInputRef.current?.focus();
      nativeInputRef.current?.select();
    },
    resetValue() {
      if (nativeInputRef.current) nativeInputRef.current.value = '';
    }
  }));

  return <input ref={nativeInputRef} className="fancy-input" />;
}`,
    standardReactExample: `import { forwardRef, useImperativeHandle, useRef } from 'react';

export const LegacyFancyInput = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus() { inputRef.current.focus(); }
  }));
  return <input ref={inputRef} />;
});`
  },
  {
    name: 'useEffect',
    version: 'React 16.8+',
    purpose: 'Side-effects after render (DOM mutations, data fetching, subscriptions).',
    signature: 'useEffect(() => { ... return cleanup }, [deps])',
    ureactEquivalent: 'useMount / useUnmount / useWatchReactive',
    whyBetter: 'Separates lifecycles into explicit hooks. Zero empty [] array traps or stale closure bugs.',
    example: `import { useMount, useUnmount, useWatchReactive, signal } from 'ureact';

export function SmartWidget() {
  const status = signal('idle');

  // 1. Explicit Mount: Runs once on component mount without [] linter warnings
  useMount(() => {
    console.log('Component mounted cleanly');
  });

  // 2. Explicit Unmount: Zero cleanup ceremony
  useUnmount(() => {
    console.log('Component safely unmounted');
  });

  // 3. Reactive State Watcher: Get exact (newVal, oldVal)
  useWatchReactive(status, (next, prev) => {
    console.log(\`Status transition: \${prev} ➔ \${next}\`);
  });

  return <button onClick={() => status.value = 'active'}>Activate</button>;
}`,
    standardReactExample: `import { useEffect, useState } from 'react';

export function LegacyEffect() {
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    console.log('Mounted');
    return () => console.log('Unmounted');
  }, []); // Warning: Missing dependency if status is referenced

  useEffect(() => {
    console.log('Status changed to', status);
  }, [status]); // Runs on initial mount even if unwanted
}`
  },
  {
    name: 'useLayoutEffect',
    version: 'React 16.8+',
    purpose: 'Synchronous execution after DOM mutations before browser paints (measurements/layout shifts).',
    signature: 'useLayoutEffect(() => { ... }, [deps])',
    ureactEquivalent: 'Native useLayoutEffect + useWatch({ flush: "sync" })',
    whyBetter: 'Prevents visual layout flashes and layout thrashing.',
    example: `import { useLayoutEffect, useRef } from 'react';

export function Tooltip({ text }: { text: string }) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Synchronous pre-paint execution to prevent layout shift or flicker:
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const { height } = tooltipRef.current.getBoundingClientRect();
      tooltipRef.current.style.transform = \`translateY(-\${height + 8}px)\`;
    }
  }, [text]);

  return <div ref={tooltipRef} className="tooltip">{text}</div>;
}`,
    standardReactExample: `import { useLayoutEffect, useRef } from 'react';

export function LegacyLayout() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    // Blocks browser painting until measurements finish
  }, []);
  return <div ref={ref}>Box</div>;
}`
  },
  {
    name: 'useInsertionEffect',
    version: 'React 18+',
    purpose: 'Synchronous execution before DOM mutations for CSS-in-JS library rule injections.',
    signature: 'useInsertionEffect(() => { ... }, [deps])',
    ureactEquivalent: '<Scoped> & useScopedCSS',
    whyBetter: 'Specialized for CSS-in-JS style sheet tag insertion. uReact provides native <Scoped> component.',
    example: `import { Scoped, useScopedCSS } from 'ureact';

// Instead of low-level useInsertionEffect DOM stylesheet injection,
// uReact provides native <Scoped> and useScopedCSS with auto-cleanup:
export function ScopedCard() {
  return (
    <Scoped css={\`
      .card { background: #0ea5e9; padding: 16px; border-radius: 8px; }
      .title { color: white; font-weight: bold; }
    \`}>
      <div className="card">
        <h4 className="title">Zero-Bleed Scoped Component</h4>
      </div>
    </Scoped>
  );
}`,
    standardReactExample: `import { useInsertionEffect } from 'react';

export function LegacyStyleInjector() {
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.textContent = '.custom { color: red; }';
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
}`
  },
  {
    name: 'useMemo',
    version: 'React 16.8+',
    purpose: 'Caches the calculated result of expensive computations between re-renders.',
    signature: 'const cachedValue = useMemo(calculateValue, [deps])',
    ureactEquivalent: 'computed(fn) / view() auto-memoization',
    whyBetter: 'uReact proxy stores compute derived state on-demand without manual dependency arrays.',
    example: `import { signal, computed, useComputed } from 'ureact';

const items = signal([10, 20, 30, 40]);
const taxRate = signal(0.18);

// Automatically tracks accessed signals.
// Lazily evaluated & cached without manual dependency array!
const cartTotal = computed(() => {
  const subtotal = items.value.reduce((a, b) => a + b, 0);
  return subtotal * (1 + taxRate.value);
});

export function CartSummary() {
  const total = useComputed(() => cartTotal.value);
  return <div>Total with Tax: \${total}</div>;
}`,
    standardReactExample: `import { useMemo, useState } from 'react';

export function LegacyMemo() {
  const [items] = useState([10, 20, 30, 40]);
  const [taxRate] = useState(0.18);

  // Manual dependency array required:
  const cartTotal = useMemo(() => {
    const subtotal = items.reduce((a, b) => a + b, 0);
    return subtotal * (1 + taxRate);
  }, [items, taxRate]);

  return <div>Total: \${cartTotal}</div>;
}`
  },
  {
    name: 'useCallback',
    version: 'React 16.8+',
    purpose: 'Caches a function definition between re-renders to prevent child component re-renders.',
    signature: 'const cachedFn = useCallback(fn, [deps])',
    ureactEquivalent: 'store actions / event modifiers',
    whyBetter: 'Store action methods are permanently stable references that never recreate.',
    example: `import { createStore } from 'ureact';

// Store methods are inherently stable reference pointers.
// You never need useCallback to memoize callbacks for children!
export const userActions = createStore({
  activeTab: 'profile',
  switchTab(tab: string) {
    this.activeTab = tab;
  }
});

export function HeaderNav() {
  // userActions.switchTab is permanently stable across all renders
  return <button onClick={() => userActions.switchTab('settings')}>Switch</button>;
}`,
    standardReactExample: `import { useCallback, useState } from 'react';

export function LegacyCallback() {
  const [activeTab, setActiveTab] = useState('profile');

  // Must wrap in useCallback to prevent child re-renders:
  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return <button onClick={() => switchTab('settings')}>Switch</button>;
}`
  },
  {
    name: 'useContext',
    version: 'React 16.8+',
    purpose: 'Reads and subscribes to a React context value.',
    signature: 'const value = useContext(MyContext)',
    ureactEquivalent: 'use(MyContext) / global createStore',
    whyBetter: 'Global createStore() replaces context boilerplate without Provider wrapper nesting.',
    example: `import { createStore, useStore } from 'ureact';

// 1. Create store outside components (no <Provider> nesting required)
export const themeStore = createStore({
  mode: 'dark',
  toggle() { this.mode = this.mode === 'dark' ? 'light' : 'dark'; }
});

// 2. Consume directly in any component
export function ThemeToggle() {
  const theme = useStore(themeStore);
  return (
    <button onClick={() => themeStore.toggle()}>
      Current: {theme.mode}
    </button>
  );
}`,
    standardReactExample: `import { createContext, useContext, useState } from 'react';

const ThemeCtx = createContext(null);

export function App() {
  const [mode, setMode] = useState('dark');
  return (
    <ThemeCtx.Provider value={{ mode, setMode }}>
      <div>Theme Provider Nesting</div>
    </ThemeCtx.Provider>
  );
}`
  },
  {
    name: 'use(Resource)',
    version: 'React 19',
    purpose: 'Unwraps promises or reads context conditionally inside loops and if-branches.',
    signature: 'const data = use(Promise | Context)',
    ureactEquivalent: 'usePromise / useResource / <Await for={...}>',
    whyBetter: 'Works inside conditionals; paired with <Await> for declarative promise resolution in JSX.',
    example: `import { usePromise, Await } from 'ureact';

export function UserDetails({ promise }: { promise: Promise<{ name: string }> }) {
  // Option A: Direct promise unwrapping
  const user = usePromise(promise);

  // Option B: Declarative JSX <Await>
  return (
    <Await for={promise} fallback={<div>Loading user profile...</div>}>
      {(userData) => <h3>Welcome, {userData.name}!</h3>}
    </Await>
  );
}`,
    standardReactExample: `import { use, Suspense } from 'react';

function UserContent({ promise }) {
  const user = use(promise);
  return <h3>{user.name}</h3>;
}

export function LegacyAwait({ promise }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserContent promise={promise} />
    </Suspense>
  );
}`
  },
  {
    name: 'useActionState',
    version: 'React 19',
    purpose: 'Handles async form actions with automatic pending status, errors, and returned state.',
    signature: 'const [state, formAction, isPending] = useActionState(fn, initial)',
    ureactEquivalent: 'useAction(fn, initial) / <ActionForm>',
    whyBetter: 'uReact adds typed payloads, auto error capture, reset helpers, and optimistic rollback.',
    example: `import { useAction } from 'ureact';

export function SubscribeForm() {
  const action = useAction(
    async (prev, email: string) => {
      return await api.subscribe(email);
    },
    { status: 'idle' }
  );

  return (
    <form action={(fd) => action.run(fd.get('email') as string)}>
      <input name="email" type="email" placeholder="Email" required />
      <button disabled={action.isPending}>
        {action.isPending ? 'Sending...' : 'Join Newsletter'}
      </button>
      {action.error && <p className="error">{action.error.message}</p>}
    </form>
  );
}`,
    standardReactExample: `import { useActionState } from 'react';

async function subscribeAction(prevState, formData) {
  const email = formData.get('email');
  return await api.subscribe(email);
}

export function LegacyAction() {
  const [state, formAction, isPending] = useActionState(subscribeAction, null);
  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={isPending}>Submit</button>
    </form>
  );
}`
  },
  {
    name: 'useOptimistic',
    version: 'React 19',
    purpose: 'Displays immediate optimistic UI updates while background async actions execute.',
    signature: 'const [optimistic, setOptimistic] = useOptimistic(state, updateFn)',
    ureactEquivalent: 'useOptimisticAction / useMutation',
    whyBetter: 'Automates rollback on server failure; integrates with reactive proxy stores.',
    example: `import { useAction } from 'ureact';

export function TodoList() {
  // useAction merges useActionState + useOptimistic with typed rollback
  const action = useAction<string, string[]>(
    async (prev, newTodo) => await api.saveTodo(newTodo),
    ['Buy milk'],
    {
      // Instant optimistic feedback in 0ms:
      optimisticUpdate: (prev, newTodo) => [...prev, \`\${newTodo} (saving...)\`]
    }
  );

  return (
    <div>
      <button onClick={() => action.run('Learn uReact')}>+ Add Todo</button>
      <ul>{action.data.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}`,
    standardReactExample: `import { useOptimistic, useState, useTransition } from 'react';

export function LegacyOptimistic() {
  const [todos, setTodos] = useState(['Buy milk']);
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    todos,
    (state, newTodo) => [...state, \`\${newTodo} (saving...)\`]
  );
}`
  },
  {
    name: 'useFormStatus',
    version: 'React 19 (react-dom)',
    purpose: 'Reads parent form pending status, form action URL, and submitted FormData.',
    signature: 'const { pending, data, method, action } = useFormStatus()',
    ureactEquivalent: 'useActionStatus / <ActionSubmitButton>',
    whyBetter: 'Safe execution outside <form> boundaries without throwing unexpected runtime errors.',
    example: `import { useActionStatus, ActionSubmitButton } from 'ureact';

// Option A: Single-tag React 19 submit button with auto-pending
export function CheckoutButton() {
  return (
    <ActionSubmitButton pendingText="Processing Order...">
      Place Order
    </ActionSubmitButton>
  );
}

// Option B: Safe useActionStatus hook that never throws outside form
export function CustomStatusIndicator() {
  const { pending } = useActionStatus();
  return <span>Status: {pending ? 'Active' : 'Idle'}</span>;
}`,
    standardReactExample: `import { useFormStatus } from 'react-dom';

export function LegacyStatus() {
  // Throws or fails if rendered outside <form>:
  const { pending, data } = useFormStatus();
  return <button disabled={pending}>Submit</button>;
}`
  },
  {
    name: 'useTransition',
    version: 'React 18+',
    purpose: 'Marks state updates as non-blocking transitions, preserving main thread responsiveness.',
    signature: 'const [isPending, startTransition] = useTransition()',
    ureactEquivalent: 'useActionTransition / batch(fn)',
    whyBetter: 'React 19 async transition support with automatic error boundary capture.',
    example: `import { useActionTransition, batch } from 'ureact';

export function TabSwitch() {
  const [isPending, runTransition] = useActionTransition();

  const handleSwitch = (tab: string) => {
    runTransition(async () => {
      // Async transition updates state non-blockingly:
      store.activeTab = tab;
      await fetchTabDetails(tab);
    });
  };

  return (
    <div>
      <button onClick={() => handleSwitch('analytics')}>
        Analytics {isPending && '(loading...)'}
      </button>
    </div>
  );
}`,
    standardReactExample: `import { useTransition } from 'react';

export function LegacyTransition() {
  const [isPending, startTransition] = useTransition();
  function switchTab(tab) {
    startTransition(() => {
      setTab(tab);
    });
  }
}`
  },
  {
    name: 'useDeferredValue',
    version: 'React 18 / 19',
    purpose: 'Defers updating a secondary part of the UI while user typing is active.',
    signature: 'const deferredValue = useDeferredValue(value, initialValue?)',
    ureactEquivalent: 'useDeferred / useDebounce',
    whyBetter: 'React 19 initialValue fallback support + debounced scalar timing.',
    example: `import { useState } from 'react';
import { useDeferred, useDebounce } from 'ureact';

export function SearchList() {
  const [query, setQuery] = useState('');
  
  // React 19 initialValue fallback support + debouncing:
  const deferredQuery = useDeferred(query, 'initial query');
  const debouncedQuery = useDebounce(query, 250);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}`,
    standardReactExample: `import { useDeferredValue, useState } from 'react';

export function LegacyDeferred() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
}`
  },
  {
    name: 'useSyncExternalStore',
    version: 'React 18+',
    purpose: 'Subscribes to external state stores with tearing-free concurrent rendering guarantees.',
    signature: 'useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)',
    ureactEquivalent: 'Core engine of uReact createStore()',
    whyBetter: 'uReact wraps this internally so developers never have to write low-level snapshot getters.',
    example: `import { createStore, useStore } from 'ureact';

// uReact encapsulates useSyncExternalStore internally with zero tearing.
// Developers write clean, intuitive state logic:
export const counter = createStore({ count: 0 });

export function Counter() {
  const state = useStore(counter);
  return <button onClick={() => counter.state.count++}>{state.count}</button>;
}`,
    standardReactExample: `import { useSyncExternalStore } from 'react';

function subscribe(callback) { return () => {}; }
function getSnapshot() { return window.innerWidth; }

export function LegacySyncStore() {
  const width = useSyncExternalStore(subscribe, getSnapshot);
  return <div>Width: {width}</div>;
}`
  },
  {
    name: 'useId',
    version: 'React 18+',
    purpose: 'Generates unique IDs accessible for ARIA accessibility attributes and form associations.',
    signature: 'const id = useId()',
    ureactEquivalent: 'Native useId / auto-generated in <AutoForm>',
    whyBetter: 'Built directly into uReact <AutoForm> inputs for zero-configuration WCAG compliance.',
    example: `import { AutoForm } from 'ureact';

// <AutoForm> automatically generates compliant, unique ARIA IDs for all fields:
export function ContactForm() {
  return (
    <AutoForm
      initialValues={{ name: '', email: '' }}
      onSubmit={(values) => api.submit(values)}
    />
  );
}`,
    standardReactExample: `import { useId } from 'react';

export function LegacyIdForm() {
  const nameId = useId();
  const emailId = useId();
  return (
    <div>
      <label htmlFor={nameId}>Name:</label>
      <input id={nameId} />
    </div>
  );
}`
  },
  {
    name: 'useDebugValue',
    version: 'React 16.8+',
    purpose: 'Displays a custom label for custom hooks in React DevTools.',
    signature: 'useDebugValue(value, formatFn?)',
    ureactEquivalent: 'Native useDebugValue + uReact DevTools HUD',
    whyBetter: 'Integrated into uReact core hooks and Quantum DevTools HUD with live time-travel inspection.',
    example: `import { DevTools, registerDevTools, createStore } from 'ureact';

// Instead of basic textual debug values, uReact provides a complete
// in-browser Quantum DevTools HUD with live time-travel and 60 FPS telemetry:
const cartStore = createStore({ items: [] });
registerDevTools('CartStore', 'store', cartStore);

export function App() {
  return (
    <div>
      <MainContent />
      <DevTools /> {/* Press Ctrl+Shift+D */}
    </div>
  );
}`,
    standardReactExample: `import { useDebugValue, useState } from 'react';

export function useCustomHook() {
  const [isOnline] = useState(true);
  useDebugValue(isOnline ? 'Online' : 'Offline');
}`
  }
];


// Reusable Hook Element with Tabs: [Example] and [API & Signature]
function HookTabCard({
  hook,
  globalTab,
  onOpenModal
}: {
  hook: DetailedHookItem;
  globalTab?: 'example' | 'api';
  onOpenModal?: (data: HookUsageModalData) => void;
}) {
  const [activeTab, setActiveTab] = useState<'example' | 'api'>('example');

  useEffect(() => {
    if (globalTab) {
      setActiveTab(globalTab);
    }
  }, [globalTab]);

  return (
    <div className="hook-tab-card" id={hook.id}>
      <div className="hook-tab-header">
        <div className="hook-tab-title-wrap">
          <span className="hook-tab-name">{hook.name}</span>
          {hook.badge && (
            <span
              className="hook-tab-badge"
              style={{
                background:
                  hook.badgeType === 'react19'
                    ? 'var(--callout-react19-bg)'
                    : hook.badgeType === 'emerald'
                    ? 'var(--callout-tip-bg)'
                    : 'var(--accent-cyan-bg)',
                color:
                  hook.badgeType === 'react19'
                    ? 'var(--accent-amber)'
                    : hook.badgeType === 'emerald'
                    ? 'var(--accent-emerald)'
                    : 'var(--accent-cyan)',
                border: `1px solid ${
                  hook.badgeType === 'react19'
                    ? 'rgba(217, 119, 6, 0.3)'
                    : hook.badgeType === 'emerald'
                    ? 'rgba(5, 150, 105, 0.3)'
                    : 'var(--border-subtle)'
                }`
              }}
            >
              {hook.badge}
            </span>
          )}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            returns {hook.returns}
          </span>
        </div>

        {/* Dedicated Tab Switcher against each hook */}
        <div className="hook-tab-nav">
          <button
            className={`hook-tab-btn ${activeTab === 'example' ? 'active' : ''}`}
            onClick={() => setActiveTab('example')}
            title="View practical code example in new tab"
          >
            <Code2 size={14} /> Example
          </button>
          <button
            className={`hook-tab-btn ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
            title="View API signature & parameters in new tab"
          >
            <FileText size={14} /> API &amp; Signature
          </button>
          {onOpenModal && (
            <button
              className="hook-tab-btn"
              onClick={() => onOpenModal({
                name: hook.shortName,
                purpose: hook.description,
                signature: hook.signature,
                whyBetter: hook.whyBetter,
                example: hook.example,
                returns: hook.returns,
                parameters: hook.parameters
              })}
              title="Pop out usage example in interactive modal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--accent-cyan, #38bdf8)'
              }}
            >
              <Maximize2 size={13} />
              <span>Popup</span>
            </button>
          )}
        </div>
      </div>


      <div className="hook-tab-body">
        {activeTab === 'example' ? (
          <div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
              {hook.description}
            </p>
            <CodeBlock
              code={hook.example}
              language="tsx"
              title={`${hook.shortName}.example.tsx`}
              showLineNumbers
            />
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.82rem',
                color: 'var(--text-muted)'
              }}
            >
              <Sparkles size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Why it's better:</strong> {hook.whyBetter}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <span className="form-label" style={{ marginBottom: '6px' }}>Function Signature:</span>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.86rem',
                  color: 'var(--accent-indigo)'
                }}
              >
                {hook.signature}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span className="form-label" style={{ marginBottom: '6px' }}>Description:</span>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                {hook.description}
              </p>
            </div>

            {hook.parameters.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <span className="form-label" style={{ marginBottom: '6px' }}>Parameters:</span>
                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', background: 'var(--bg-secondary)' }}>
                        <th style={{ padding: '8px 12px', color: 'var(--accent-cyan)' }}>Parameter</th>
                        <th style={{ padding: '8px 12px', color: 'var(--text-main)' }}>Type</th>
                        <th style={{ padding: '8px 12px', color: 'var(--text-main)' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hook.parameters.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? 'var(--bg-card-hover)' : 'transparent' }}>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
                            {p.name}
                          </td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>
                            {p.type}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                            {p.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <span className="form-label" style={{ marginBottom: '6px' }}>Return Value:</span>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: 'var(--accent-emerald)'
                }}
              >
                {hook.returns}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function HooksReferencePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [globalTab, setGlobalTab] = useState<'example' | 'api'>('example');
  const [selectedModalHook, setSelectedModalHook] = useState<HookUsageModalData | null>(null);

  // Filter hooks by category and search term
  const filteredHooks = useMemo(() => {
    return ALL_HOOK_ITEMS.filter((h) => {
      const matchesCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'react19' && h.section === 'react19') ||
        (selectedCategory === 'reactivity' && h.section === 'reactivity') ||
        (selectedCategory === 'utility' && h.section === 'utility');

      const matchesSearch =
        !searchQuery.trim() ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.shortName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const react19Hooks = filteredHooks.filter((h) => h.section === 'react19');
  const reactivityHooks = filteredHooks.filter((h) => h.section === 'reactivity');
  const utilityHooks = filteredHooks.filter((h) => h.section === 'utility');

  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">Reference &gt; Complete Hooks &amp; "use" API Reference</div>

      <h1 className="doc-title">Complete Hooks &amp; "use" API Reference</h1>
      <p className="doc-lead">
        Exhaustive reference of <strong>every official React hook and "use" function</strong> (from React 16.8 up to React 19) alongside the <strong>uReact</strong> developer-first equivalents. Each hook element includes an <strong>interactive Example tab</strong> and a <strong>usage popup modal</strong> with complete, copyable TypeScript code.
      </p>

      {/* Global Interactive Hook Toolbar */}
      <div
        style={{
          margin: '28px 0',
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {/* Live Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-dim)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hooks (e.g. useAction, useStore, useWatch)..."
              className="input-field"
              style={{ width: '100%', paddingLeft: '36px' }}
            />
          </div>

          {/* Global View Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Switch all tabs:</span>
            <div className="hook-tab-nav" style={{ margin: 0 }}>
              <button
                className={`hook-tab-btn ${globalTab === 'example' ? 'active' : ''}`}
                onClick={() => setGlobalTab('example')}
              >
                <Code2 size={13} /> Code Examples
              </button>
              <button
                className={`hook-tab-btn ${globalTab === 'api' ? 'active' : ''}`}
                onClick={() => setGlobalTab('api')}
              >
                <FileText size={13} /> API Specs
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`btn btn-secondary ${selectedCategory === 'all' ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
          >
            All Hooks ({ALL_HOOK_ITEMS.length})
          </button>
          <button
            onClick={() => setSelectedCategory('react19')}
            className={`btn btn-secondary ${selectedCategory === 'react19' ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
          >
            ⚡ React 19 Native (6)
          </button>
          <button
            onClick={() => setSelectedCategory('reactivity')}
            className={`btn btn-secondary ${selectedCategory === 'reactivity' ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
          >
            🔄 Core Reactive State (3)
          </button>
          <button
            onClick={() => setSelectedCategory('utility')}
            className={`btn btn-secondary ${selectedCategory === 'utility' ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
          >
            🛠️ Lifecycle, SWR &amp; DOM (10)
          </button>
        </div>
      </div>

      {/* Section 1: Official React Hooks Matrix Table */}
      <h2 id="reference-table" style={{ marginTop: '36px', marginBottom: '16px' }}>
        1. Complete APIs Table (React 16.8 → React 19)
      </h2>
      <p>
        The table below catalogs all 19 official React hooks, their version introduction, signature, and their corresponding uReact ergonomic replacement. Click on any hook name or the <strong>View Example</strong> button to pop open the interactive usage code modal:
      </p>

      <div style={{ overflowX: 'auto', margin: '24px 0' }} className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '12px', color: 'var(--accent-cyan)' }}>React Hook</th>
              <th style={{ padding: '12px', color: 'var(--text-main)' }}>Version</th>
              <th style={{ padding: '12px', color: 'var(--text-main)' }}>Purpose &amp; Signature</th>
              <th style={{ padding: '12px', color: 'var(--accent-emerald)' }}>uReact Equivalent</th>
              <th style={{ padding: '12px', color: 'var(--text-main)' }}>Developer Advantage</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--accent-cyan)' }}>Interactive Example</th>
            </tr>
          </thead>
          <tbody>
            {OFFICIAL_REACT_HOOKS.map((hook, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: i % 2 === 0 ? 'var(--bg-card-hover)' : 'transparent'
                }}
              >
                <td
                  onClick={() => setSelectedModalHook(hook)}
                  style={{
                    padding: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'var(--accent-cyan)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px'
                  }}
                  title="Click to view interactive usage example modal"
                >
                  {hook.name}()
                </td>
                <td style={{ padding: '12px', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {hook.version}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{hook.purpose}</div>
                  <code style={{ fontSize: '0.76rem', color: 'var(--accent-indigo)' }}>{hook.signature}</code>
                </td>
                <td
                  onClick={() => setSelectedModalHook(hook)}
                  style={{
                    padding: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: 'var(--accent-emerald)',
                    cursor: 'pointer'
                  }}
                  title="Click to view equivalent example"
                >
                  {hook.ureactEquivalent}
                </td>
                <td style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {hook.whyBetter}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => setSelectedModalHook(hook)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      color: 'var(--accent-cyan, #38bdf8)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title={`View ${hook.name}() practical usage example`}
                  >
                    <Sparkles size={13} />
                    <span>View Example</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: React 19 Hooks Suite with Tabs */}
      <h2 id="react19-hooks" style={{ marginTop: '56px', marginBottom: '16px' }}>
        2. React 19 Native Hooks Suite
      </h2>
      <p style={{ marginBottom: '20px' }}>
        All React 19 primitives provided with first-class TypeScript helpers. Click the <strong>Example</strong> tab or the <strong>Popup</strong> button on any element below to inspect practical code:
      </p>

      {react19Hooks.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No React 19 hooks match your search query.
        </div>
      ) : (
        react19Hooks.map((hook) => (
          <HookTabCard
            key={hook.id}
            hook={hook}
            globalTab={globalTab}
            onOpenModal={setSelectedModalHook}
          />
        ))
      )}

      {/* Section 3: Core Reactivity & State Hooks with Tabs */}
      <h2 id="reactivity-hooks" style={{ marginTop: '56px', marginBottom: '16px' }}>
        3. Core Reactivity &amp; State Hooks
      </h2>
      <p style={{ marginBottom: '20px' }}>
        Ergonomic proxy store subscriptions and fine-grained reactive scalars for zero-boilerplate state management:
      </p>

      {reactivityHooks.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No reactivity hooks match your search query.
        </div>
      ) : (
        reactivityHooks.map((hook) => (
          <HookTabCard
            key={hook.id}
            hook={hook}
            globalTab={globalTab}
            onOpenModal={setSelectedModalHook}
          />
        ))
      )}

      {/* Section 4: Lifecycle, SWR & UI Utility Hooks with Tabs */}
      <h2 id="utility-hooks" style={{ marginTop: '56px', marginBottom: '16px' }}>
        4. Lifecycle, Data Fetching &amp; UI Utility Hooks
      </h2>
      <p style={{ marginBottom: '20px' }}>
        High-productivity utilities for SWR caching, window focus revalidation, keyboard shortcuts, viewport detection, and 1-line primitives:
      </p>

      {utilityHooks.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No utility hooks match your search query.
        </div>
      ) : (
        utilityHooks.map((hook) => (
          <HookTabCard
            key={hook.id}
            hook={hook}
            globalTab={globalTab}
            onOpenModal={setSelectedModalHook}
          />
        ))
      )}

      {/* Interactive Hook Usage Example Popup Modal */}
      <HookUsageModal
        isOpen={!!selectedModalHook}
        onClose={() => setSelectedModalHook(null)}
        data={selectedModalHook}
      />
    </article>
  );
}

