import { useSyncExternalStore, useEffect, useCallback, useRef } from 'react';
import { QueryKey, QueryOptions, QueryObserverResult } from './types';
import { defaultQueryClient, QueryClient } from './queryClient';

/**
 * Global Query & Caching hook with automatic request deduplication and Stale-While-Revalidate.
 * 
 * Examples:
 *   const { data, isLoading, isFetching, refetch } = useQuery(['users', id], () => fetchUser(id), { staleTime: 10000 });
 */
export function useQuery<T>(
  key: QueryKey,
  fetcher: () => Promise<T>,
  options: QueryOptions<T> = {},
  client: QueryClient = defaultQueryClient
): QueryObserverResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = true,
    pollInterval = 0,
    initialData
  } = options;

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Initialize data if not yet in cache
  if (initialData !== undefined && client.getQueryData(key) === undefined) {
    client.setQueryData(key, initialData);
  }

  const subscribe = useCallback(
    (listener: () => void) => {
      return client.subscribe(key, listener);
    },
    [key, client]
  );

  const getSnapshot = useCallback(() => {
    return client.getQueryState<T>(key);
  }, [key, client]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const executeFetch = useCallback(() => {
    if (!enabled) return Promise.resolve(state.data);
    return client.fetchQuery(key, () => fetcherRef.current(), optionsRef.current);
  }, [key, enabled, client, state.data]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      executeFetch().catch(() => {});
    }
  }, [key, enabled, executeFetch]);

  // Window Focus Refetching
  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus || typeof window === 'undefined') return;

    const onFocus = () => {
      executeFetch().catch(() => {});
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        onFocus();
      }
    });

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [enabled, refetchOnWindowFocus, executeFetch]);

  // Polling Interval
  useEffect(() => {
    if (!enabled || !pollInterval || pollInterval <= 0) return;

    const timer = setInterval(() => {
      executeFetch().catch(() => {});
    }, pollInterval);

    return () => clearInterval(timer);
  }, [enabled, pollInterval, executeFetch]);

  const mutate = useCallback(
    (updater: T | ((prev: T | undefined) => T)) => {
      client.setQueryData(key, updater);
    },
    [key, client]
  );

  return {
    ...state,
    refetch: executeFetch,
    mutate
  };
}
