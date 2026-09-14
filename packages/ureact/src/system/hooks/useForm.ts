import { useState, useCallback, useMemo, ChangeEvent, FormEvent } from 'react';

export type FormErrors<T> = Partial<Record<keyof T, string | null | undefined>>;

export interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validate?: (values: T) => FormErrors<T> | Promise<FormErrors<T>>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: T) => Promise<void> | void;
}

export interface FieldBinding<V = any> {
  name: string;
  value?: any;
  checked?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | V) => void;
  onBlur: () => void;
  'aria-invalid'?: boolean;
}

export interface UseFormResult<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  /** Sets value of a specific field directly */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Sets error of a specific field directly */
  setError: (field: keyof T, error: string | null) => void;
  /** Direct two-way binding props spreader for inputs, checkboxes, selects, and textareas */
  bind: <K extends keyof T>(field: K) => FieldBinding<T[K]>;
  /** Form props spreader that handles onSubmit and preventDefault */
  bindForm: () => {
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  };
  /** Programmatically submit the form */
  submit: () => Promise<boolean>;
  /** Reset form back to initial values */
  reset: () => void;
  /** Set multiple values at once */
  setValues: (values: Partial<T>) => void;
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>): UseFormResult<T> {
  const {
    initialValues,
    validate,
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit
  } = options;

  const [values, setValuesState] = useState<T>({ ...initialValues });
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(() => {
    return Object.keys(initialValues).some(
      (key) => (values as any)[key] !== (initialValues as any)[key]
    );
  }, [values, initialValues]);

  const runValidation = useCallback(
    async (currentValues: T): Promise<Partial<Record<keyof T, string>>> => {
      if (!validate) return {};
      const validationRes = await validate(currentValues);
      const cleaned: Partial<Record<keyof T, string>> = {};
      for (const [k, v] of Object.entries(validationRes || {})) {
        if (v) {
          cleaned[k as keyof T] = v as string;
        }
      }
      return cleaned;
    },
    [validate]
  );

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => {
        const next = { ...prev, [field]: value };
        if (validateOnChange && validate) {
          runValidation(next).then((errs) => {
            setErrors(errs);
          });
        }
        return next;
      });
    },
    [validateOnChange, validate, runValidation]
  );

  const setValues = useCallback((newVals: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newVals }));
  }, []);

  const setError = useCallback((field: keyof T, error: string | null) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (!error) {
        delete next[field];
      } else {
        next[field] = error;
      }
      return next;
    });
  }, []);

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      if (validateOnBlur && validate) {
        runValidation(values).then((errs) => {
          setErrors(errs);
        });
      }
    },
    [validateOnBlur, validate, values, runValidation]
  );

  const handleChange = useCallback(
    (field: keyof T, e: any) => {
      let val: any = e;
      if (e && e.target !== undefined) {
        const target = e.target as HTMLInputElement;
        if (target.type === 'checkbox') {
          val = target.checked;
        } else if (target.type === 'number') {
          val = target.value === '' ? '' : Number(target.value);
        } else {
          val = target.value;
        }
      }
      setValue(field, val);
    },
    [setValue]
  );

  const bind = useCallback(
    <K extends keyof T>(field: K): FieldBinding<T[K]> => {
      const currentVal = values[field];
      const isBool = typeof currentVal === 'boolean';

      const binding: FieldBinding<T[K]> = {
        name: String(field),
        onChange: (e) => handleChange(field, e),
        onBlur: () => handleBlur(field),
        'aria-invalid': !!(touched[field] && errors[field])
      };

      if (isBool) {
        binding.checked = Boolean(currentVal);
      } else {
        binding.value = currentVal ?? '';
      }

      return binding;
    },
    [values, touched, errors, handleChange, handleBlur]
  );

  const submit = useCallback(async (): Promise<boolean> => {
    // Mark all as touched
    const allTouched: Partial<Record<keyof T, boolean>> = {};
    for (const key of Object.keys(values)) {
      allTouched[key as keyof T] = true;
    }
    setTouched(allTouched);

    const currentErrors = await runValidation(values);
    setErrors(currentErrors);

    const hasErrors = Object.keys(currentErrors).length > 0;
    if (hasErrors) {
      return false;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        return true;
      } finally {
        setIsSubmitting(false);
      }
    }
    return true;
  }, [values, runValidation, onSubmit]);

  const bindForm = useCallback(() => {
    return {
      onSubmit: (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submit();
      }
    };
  }, [submit]);

  const reset = useCallback(() => {
    setValuesState({ ...initialValues });
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return {
    values,
    errors,
    touched,
    isDirty,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    setError,
    bind,
    bindForm,
    submit,
    reset
  };
}
