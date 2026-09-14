import React, { FormEvent } from 'react';
import { Store } from '../core/types';
import { bind } from '../core/bind';
import { useStore } from '../core/state';

export interface FieldOption {
  label: string;
  value: any;
}

export interface AutoFormFieldConfig {
  label?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'checkbox' | 'textarea' | 'select';
  placeholder?: string;
  options?: (string | FieldOption)[];
  disabled?: boolean;
}

export interface AutoFormProps<T extends object> {
  store: Store<T>;
  fields?: (keyof T)[] | Partial<Record<keyof T, AutoFormFieldConfig>>;
  onSubmit?: (data: T) => void | Promise<void>;
  submitText?: string;
  className?: string;
  style?: React.CSSProperties;
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Single-tag reactive AutoForm component.
 * 
 * Inspects any Store and automatically generates two-way bound form controls
 * with zero repetitive boilerplate.
 * 
 * Example:
 *   const user = createStore({ name: 'Alex', email: 'alex@work.com', active: true });
 * 
 *   // In JSX:
 *   <AutoForm store={user} onSubmit={(data) => api.save(data)} />
 */
export function AutoForm<T extends object>({
  store,
  fields,
  onSubmit,
  submitText = 'Save Changes',
  className = '',
  style = {}
}: AutoFormProps<T>): React.ReactElement {
  useStore(store);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(store.state);
    }
  };

  // Determine field keys to render
  let fieldKeys: (keyof T)[];
  let fieldConfigs: Partial<Record<keyof T, AutoFormFieldConfig>> = {};

  if (Array.isArray(fields)) {
    fieldKeys = fields;
  } else if (fields && typeof fields === 'object') {
    fieldKeys = Object.keys(fields) as (keyof T)[];
    fieldConfigs = fields;
  } else {
    fieldKeys = Object.keys(store.state) as (keyof T)[];
  }

  return (
    <form onSubmit={handleSubmit} className={`ureact-auto-form ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '16px', ...style }}>
      {fieldKeys.map((key) => {
        const val = (store.state as any)[key];
        const config = fieldConfigs[key] || {};
        const labelText = config.label || formatLabel(String(key));
        const valType = typeof val;
        const inputType = config.type || (valType === 'boolean' ? 'checkbox' : valType === 'number' ? 'number' : 'text');
        const binding = bind(store, key);

        if (inputType === 'checkbox') {
          return (
            <label
              key={String(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: '0.9rem',
                color: 'var(--text-main, #f8fafc)'
              }}
            >
              <input
                type="checkbox"
                {...binding}
                disabled={config.disabled}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan, #38bdf8)', cursor: 'pointer' }}
              />
              <span>{labelText}</span>
            </label>
          );
        }

        if (inputType === 'select' && config.options) {
          return (
            <div key={String(key)} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>
                {labelText}
              </label>
              <select
                {...binding}
                disabled={config.disabled}
                className="input"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: 'var(--text-main, #f8fafc)',
                  outline: 'none'
                }}
              >
                {config.options.map((opt, i) => {
                  const label = typeof opt === 'string' ? opt : opt.label;
                  const value = typeof opt === 'string' ? opt : opt.value;
                  return (
                    <option key={i} value={value} style={{ background: '#1e293b', color: '#fff' }}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        }

        if (inputType === 'textarea') {
          return (
            <div key={String(key)} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>
                {labelText}
              </label>
              <textarea
                {...binding}
                placeholder={config.placeholder}
                disabled={config.disabled}
                rows={3}
                className="input"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: 'var(--text-main, #f8fafc)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          );
        }

        return (
          <div key={String(key)} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>
              {labelText}
            </label>
            <input
              type={inputType}
              {...binding}
              placeholder={config.placeholder}
              disabled={config.disabled}
              className="input"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'var(--text-main, #f8fafc)',
                outline: 'none'
              }}
            />
          </div>
        );
      })}

      {onSubmit && (
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            marginTop: '8px',
            alignSelf: 'flex-start',
            padding: '8px 18px',
            fontWeight: 600
          }}
        >
          {submitText}
        </button>
      )}
    </form>
  );
}
