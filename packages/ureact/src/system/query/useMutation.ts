import { useState, useCallback, useRef } from 'react';
import { MutationOptions, MutationResult } from './types';

/**
 * Mutation hook for data creation, updates, and deletes with optimistic update rollbacks.
 * 
 * Examples:
 *   const { mutate, isLoading } = useMutation((newTodo) => api.post('/todos', newTodo), {
 *     onMutate: async (newTodo) => { ... },
 *     onSuccess: () => queryClient.invalidateQueries(['todos'])
 *   });
 */
export function useMutation<TData = unknown, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TVariables, TContext> = {}
): MutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const mutationFnRef = useRef(mutationFn);
  mutationFnRef.current = mutationFn;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setStatus('loading');
      setError(null);

      let context: TContext | undefined;
      try {
        if (optionsRef.current.onMutate) {
          context = await optionsRef.current.onMutate(variables);
        }

        const result = await mutationFnRef.current(variables);
        setData(result);
        setStatus('success');
        setIsLoading(false);

        await optionsRef.current.onSuccess?.(result, variables, context);
        await optionsRef.current.onSettled?.(result, null, variables, context);

        return result;
      } catch (err: any) {
        const formattedErr = err instanceof Error ? err : new Error(String(err));
        setError(formattedErr);
        setStatus('error');
        setIsLoading(false);

        await optionsRef.current.onError?.(formattedErr, variables, context);
        await optionsRef.current.onSettled?.(undefined, formattedErr, variables, context);

        throw formattedErr;
      }
    },
    []
  );

  const mutate = useCallback(
    (variables: TVariables) => {
      mutateAsync(variables).catch(() => {});
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
    setStatus('idle');
  }, []);

  return {
    data,
    error,
    isLoading,
    isSuccess: status === 'success',
    isError: status === 'error',
    mutate,
    mutateAsync,
    reset
  };
}
