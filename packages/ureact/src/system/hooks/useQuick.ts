import { useState, useCallback } from 'react';

/**
 * 1-line counter with built-in increment and decrement actions.
 */
export function useCounter(initialValue: number = 0) {
  const [value, setValue] = useState(initialValue);

  const inc = useCallback((delta: number = 1) => setValue((c) => c + delta), []);
  const dec = useCallback((delta: number = 1) => setValue((c) => c - delta), []);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return {
    value,
    inc,
    dec,
    reset,
    set: setValue
  };
}

/**
 * 1-line array manager with built-in push, remove, and clear methods.
 */
export function useArray<T>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);

  const push = useCallback((item: T) => setItems((prev) => [...prev, item]), []);
  const remove = useCallback((index: number) => setItems((prev) => prev.filter((_, i) => i !== index)), []);
  const clear = useCallback(() => setItems([]), []);
  const reset = useCallback(() => setItems(initialItems), [initialItems]);

  return {
    items,
    push,
    remove,
    clear,
    reset,
    set: setItems
  };
}
