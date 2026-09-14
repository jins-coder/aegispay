import React, { ReactNode } from 'react';

export interface ForProps<T> {
  /** Array of items to iterate over */
  each: readonly T[] | null | undefined;
  /** Fallback rendered if array is empty, null, or undefined */
  fallback?: ReactNode;
  /** Custom key extractor. Defaults to item.id || item.key || index */
  keyExtractor?: (item: T, index: number) => string | number;
  /** Render function for each item */
  children: (item: T, index: number) => ReactNode;
}

/**
 * Eliminates repetitive `.map()` boilerplate, empty array checks, and manual key management.
 * 
 * Standard React:
 *   {items && items.length > 0 ? (
 *     items.map((item, idx) => <Item key={item.id} item={item} />)
 *   ) : (
 *     <EmptyPlaceholder />
 *   )}
 * 
 * uReact:
 *   <For each={items} fallback={<EmptyPlaceholder />}>
 *     {(item) => <Item item={item} />}
 *   </For>
 */
export function For<T>({
  each,
  fallback = null,
  keyExtractor,
  children
}: ForProps<T>): React.ReactElement | null {
  if (!each || each.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <>
      {each.map((item, index) => {
        let key: string | number;
        if (keyExtractor) {
          key = keyExtractor(item, index);
        } else if (item && typeof item === 'object') {
          key = (item as any).id ?? (item as any).key ?? index;
        } else {
          key = index;
        }

        return <React.Fragment key={key}>{children(item, index)}</React.Fragment>;
      })}
    </>
  );
}
