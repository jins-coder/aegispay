import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseAsyncOptions<T, Args extends any[] = any[]> {
  /** If true, executes automatically on mount or when dependencies change. Default: true */
  immediate?: boolean;
  /** Dependencies that trigger re-execution when changed */
  deps?: any[];
  /** Initial fallback data */
  initialData?: T;
  /** Callback fired on successful promise resolution */
  onSuccess?: (data: T) => void;
  /** Callback fired on promise rejection */
  onError?: (error: Error) => void;
  /** Optional delay before triggering (useful for search input triggers) */
  debounceMs?: number;
}

export interface UseAsyncResult<T, Args extends any[] = any[]> {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  /** Execute the async task with custom arguments */
  execute: (...args: Args) => Promise<T | undefined>;
  /** Re-run the last execution */
  refresh: () => Promise<T | undefined>;
  /** Optimistically mutate the local data without re-fetching */
  mutate: (newData: T | ((prev: T | undefined) => T)) => void;
  /** Reset to initial state */
  reset: () => void;
}

/**
 * Zero-ceremony async task runner.
 * Handles loading, errors, cancellation, race conditions, and optimistic mutations.
 */
export function useAsync<T, Args extends any[] = any[]>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T, Args> = {}
): UseAsyncResult<T, Args> {
  const {
    immediate = true,
    deps = [],
    initialData,
    onSuccess,
    onError,
    debounceMs = 0
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(immediate ? 'loading' : 'idle');

  const asyncFnRef = useRef(asyncFn);
  asyncFnRef.current = asyncFn;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const callIdRef = useRef(0);
  const lastArgsRef = useRef<Args>([] as any);
  const isMountedRef = useRef(true);
  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const execute = useCallback(
    (...args: Args): Promise<T | undefined> => {
      lastArgsRef.current = args;
      const currentCallId = ++callIdRef.current;

      return new Promise<T | undefined>((resolve) => {
        const run = async () => {
          if (!isMountedRef.current) return;
          setLoading(true);
          setStatus('loading');
          setError(null);

          try {
            const result = await asyncFnRef.current(...args);

            // Guard against race conditions and unmounts
            if (isMountedRef.current && currentCallId === callIdRef.current) {
              setData(result);
              setLoading(false);
              setStatus('success');
              optionsRef.current.onSuccess?.(result);
              resolve(result);
            }
          } catch (err: any) {
            if (isMountedRef.current && currentCallId === callIdRef.current) {
              const formattedErr = err instanceof Error ? err : new Error(String(err));
              setError(formattedErr);
              setLoading(false);
              setStatus('error');
              optionsRef.current.onError?.(formattedErr);
              resolve(undefined);
            }
          }
        };

        if (debounceMs > 0) {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = setTimeout(run, debounceMs);
        } else {
          run();
        }
      });
    },
    [debounceMs]
  );

  const refresh = useCallback(() => {
    return execute(...lastArgsRef.current);
  }, [execute]);

  const mutate = useCallback((newData: T | ((prev: T | undefined) => T)) => {
    setData((prev) => {
      const next = typeof newData === 'function' ? (newData as (prev: T | undefined) => T)(prev) : newData;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    callIdRef.current++;
    setData(initialData);
    setError(null);
    setLoading(false);
    setStatus('idle');
  }, [initialData]);

  useEffect(() => {
    if (immediate) {
      execute(...([] as any));
    }
  }, deps);

  return {
    data,
    error,
    loading,
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle',
    execute,
    refresh,
    mutate,
    reset
  };
}
