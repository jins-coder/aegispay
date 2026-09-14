import React, { ReactNode } from 'react';
import { useActionStatus } from './useAction';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText?: ReactNode;
  children: ReactNode;
}

/**
 * React 19 Action Button with automatic form pending status integration.
 */
export function ActionButton({
  children,
  pendingText,
  disabled,
  className = 'btn btn-primary',
  ...rest
}: ActionButtonProps): React.ReactElement {
  const status = useActionStatus();
  const isPending = status?.pending;

  return (
    <button
      type="submit"
      disabled={isPending || disabled}
      className={className}
      {...rest}
    >
      {isPending && pendingText ? pendingText : children}
    </button>
  );
}
