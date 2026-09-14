import React, { ReactNode } from 'react';

export interface ShowProps<T> {
  /** Condition or truthy value to evaluate */
  when: T | boolean | null | undefined;
  /** Fallback JSX rendered when condition is falsy */
  fallback?: ReactNode;
  /** Children can be normal ReactNode or a render function receiving the truthy value */
  children: ReactNode | ((item: NonNullable<T>) => ReactNode);
}

/**
 * Eliminates ternary spaghetti in JSX.
 * 
 * Standard React:
 *   {isLoading ? <Spinner /> : user ? <Profile user={user} /> : <Guest />}
 * 
 * uReact:
 *   <Show when={user} fallback={<Guest />}>
 *     {(u) => <Profile user={u} />}
 *   </Show>
 */
export function Show<T>({ when, fallback = null, children }: ShowProps<T>): React.ReactElement | null {
  if (!when) {
    return <>{fallback}</>;
  }

  if (typeof children === 'function') {
    return <>{(children as (item: NonNullable<T>) => ReactNode)(when as NonNullable<T>)}</>;
  }

  return <>{children}</>;
}
