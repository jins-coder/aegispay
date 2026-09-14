import React, { ReactNode, useState, useEffect } from 'react';

export interface FetchProps<T> {
  from: () => Promise<T>;
  loading?: ReactNode;
  error?: ReactNode | ((err: Error) => ReactNode);
  children: (data: T) => ReactNode;
}

/**
 * Hyper-concise single-block async data loader.
 * Eliminates 20+ lines of useState + useEffect + loading/error check boilerplate.
 * 
 * Example:
 *   <Fetch from={fetchUsers} loading={<Spinner />} error={e => <ErrorBox err={e} />}>
 *     {(users) => <UserGrid items={users} />}
 *   </Fetch>
 */
export function Fetch<T>({
  from: fetcher,
  loading = null,
  error: errorRender = null,
  children
}: FetchProps<T>): React.ReactElement | null {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    fetcher()
      .then((res) => {
        if (mounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [fetcher]);

  if (isLoading) return <>{loading}</>;
  if (error) {
    if (typeof errorRender === 'function') {
      return <>{errorRender(error)}</>;
    }
    return <>{errorRender}</>;
  }

  return <>{children(data as T)}</>;
}
