import React, { ReactNode, useState, useEffect } from 'react';

export interface AwaitProps<T> {
  /** Promise or async function to resolve */
  for: Promise<T> | (() => Promise<T>);
  /** Optional fallback while resolving */
  loading?: ReactNode;
  /** Fallback or error renderer when rejected */
  error?: ReactNode | ((err: Error) => ReactNode);
  /** Render function when promise resolves */
  children: (data: T) => ReactNode;
}

/**
 * Declarative promise resolution inside JSX.
 * 
 * uReact:
 *   <Await for={fetchUserProfile} loading={<Skeleton />} error={err => <Alert message={err.message} />}>
 *     {(user) => <UserCard user={user} />}
 *   </Await>
 */
export function Await<T>({
  for: promiseOrFn,
  loading = null,
  error: errorRender = null,
  children
}: AwaitProps<T>): React.ReactElement | null {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErr(null);

    const promise = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;

    promise
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((e) => {
        if (isMounted) {
          setErr(e instanceof Error ? e : new Error(String(e)));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [promiseOrFn]);

  if (isLoading) {
    return <>{loading}</>;
  }

  if (err) {
    if (typeof errorRender === 'function') {
      return <>{errorRender(err)}</>;
    }
    return <>{errorRender}</>;
  }

  return <>{children(data as T)}</>;
}
