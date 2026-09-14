import React, { Component, ErrorInfo, ReactNode } from 'react';
import { devToolsRegistry } from '../core/devtoolsRegistry';

export interface CatchFallbackProps {
  error: Error;
  reset: () => void;
}

export type CatchFallback =
  | ReactNode
  | ((error: Error, reset: () => void) => ReactNode);

export interface CatchProps {
  children?: ReactNode;
  fallback?: CatchFallback;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: any[];
  isolateScope?: string;
  silent?: boolean;
}

interface CatchState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * <Catch> / <Isolated> / <ErrorBoundary>
 * 
 * Component-level fault isolation. If a wrapped component crashes or throws,
 * only that specific component is replaced with a resilient fallback,
 * while the rest of the application tree continues to run without issue.
 */
export class CatchBoundary extends Component<CatchProps, CatchState> {
  public override state: CatchState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<CatchState> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    if (!this.props.silent) {
      console.warn(
        `[uReact:Catch] Fault isolated in component "${this.props.isolateScope || 'Component'}":`,
        error
      );
    }

    // Report to uReact Quantum DevTools telemetry if available
    try {
      devToolsRegistry.logMutation(
        'ureact-fault-isolation',
        this.props.isolateScope || 'IsolatedComponent',
        {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        },
        0.1
      );
    } catch (_) {}

    this.props.onError?.(error, errorInfo);
  }

  public override componentDidUpdate(prevProps: CatchProps) {
    if (!this.state.hasError) return;

    // If resetKeys changed, automatically reset error state
    if (this.props.resetKeys && prevProps.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, idx) => key !== prevProps.resetKeys![idx]
      );
      if (hasChanged) {
        this.reset();
      }
    }
  }

  public reset = () => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  public override render() {
    if (this.state.hasError && this.state.error) {
      // 1. Custom function fallback
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.reset);
      }

      // 2. Custom ReactNode fallback
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      // 3. Default sleek uReact Resilient Fault-Isolation Card
      return (
        <div
          role="alert"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            padding: '16px 20px',
            margin: '12px 0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#f8fafc',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                fontSize: '16px',
                fontWeight: 700
              }}>
                ⚠
              </span>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fca5a5' }}>
                  Component Fault Isolated {this.props.isolateScope ? `(${this.props.isolateScope})` : ''}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#cbd5e1' }}>
                  This component encountered an error, but all other components continue to run without issue.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={this.reset}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fef2f2',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                ↻ Retry
              </button>

              <button
                type="button"
                onClick={this.toggleDetails}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#94a3b8',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {this.state.showDetails ? 'Hide Error' : 'Details'}
              </button>
            </div>
          </div>

          <div style={{
            marginTop: '10px',
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.35)',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#f87171',
            overflowX: 'auto'
          }}>
            {this.state.error.message || 'Unknown render error'}
          </div>

          {this.state.showDetails && (
            <pre style={{
              marginTop: '10px',
              padding: '12px',
              background: '#090d16',
              borderRadius: '6px',
              color: '#94a3b8',
              fontSize: '11px',
              lineHeight: 1.5,
              overflowX: 'auto',
              maxHeight: '180px'
            }}>
              {this.state.error.stack || 'No stack trace available'}
              {this.state.errorInfo?.componentStack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Aliases for declarative convenience:
 */
export const Catch = CatchBoundary;
export const Isolated = CatchBoundary;
export const ErrorBoundary = CatchBoundary;

/**
 * Higher-Order Component to make any component inherently fault-tolerant.
 * 
 * @example
 * const SafeWidget = isolate(FlakyWidget);
 */
export function isolate<P extends object>(
  Component: React.ComponentType<P>,
  options?: CatchFallback | Omit<CatchProps, 'children'>
): React.FC<P> {
  const isFallbackOnly =
    options !== undefined &&
    (typeof options === 'function' || React.isValidElement(options) || typeof options === 'string');

  const catchProps: Omit<CatchProps, 'children'> = isFallbackOnly
    ? { fallback: options as CatchFallback }
    : ((options as Omit<CatchProps, 'children'>) || {});

  const Wrapped: React.FC<P> = (props) => (
    <CatchBoundary {...catchProps} isolateScope={catchProps.isolateScope || Component.displayName || Component.name}>
      <Component {...props} />
    </CatchBoundary>
  );

  Wrapped.displayName = `Isolated(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}

export const withCatch = isolate;
