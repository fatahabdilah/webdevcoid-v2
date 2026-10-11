import { useSyncExternalStore } from "react";

/** Whether a media query matches, kept in sync (always false during server rendering). */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const m = matchMedia(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

/** Below the desktop breakpoint (lg, 1200px): cards stack and touch is the main input. */
export const STACKED_QUERY = "(max-width: 1199.98px)";
