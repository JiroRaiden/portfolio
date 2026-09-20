import { useEffect, useRef } from 'react';

// Popups can stack (a project's details can open on top of "all projects").
// This list remembers the order, so Escape and Tab only affect the TOP popup.
const stack: symbol[] = [];

/**
 * Everything a popup (modal dialog) needs to behave well:
 *  - focus moves into it when it opens (to `initialFocus`)
 *  - Tab stays inside it (a simple focus trap)
 *  - Escape closes it (only the top popup, if several are open)
 *  - the page behind can't scroll
 *  - when it closes, focus goes back to whatever opened it
 */
export function useModal(onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const initialFocus = useRef<HTMLButtonElement>(null);
  // Keep the latest onClose without re-running the setup on every parent render.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const id = Symbol('modal');
    stack.push(id);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    initialFocus.current?.focus();
    document.documentElement.classList.add('is-locked');

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;      // not the top popup
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>('button, a[href]');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(id), 1);
      if (stack.length === 0) document.documentElement.classList.remove('is-locked');
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, []);

  return { panelRef, initialFocus };
}
