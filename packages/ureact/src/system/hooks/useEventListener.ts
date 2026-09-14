import { useEffect, useRef } from 'react';

/**
 * Attaches an event listener to window, document, or an element with automatic cleanup.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: undefined,
  options?: boolean | AddEventListenerOptions
): void;
export function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLElement>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: React.RefObject<T> | T | null,
  options?: boolean | AddEventListenerOptions
): void;
export function useEventListener(
  eventName: string,
  handler: (event: any) => void,
  element?: any,
  options?: boolean | AddEventListenerOptions
): void {
  const savedHandler = useRef(handler);
  savedHandler.current = handler;

  useEffect(() => {
    const targetElement: EventTarget =
      element && 'current' in element ? element.current : element || (typeof window !== 'undefined' ? window : null);

    if (!targetElement || !targetElement.addEventListener) {
      return;
    }

    const eventListener: EventListener = (event) => savedHandler.current(event);

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

/**
 * Declarative setInterval hook that handles updates cleanly.
 * Pass null or 0 to pause.
 */
export function useInterval(callback: () => void, delay: number | null, immediate: boolean = false) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (delay === null || delay <= 0) {
      return;
    }

    if (immediate) {
      savedCallback.current();
    }

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay, immediate]);
}
