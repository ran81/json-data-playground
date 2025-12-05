import { useEffect } from "react";

function isVisible(el: HTMLElement) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function getFocusable(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => isVisible(el));
}

/*
Why do we need this? because even though we focus on the modal
in the useEffect:
modalRef.current.focus();
we want to keep the focus in the modal. This hook makes it happen.
*/
export function useSimpleFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusable(container);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      const activeEl = document.activeElement as HTMLElement | null;
      const isInside = activeEl && container.contains(activeEl);

      // If focus is outside the modal (rare because you focus container on open), bring it in:
      if (!isInside) {
        e.preventDefault();
        (e.shiftKey ? last : first)?.focus();
        return;
      }

      // SHIFT+TAB: if currently on the first, wrap to last
      if (e.shiftKey) {
        if (activeEl === first) {
          e.preventDefault();
          last?.focus();
        }
        return;
      }

      // TAB: if currently on last, wrap to first
      if (!e.shiftKey) {
        if (activeEl === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [containerRef, active]);
}
