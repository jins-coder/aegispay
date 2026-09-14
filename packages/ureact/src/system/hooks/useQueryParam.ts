import { useState, useEffect, useCallback } from 'react';

/**
 * Two-way reactive URL search query parameter synchronization.
 * 
 * Usage:
 *   const [view, setView] = useQueryParam('view', 'grid');
 *   // setView('list') updates the URL query string and re-renders components!
 */
export function useQueryParam(
  param: string,
  defaultValue: string = ''
): [string, (value: string | ((prev: string) => string)) => void] {
  const getParam = useCallback(() => {
    if (typeof window === 'undefined') return defaultValue;
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param) ?? defaultValue;
  }, [param, defaultValue]);

  const [value, setValueState] = useState<string>(getParam);

  useEffect(() => {
    const handlePopState = () => {
      setValueState(getParam());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [getParam]);

  const setParam = useCallback(
    (newValue: string | ((prev: string) => string)) => {
      if (typeof window === 'undefined') return;

      const current = getParam();
      const next = typeof newValue === 'function' ? (newValue as (p: string) => string)(current) : newValue;

      const url = new URL(window.location.href);
      if (next === defaultValue || next === '') {
        url.searchParams.delete(param);
      } else {
        url.searchParams.set(param, next);
      }

      window.history.pushState({}, '', url.toString());
      setValueState(next);
      window.dispatchEvent(new PopStateEvent('popstate'));
    },
    [param, defaultValue, getParam]
  );

  return [value, setParam];
}
