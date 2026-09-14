import { useState, useCallback } from 'react';

export interface UseToggleReturn {
  value: boolean;
  toggle: (override?: boolean) => void;
  setTrue: () => void;
  setFalse: () => void;
  set: (val: boolean) => void;
}

/**
 * Boolean toggler with handy preset actions.
 * 
 * Usage:
 *   const modal = useToggle(false);
 *   <button onClick={modal.toggle}>Toggle</button>
 *   <button onClick={modal.setFalse}>Close</button>
 */
export function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback((override?: boolean) => {
    setValue((prev) => (typeof override === 'boolean' ? override : !prev));
  }, []);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const set = useCallback((val: boolean) => setValue(val), []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    set
  };
}
