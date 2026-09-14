import { createStore } from './state';
import { Store, StoreBase, Listener, Unsubscribe, AutoBinding, StoreBindingProxy } from './types';

export interface ListStore<T extends object> extends StoreBase<T[]> {
  /** Add one or multiple items to the list. Automatically assigns an `id` if not present. */
  add: (item: T | T[] | any) => T;
  /** Remove item(s) by id or predicate */
  remove: (predicateOrId: ((item: T, index: number) => boolean) | any) => void;
  /** Update item(s) by id or predicate with partial patch or updater function */
  update: (
    predicateOrId: ((item: T) => boolean) | any,
    patch: Partial<T> | ((item: T) => Partial<T> | T)
  ) => void;
  /** Toggle a boolean property on an item by id or predicate */
  toggle: (predicateOrId: any, property: keyof T) => void;
  /** Clear all items */
  clear: () => void;
  /** Move an item from one index to another */
  move: (fromIndex: number, toIndex: number) => void;
  /** Total count of items */
  readonly count: number;
}

let nextAutoId = 1;

/**
 * 1-Line Reactive CRUD Collection Store.
 * 
 * Eliminates 30+ lines of repetitive array operations (push, map-to-update, filter-to-delete, toggle boolean).
 * 
 * Example:
 *   const todos = createListStore([
 *     { id: 1, title: 'Learn uReact', done: true }
 *   ]);
 * 
 *   // In JSX:
 *   <button onClick={() => todos.add({ title: 'New Task' })}>Add</button>
 *   <button onClick={() => todos.toggle(1, 'done')}>Toggle</button>
 *   <button onClick={() => todos.remove(1)}>Delete</button>
 */
export function createListStore<T extends object>(initialItems: T[] = []): ListStore<T> {
  const store = createStore<T[]>([...initialItems]);

  function findIndex(predicateOrId: any): number {
    if (typeof predicateOrId === 'function') {
      return store.state.findIndex(predicateOrId);
    }
    return store.state.findIndex((item: any) => item && (item.id === predicateOrId || item.key === predicateOrId));
  }

  const listStore: ListStore<T> = {
    ...store,
    get state() {
      return store.state;
    },
    get count() {
      return store.state.length;
    },
    add(itemOrItems: any) {
      const ensureId = (item: any) => {
        if (typeof item === 'object' && item !== null && item.id === undefined) {
          return { id: Date.now() + '-' + nextAutoId++, ...item };
        }
        return item;
      };

      if (Array.isArray(itemOrItems)) {
        const prepared = itemOrItems.map(ensureId);
        store.state.push(...prepared);
        return prepared as any;
      } else {
        const prepared = ensureId(itemOrItems);
        store.state.push(prepared);
        return prepared;
      }
    },
    remove(predicateOrId: any) {
      const idx = findIndex(predicateOrId);
      if (idx !== -1) {
        store.state.splice(idx, 1);
      }
    },
    update(predicateOrId: any, patch: any) {
      const idx = findIndex(predicateOrId);
      if (idx !== -1) {
        const current = store.state[idx];
        const updates = typeof patch === 'function' ? patch(current) : patch;
        Object.assign(current, updates);
      }
    },
    toggle(predicateOrId: any, property: keyof T) {
      const idx = findIndex(predicateOrId);
      if (idx !== -1) {
        const current: any = store.state[idx];
        current[property] = !current[property];
      }
    },
    clear() {
      store.state.length = 0;
    },
    move(fromIndex: number, toIndex: number) {
      if (fromIndex < 0 || fromIndex >= store.state.length || toIndex < 0 || toIndex >= store.state.length) return;
      const [item] = store.state.splice(fromIndex, 1);
      store.state.splice(toIndex, 0, item);
    }
  };

  return listStore;
}
