import { createStore } from './state';
import { Store, Listener, Unsubscribe } from './types';

export type ValidatorFn<T = any> = (value: T, allValues: any) => string | undefined;

export interface ValidationRuleSet<T> {
  [K: string]: ValidatorFn[] | ValidatorFn;
}

export interface FormOptions<T extends Record<string, any>> {
  initialValues: T;
  rules?: Partial<{ [K in keyof T]: ValidatorFn<T[K]> | ValidatorFn<T[K]>[] }>;
  validateOn?: 'blur' | 'change' | 'submit';
  onSubmit?: (values: T) => Promise<void> | void;
}

export interface FormStore<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  $bind: {
    [K in keyof T]: {
      name: string;
      value: any;
      checked?: boolean;
      onChange: (e: any) => void;
      onBlur: () => void;
    };
  };
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: <K extends keyof T>(field: K, error?: string) => void;
  setFieldTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  validateField: <K extends keyof T>(field: K) => string | undefined;
  validateAll: () => boolean;
  reset: () => void;
  handleSubmit: (onSubmit?: (values: T) => Promise<void> | void) => (e?: any) => Promise<void>;
  subscribe: (listener: Listener) => Unsubscribe;
  getSnapshot: () => any;
}

/**
 * Built-in validation rules for standard form fields
 */
export const rules = {
  required: (message = 'This field is required'): ValidatorFn => (val) => {
    if (val === undefined || val === null || val === '') return message;
    if (Array.isArray(val) && val.length === 0) return message;
    if (typeof val === 'boolean' && !val) return message;
    return undefined;
  },

  email: (message = 'Please enter a valid email address'): ValidatorFn => (val) => {
    if (!val) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(val)) ? undefined : message;
  },

  minLength: (min: number, message?: string): ValidatorFn => (val) => {
    if (!val) return undefined;
    const msg = message || `Must be at least ${min} characters`;
    return String(val).length >= min ? undefined : msg;
  },

  maxLength: (max: number, message?: string): ValidatorFn => (val) => {
    if (!val) return undefined;
    const msg = message || `Must be at most ${max} characters`;
    return String(val).length <= max ? undefined : msg;
  },

  min: (minVal: number, message?: string): ValidatorFn => (val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    const msg = message || `Must be at least ${minVal}`;
    return !isNaN(num) && num >= minVal ? undefined : msg;
  },

  max: (maxVal: number, message?: string): ValidatorFn => (val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    const msg = message || `Must be at most ${maxVal}`;
    return !isNaN(num) && num <= maxVal ? undefined : msg;
  },

  pattern: (regex: RegExp, message = 'Invalid format'): ValidatorFn => (val) => {
    if (!val) return undefined;
    return regex.test(String(val)) ? undefined : message;
  },

  match: (otherField: string, message = 'Fields do not match'): ValidatorFn => (val, allValues) => {
    return allValues && val === allValues[otherField] ? undefined : message;
  },

  custom: (validator: (val: any, all: any) => string | undefined): ValidatorFn => validator,
};

