import { ChangeEvent } from 'react';
import { Store, AutoBinding } from './types';

export type { AutoBinding };

/**
 * Universal Two-Way Binding helper.
 * 
 * Binds any reactive Store property directly to an HTML input, select, textarea, or checkbox in ONE attribute!
 * Eliminates `value={...}` and `onChange={e => ...}` boilerplate completely.
 * 
 * Example:
 *   const user = createStore({ name: 'Alex', age: 28, isSubscribed: true });
 * 
 *   // In JSX:
 *   <input {...bind(user, 'name')} />
 *   <input type="checkbox" {...bind(user, 'isSubscribed')} />
 */
export function bind<T extends object, K extends keyof T>(
  store: Store<T>,
  property: K
): AutoBinding {
  const currentVal = store.state[property];
  const isBool = typeof currentVal === 'boolean';

  return {
    name: String(property),
    ...(isBool ? { checked: Boolean(currentVal) } : { value: currentVal ?? '' }),
    onChange: (e: any) => {
      let nextVal: any = e;
      if (e && e.target !== undefined) {
        const target = e.target as HTMLInputElement;
        if (target.type === 'checkbox') {
          nextVal = target.checked;
        } else if (target.type === 'number') {
          nextVal = target.value === '' ? '' : Number(target.value);
        } else {
          nextVal = target.value;
        }
      }
      (store.state as any)[property] = nextVal;
    }
  };
}
