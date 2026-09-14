import { SyntheticEvent } from 'react';

/**
 * Wraps an event handler to automatically call `e.preventDefault()`.
 * 
 * Standard React:
 *   <form onSubmit={(e) => { e.preventDefault(); save(); }}>
 * 
 * uReact:
 *   <form onSubmit={prevent(save)}>
 */
export function prevent<E extends SyntheticEvent = SyntheticEvent>(
  fn?: (event: E) => void
) {
  return (event: E) => {
    event.preventDefault();
    fn?.(event);
  };
}

/**
 * Wraps an event handler to automatically call `e.stopPropagation()`.
 * 
 * uReact:
 *   <button onClick={stop(toggleDetails)}>
 */
export function stop<E extends SyntheticEvent = SyntheticEvent>(
  fn?: (event: E) => void
) {
  return (event: E) => {
    event.stopPropagation();
    fn?.(event);
  };
}

/**
 * Wraps an event handler to automatically call both `preventDefault` and `stopPropagation`.
 */
export function preventStop<E extends SyntheticEvent = SyntheticEvent>(
  fn?: (event: E) => void
) {
  return (event: E) => {
    event.preventDefault();
    event.stopPropagation();
    fn?.(event);
  };
}
