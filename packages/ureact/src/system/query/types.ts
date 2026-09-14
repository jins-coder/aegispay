export type QueryKey = string | readonly any[];

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface QueryOptions<T> {
  /** How long (in ms) data remains 'fresh'. While fresh, cached data is returned without refetching. Default: 0 */
  staleTime?: number;
  /** How long (in ms) unused queries remain in memory before garbage collection. Default: 5 minutes */
  cacheTime?: number;
  /** Automatically refetch when browser window regains focus. Default: true */
  refetchOnWindowFocus?: boolean;
  /** Polling interval in ms for continuous background updates. Default: 0 (disabled) */
  pollInterval?: number;
  /** Initial fallback data */
  initialData?: T;
  /** Whether the query should automatically run. Default: true */
  enabled?: boolean;
  /** Callback fired on success */
  onSuccess?: (data: T) => void;
  /** Callback fired on error */
  onError?: (error: Error) => void;
}

export interface QueryState<T> {
  data: T | undefined;
  error: Error | null;
  status: QueryStatus;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  dataUpdatedAt: number;
}

export interface QueryObserverResult<T> extends QueryState<T> {
  refetch: () => Promise<T | undefined>;
  mutate: (newData: T | ((prev: T | undefined) => T)) => void;
}

export interface MutationOptions<TData, TVariables, TContext = unknown> {
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => Promise<void> | void;
  onError?: (error: Error, variables: TVariables, context: TContext | undefined) => Promise<void> | void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables, context: TContext | undefined) => Promise<void> | void;
}

export interface MutationResult<TData, TVariables> {
  data: TData | undefined;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}
