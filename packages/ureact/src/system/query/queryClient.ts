import { QueryKey, QueryState, QueryOptions } from './types';

export function hashQueryKey(key: QueryKey): string {
  if (typeof key === 'string') return key;
  return JSON.stringify(key);
}

interface InternalQueryEntry<T = any> {
  state: QueryState<T>;
  fetcher?: () => Promise<T>;
  listeners: Set<() => void>;
  inflightPromise: Promise<T> | null;
  gcTimeout: any;
}

export class QueryClient {
  private cache = new Map<string, InternalQueryEntry>();

  private getEntry<T>(key: QueryKey): InternalQueryEntry<T> {
    const hash = hashQueryKey(key);
    let entry = this.cache.get(hash);
    if (!entry) {
      entry = {
        state: {
          data: undefined,
          error: null,
          status: 'idle',
          isLoading: false,
          isFetching: false,
          isSuccess: false,
          isError: false,
          dataUpdatedAt: 0
        },
        listeners: new Set(),
        inflightPromise: null,
        gcTimeout: null
      };
      this.cache.set(hash, entry);
    }
    return entry;
  }

  getQueryState<T>(key: QueryKey): QueryState<T> {
    return this.getEntry<T>(key).state;
  }

  getQueryData<T>(key: QueryKey): T | undefined {
    return this.getEntry<T>(key).state.data;
  }

  setQueryData<T>(key: QueryKey, updater: T | ((prev: T | undefined) => T)): T {
    const entry = this.getEntry<T>(key);
    const prev = entry.state.data;
    const next = typeof updater === 'function' ? (updater as (p: T | undefined) => T)(prev) : updater;

    entry.state = {
      ...entry.state,
      data: next,
      error: null,
      status: 'success',
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      dataUpdatedAt: Date.now()
    };

    entry.listeners.forEach((l) => l());
    return next;
  }

  async fetchQuery<T>(
    key: QueryKey,
    fetcher: () => Promise<T>,
    options: QueryOptions<T> = {}
  ): Promise<T> {
    const entry = this.getEntry<T>(key);
    entry.fetcher = fetcher;

    const { staleTime = 0 } = options;
    const isFresh =
      entry.state.dataUpdatedAt > 0 &&
      Date.now() - entry.state.dataUpdatedAt < staleTime;

    // Return cached data if still fresh
    if (isFresh && entry.state.data !== undefined) {
      return entry.state.data;
    }

    // Inflight Request Deduplication:
    // If a request for this query is already running, piggyback on that exact promise!
    if (entry.inflightPromise) {
      return entry.inflightPromise;
    }

    const isInitialLoad = entry.state.data === undefined;

    // Update state to fetching
    entry.state = {
      ...entry.state,
      isLoading: isInitialLoad,
      isFetching: true,
      status: isInitialLoad ? 'loading' : entry.state.status
    };
    entry.listeners.forEach((l) => l());

    const promise = (async () => {
      try {
        const result = await fetcher();
        entry.state = {
          data: result,
          error: null,
          status: 'success',
          isLoading: false,
          isFetching: false,
          isSuccess: true,
          isError: false,
          dataUpdatedAt: Date.now()
        };
        options.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error(String(err));
        entry.state = {
          ...entry.state,
          error,
          status: 'error',
          isLoading: false,
          isFetching: false,
          isSuccess: false,
          isError: true
        };
        options.onError?.(error);
        throw error;
      } finally {
        entry.inflightPromise = null;
        entry.listeners.forEach((l) => l());
      }
    })();

    entry.inflightPromise = promise;
    return promise;
  }

  async invalidateQueries(keyFilter?: QueryKey): Promise<void> {
    const filterHash = keyFilter ? hashQueryKey(keyFilter) : null;

    const promises: Promise<any>[] = [];

    for (const [hash, entry] of this.cache.entries()) {
      if (!filterHash || hash.startsWith(filterHash) || hash === filterHash) {
        entry.state = {
          ...entry.state,
          dataUpdatedAt: 0 // Mark as stale
        };

        if (entry.fetcher && entry.listeners.size > 0) {
          promises.push(this.fetchQuery(hash, entry.fetcher));
        } else {
          entry.listeners.forEach((l) => l());
        }
      }
    }

    await Promise.allSettled(promises);
  }

  subscribe(key: QueryKey, listener: () => void): () => void {
    const entry = this.getEntry(key);
    entry.listeners.add(listener);

    if (entry.gcTimeout) {
      clearTimeout(entry.gcTimeout);
      entry.gcTimeout = null;
    }

    return () => {
      entry.listeners.delete(listener);
      // Setup garbage collection if no more listeners
      if (entry.listeners.size === 0) {
        entry.gcTimeout = setTimeout(() => {
          this.cache.delete(hashQueryKey(key));
        }, 5 * 60 * 1000); // 5 min GC
      }
    };
  }

  clear() {
    this.cache.clear();
  }
}

// Global default QueryClient singleton
export const defaultQueryClient = new QueryClient();
