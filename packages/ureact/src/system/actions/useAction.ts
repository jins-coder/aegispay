import React, { useState, useCallback, useTransition, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { ActionFn, UseActionOptions, UseActionResult } from './types';

// Resilient fallback for useActionState when running on React 18 or un-polyfilled environments
function useActionStateFallback<TState, TPayload>(
  action: (state: Awaited<TState>, payload: TPayload) => Promise<Awaited<TState>>,
  initialState: Awaited<TState>
): [Awaited<TState>, (payload: TPayload) => void, boolean] {
  const [state, setState] = useState<Awaited<TState>>(initialState);
  const [isPending, startTransition] = useTransition();

  const formAction = useCallback(
    (payload: TPayload) => {
      startTransition(async () => {
        const nextState = await action(state, payload);
        setState(nextState);
      });
    },
    [action, state]
  );

  return [state, formAction, isPending];
}

// Resilient fallback for useOptimistic when running on React 18 or un-polyfilled environments
function useOptimisticFallback<TState, TUpdate>(
  passthrough: TState,
  updateFn: (current: TState, update: TUpdate) => TState
): [TState, (update: TUpdate) => void] {
  const [optimisticState, setOptimisticState] = useState<TState>(passthrough);

  useEffect(() => {
    setOptimisticState(passthrough);
  }, [passthrough]);

  const setOptimistic = useCallback(
    (update: TUpdate) => {
      setOptimisticState((current) => updateFn(current, update));
    },
    [updateFn]
  );

  return [optimisticState, setOptimistic];
}

const nativeActionState = (React as any).useActionState;
export const useActionStateImpl = typeof nativeActionState === 'function' ? nativeActionState : useActionStateFallback;

const nativeOptimistic = (React as any).useOptimistic;
export const useOptimisticImpl = typeof nativeOptimistic === 'function' ? nativeOptimistic : useOptimisticFallback;

/**
 * Supercharged React 19 Action hook.
 * Built directly on top of React 19's `useActionState` and `useOptimistic`.
 * 
 * Automatically handles:
 * - Direct typed payloads or FormDatas
 * - React 19 concurrent transition pending states
 * - Instant optimistic updates via `useOptimistic`
 */
export function useAction<TInput, TOutput>(
  actionFn: ActionFn<TInput, TOutput>,
  initialState: TOutput,
  options: UseActionOptions<TInput, TOutput> = {}
): UseActionResult<TInput, TOutput> {
  const { onSuccess, onError, optimisticUpdate } = options;
  const [error, setError] = useState<Error | null>(null);

  // Wrap action handler with error capture
  const wrappedAction = async (prevState: Awaited<TOutput>, payload: TInput | FormData): Promise<Awaited<TOutput>> => {
    setError(null);
    try {
      let actualInput: TInput;
      if (payload instanceof FormData) {
        const obj: any = {};
        payload.forEach((val, key) => {
          obj[key] = val;
        });
        actualInput = obj as TInput;
      } else {
        actualInput = payload as TInput;
      }

      const result = await actionFn(prevState as TOutput, actualInput);
      onSuccess?.(result);
      return result as Awaited<TOutput>;
    } catch (err: any) {
      const formattedErr = err instanceof Error ? err : new Error(String(err));
      setError(formattedErr);
      onError?.(formattedErr);
      return prevState;
    }
  };

  // React 19 native useActionState with resilient fallback
  const [state, formAction, isPending]: [TOutput, (payload: any) => void, boolean] = (useActionStateImpl as any)(
    wrappedAction,
    initialState
  );

  // React 19 native useOptimistic with resilient fallback
  const [optimisticState, setOptimistic] = (useOptimisticImpl as any)(
    state,
    (current: TOutput, input: TInput) => {
      if (optimisticUpdate) {
        return optimisticUpdate(current, input);
      }
      return current;
    }
  );

  const [isManualPending, startTransition] = useTransition();

  const run = useCallback(
    (input: TInput) => {
      startTransition(() => {
        if (optimisticUpdate) {
          setOptimistic(input);
        }
        formAction(input);
      });
    },
    [formAction, optimisticUpdate, setOptimistic]
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    data: optimisticState,
    isPending: isPending || isManualPending,
    error,
    run,
    formAction: formAction as any,
    reset
  };
}

/**
 * Access pending status from any nested component inside a React 19 form action.
 */
export function useActionStatus() {
  try {
    const status = useFormStatus();
    return status || { pending: false, data: null, method: null, action: null };
  } catch {
    return { pending: false, data: null, method: null, action: null };
  }
}

