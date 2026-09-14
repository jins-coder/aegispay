import React, { createContext, useContext, useTransition, useState, ReactNode, FormEvent } from 'react';

export interface ActionFormContextValue {
  isPending: boolean;
  error: any;
  status: 'idle' | 'pending' | 'success' | 'error';
}

const ActionFormContext = createContext<ActionFormContextValue>({
  isPending: false,
  error: null,
  status: 'idle'
});

/**
 * Hook to consume parent <ActionForm> submission status.
 */
export function useActionFormStatus(): ActionFormContextValue {
  return useContext(ActionFormContext);
}

export interface ActionFormProps {
  /** Async or sync action handler */
  action: (formData: FormData) => void | Promise<any>;
  /** Optional callback on successful execution */
  onSuccess?: (result: any) => void;
  /** Optional callback on error */
  onError?: (err: any) => void;
  /** Children elements */
  children: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Reset form inputs upon successful submission */
  resetOnSuccess?: boolean;
}

/**
 * React 19 Action Form component.
 * 
 * Eliminates e.preventDefault(), useState(isSubmitting), and manual try/catch ceremony.
 * 
 * Example:
 *   <ActionForm action={async (formData) => await api.update(formData)}>
 *     <input name="email" />
 *     <ActionSubmitButton>Save</ActionSubmitButton>
 *   </ActionForm>
 */
export function ActionForm({
  action,
  onSuccess,
  onError,
  children,
  className = '',
  style = {},
  resetOnSuccess = false
}: ActionFormProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setError(null);
    setStatus('pending');

    startTransition(async () => {
      try {
        const res = await action(formData);
        setStatus('success');
        if (resetOnSuccess) {
          form.reset();
        }
        if (onSuccess) {
          onSuccess(res);
        }
      } catch (err) {
        setError(err);
        setStatus('error');
        if (onError) {
          onError(err);
        }
      }
    });
  };

  return (
    <ActionFormContext.Provider value={{ isPending, error, status }}>
      <form onSubmit={handleSubmit} className={`ureact-action-form ${className}`} style={style}>
        {children}
      </form>
    </ActionFormContext.Provider>
  );
}

export interface ActionSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText?: ReactNode;
  children: ReactNode;
}

/**
 * Button that automatically disables and shows a loading state during <ActionForm> submission.
 */
export function ActionSubmitButton({
  children,
  pendingText = 'Saving...',
  disabled,
  className = 'btn btn-primary',
  ...rest
}: ActionSubmitButtonProps): React.ReactElement {
  const { isPending } = useActionFormStatus();

  return (
    <button
      type="submit"
      disabled={isPending || disabled}
      className={className}
      {...rest}
    >
      {isPending ? pendingText : children}
    </button>
  );
}
