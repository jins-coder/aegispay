import React, { ReactNode } from 'react';

export interface WhenProps<T> {
  is: T | boolean | null | undefined;
  then: ReactNode | ((val: NonNullable<T>) => ReactNode);
  else?: ReactNode;
}

/**
 * Ultra-concise conditional renderer.
 * 
 * Standard React:
 *   {isLoggedIn ? <Dashboard /> : <Login />}
 * 
 * uReact:
 *   <When is={isLoggedIn} then={<Dashboard />} else={<Login />} />
 */
export function When<T>({ is, then: thenNode, else: elseNode = null }: WhenProps<T>): React.ReactElement | null {
  if (Boolean(is)) {
    if (typeof thenNode === 'function') {
      return <>{(thenNode as (val: NonNullable<T>) => ReactNode)(is as NonNullable<T>)}</>;
    }
    return <>{thenNode}</>;
  }
  return <>{elseNode}</>;
}
