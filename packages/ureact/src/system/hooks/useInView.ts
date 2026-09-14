import { useState, useEffect, useRef, RefObject } from 'react';

export interface UseInViewOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

/**
 * Viewport intersection observer hook.
 * 
 * Usage:
 *   const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
 *   <div ref={ref} className={inView ? 'fade-in' : 'opacity-0'}>...</div>
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0, root = null, rootMargin = '0px', triggerOnce = false } = options;
  const elementRef = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setInView(isIntersecting);

        if (isIntersecting && triggerOnce) {
          observer.unobserve(node);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  return [elementRef, inView];
}
