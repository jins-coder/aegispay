import React from 'react';

/**
 * React 19 native promise unwrapping hook with Suspense.
 * Resolves promises directly during render without useState or useEffect ceremony!
 * 
 * Includes native React 19 `use(promise)` with a resilient Suspense unwrapping fallback.
 * 
 * Usage:
 *   <Suspense fallback={<Spinner />}>
 *     <UserProfile userPromise={userPromise} />
 *   </Suspense>
 * 
 *   function UserProfile({ userPromise }) {
 *     const user = usePromise(userPromise);
 *     return <div>{user.name}</div>;
 *   }
 */
export function usePromise<T>(promise: Promise<T>): T {
  const p = promise as any;
  if (p && !p.status && typeof p.then === 'function') {
    p.status = 'pending';
    p.then(
      (val: any) => {
        p.status = 'fulfilled';
        p.value = val;
      },
      (err: any) => {
        p.status = 'rejected';
        p.reason = err;
      }
    );
  }

  // React 19 native use()
  const nativeUse = (React as any).use;
  if (typeof nativeUse === 'function') {
    try {
      return nativeUse(promise);
    } catch (thrown: any) {
      // If thrown is a Promise or an Error, rethrow for React Suspense or ErrorBoundary
      throw thrown;
    }
  }

  // Resilient React Suspense unwrapping fallback
  if (p && p.status === 'fulfilled') {
    return p.value;
  } else if (p && p.status === 'rejected') {
    throw p.reason;
  } else {
    // Suspend execution in Suspense boundary
    throw promise;
  }
}
