export type ActionFn<TInput, TOutput> = (prevState: TOutput, payload: TInput) => Promise<TOutput> | TOutput;

export interface UseActionOptions<TInput, TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: Error) => void;
  optimisticUpdate?: (prevState: TOutput, payload: TInput) => TOutput;
}

export interface UseActionResult<TInput, TOutput> {
  data: TOutput;
  isPending: boolean;
  error: Error | null;
  run: (payload: TInput) => void;
  formAction: (payload: FormData | TInput) => void;
  reset: () => void;
}