/**
 * Creates a reactive form store with built-in validation, dirty checking,
 * touch state tracking, and direct two-way element binding.
 * 
 * @example
 * ```tsx
 * const form = createFormStore({
 *   initialValues: { email: '', password: '' },
 *   rules: {
 *     email: [rules.required(), rules.email()],
 *     password: [rules.required(), rules.minLength(8)]
 *   },
 *   onSubmit: async (values) => {
 *     await api.login(values);
 *   }
 * });
 * 
 * function LoginForm() {
 *   return (
 *     <form onSubmit={form.handleSubmit()}>
 *       <input {...form.$bind.email} placeholder="Email" />
 *       {form.touched.email && form.errors.email && <span>{form.errors.email}</span>}
 *       
 *       <input {...form.$bind.password} type="password" placeholder="Password" />
 *       <button disabled={!form.isValid || form.isSubmitting}>Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function createFormStore<T extends Record<string, any>>(options: FormOptions<T>): FormStore<T> {
  const initial = { ...options.initialValues };
  const validateOn = options.validateOn || 'blur';

  interface FormInternalState {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isDirty: boolean;
    isValid: boolean;
    isSubmitting: boolean;
  }

  const store = createStore<FormInternalState>({
    values: { ...initial },
    errors: {},
    touched: {},
    isDirty: false,
    isValid: true,
    isSubmitting: false,
  });

  function validateSingleField<K extends keyof T>(field: K, val: T[K], allVals: T): string | undefined {
    const fieldRules = options.rules?.[field];
    if (!fieldRules) return undefined;

    const ruleList = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
    for (const rule of ruleList) {
      const error = rule(val, allVals);
      if (error) return error;
    }
    return undefined;
  }

  function runValidation(): boolean {
    const currentValues = store.state.values;
    const newErrors: Partial<Record<keyof T, string>> = {};
    let valid = true;

    if (options.rules) {
      for (const field of Object.keys(options.rules) as (keyof T)[]) {
        const err = validateSingleField(field, currentValues[field], currentValues);
        if (err) {
          newErrors[field] = err;
          valid = false;
        }
      }
    }

    store.batch(() => {
      store.state.errors = newErrors;
      store.state.isValid = valid;
    });

    return valid;
  }

  // Initial validation check to populate isValid
  runValidation();

  function setFieldValue<K extends keyof T>(field: K, value: T[K]) {
    store.batch(() => {
      store.state.values[field] = value;
      store.state.isDirty = true;
      if (validateOn === 'change') {
        const err = validateSingleField(field, value, store.state.values);
        if (err) {
          store.state.errors[field] = err;
          store.state.isValid = false;
        } else {
          delete store.state.errors[field];
          store.state.isValid = Object.keys(store.state.errors).length === 0;
        }
      }
    });
  }

  function setFieldError<K extends keyof T>(field: K, error?: string) {
    store.batch(() => {
      if (error) {
        store.state.errors[field] = error;
        store.state.isValid = false;
      } else {
        delete store.state.errors[field];
        store.state.isValid = Object.keys(store.state.errors).length === 0;
      }
    });
  }

  function setFieldTouched<K extends keyof T>(field: K, touched = true) {
    store.batch(() => {
      store.state.touched[field] = touched;
      if (validateOn === 'blur') {
        const err = validateSingleField(field, store.state.values[field], store.state.values);
        if (err) {
          store.state.errors[field] = err;
          store.state.isValid = false;
        } else {
          delete store.state.errors[field];
          store.state.isValid = Object.keys(store.state.errors).length === 0;
        }
      }
    });
  }

  function reset() {
    store.batch(() => {
      store.state.values = { ...initial };
      store.state.errors = {};
      store.state.touched = {};
      store.state.isDirty = false;
      store.state.isSubmitting = false;
    });
    runValidation();
  }

  const bindProxy = new Proxy({} as any, {
    get(_, prop: string) {
      const field = prop as keyof T;
      const val = store.state.values[field];
      const isCheck = typeof val === 'boolean';

      return {
        name: prop,
        [isCheck ? 'checked' : 'value']: val ?? (isCheck ? false : ''),
        onChange: (e: any) => {
          let nextVal = e;
          if (e && e.target) {
            nextVal = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
          }
          setFieldValue(field, nextVal);
        },
        onBlur: () => {
          setFieldTouched(field, true);
        },
      };
    },
  });

  const handleSubmit = (customSubmit?: (values: T) => Promise<void> | void) => {
    return async (e?: any) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }

      // Mark all validated fields as touched
      const touchedAll: Partial<Record<keyof T, boolean>> = {};
      for (const k of Object.keys(store.state.values)) {
        touchedAll[k as keyof T] = true;
      }
      store.state.touched = touchedAll;

      const isValid = runValidation();
      if (!isValid) return;

      const submitHandler = customSubmit || options.onSubmit;
      if (!submitHandler) return;

      store.state.isSubmitting = true;
      try {
        await submitHandler(store.state.values);
      } finally {
        store.state.isSubmitting = false;
      }
    };
  };

  return {
    get values() { return store.state.values; },
    get errors() { return store.state.errors; },
    get touched() { return store.state.touched; },
    get isDirty() { return store.state.isDirty; },
    get isValid() { return store.state.isValid; },
    get isSubmitting() { return store.state.isSubmitting; },
    $bind: bindProxy,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField: (field) => validateSingleField(field, store.state.values[field], store.state.values),
    validateAll: runValidation,
    reset,
    handleSubmit,
    subscribe: store.subscribe,
    getSnapshot: store.getSnapshot,
  };
}
