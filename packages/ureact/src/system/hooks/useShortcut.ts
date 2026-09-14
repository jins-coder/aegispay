import { useEffect, useRef } from 'react';

export type KeyCombo = string;

export interface UseShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  allowInInputs?: boolean;
}

const MODIFIER_NAMES = ['ctrl', 'control', 'meta', 'cmd', 'command', 'shift', 'alt', 'mod'];

/**
 * Declarative keyboard shortcut hook.
 * 
 * Supports:
 *   - Modifiers: 'mod' (Ctrl on Win/Linux, Meta/Cmd on Mac), 'ctrl', 'meta', 'shift', 'alt'
 *   - Examples: 'mod+z', 'mod+y', 'ctrl+k', 'escape', ['mod+z', 'ctrl+z']
 */
export function useShortcut(
  combo: KeyCombo | KeyCombo[],
  handler: (event: KeyboardEvent) => void,
  options: UseShortcutOptions = {}
) {
  const { enabled = true, preventDefault = false, allowInInputs } = options;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const combos = Array.isArray(combo) ? combo : [combo];

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      for (const c of combos) {
        const parts = c
          .toLowerCase()
          .split('+')
          .map((p) => p.trim())
          .filter(Boolean);

        const wantsMod = parts.includes('mod');
        const wantsCtrl = parts.includes('ctrl') || parts.includes('control');
        const wantsMeta = parts.includes('meta') || parts.includes('cmd') || parts.includes('command');
        const wantsShift = parts.includes('shift');
        const wantsAlt = parts.includes('alt');

        // Extract the main trigger key
        const keyPart = parts.find((p) => !MODIFIER_NAMES.includes(p));

        // Check if modifiers match
        if (wantsMod) {
          if (!event.ctrlKey && !event.metaKey) continue;
        } else {
          if (wantsCtrl !== event.ctrlKey) continue;
          if (wantsMeta !== event.metaKey) continue;
        }

        if (wantsShift !== event.shiftKey) continue;
        if (wantsAlt !== event.altKey) continue;

        // Check key match
        if (keyPart) {
          const eventKey = event.key.toLowerCase();
          const eventCode = event.code.toLowerCase();
          const targetKey = keyPart.toLowerCase();

          const matches =
            eventKey === targetKey ||
            eventCode === targetKey ||
            eventCode === 'key' + targetKey ||
            eventCode === 'digit' + targetKey;

          if (!matches) continue;
        }

        // By default, allow modifier shortcuts (like Ctrl+Z, Ctrl+K) inside inputs,
        // but suppress single key triggers (like 'a' or '1') inside text inputs unless explicit
        const hasModifier = wantsMod || wantsCtrl || wantsMeta || wantsAlt;
        const shouldAllow = allowInInputs !== undefined ? allowInInputs : hasModifier;

        if (isInput && !shouldAllow) {
          continue;
        }

        if (preventDefault) {
          event.preventDefault();
        }

        handlerRef.current(event);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [combo, enabled, preventDefault, allowInInputs]);
}
