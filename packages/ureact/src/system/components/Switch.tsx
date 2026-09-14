import React, { ReactNode, isValidElement } from 'react';

export interface CaseProps {
  when: any;
  children: ReactNode;
}

export interface DefaultProps {
  children: ReactNode;
}

export interface SwitchProps {
  fallback?: ReactNode;
  children: ReactNode;
}

export function Case({ children }: CaseProps): React.ReactElement | null {
  return <>{children}</>;
}

export function Default({ children }: DefaultProps): React.ReactElement | null {
  return <>{children}</>;
}

/**
 * Clean multi-branch conditional rendering without nested ternaries or IIFEs.
 * 
 * Standard React:
 *   {status === 'loading' ? <Loading /> : status === 'error' ? <Error /> : <Success />}
 * 
 * uReact:
 *   <Switch fallback={<DefaultState />}>
 *     <Case when={status === 'loading'}><Loading /></Case>
 *     <Case when={status === 'error'}><Error /></Case>
 *     <Case when={status === 'success'}><Success /></Case>
 *   </Switch>
 */
export function Switch({ fallback = null, children }: SwitchProps): React.ReactElement | null {
  let defaultNode: ReactNode = fallback;
  const childArray = React.Children.toArray(children);

  for (const child of childArray) {
    if (isValidElement(child)) {
      if (child.type === Case) {
        const { when, children: caseChildren } = child.props as CaseProps;
        if (Boolean(when)) {
          return <>{caseChildren}</>;
        }
      } else if (child.type === Default) {
        defaultNode = (child.props as DefaultProps).children;
      }
    }
  }

  return <>{defaultNode}</>;
}
