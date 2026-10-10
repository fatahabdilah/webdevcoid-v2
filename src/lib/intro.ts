import { useSyncExternalStore } from "react";

/**
 * Intro (preloader) state shared across the app.
 * "entered" flips once the logo window opens: the page's own entrance animations, smooth scroll and the
 * real cursor wait for it. It stays true for the rest of the visit, so client-side navigations are unaffected.
 */
let entered = false;
/** Where the intro's scripted cursor ended, so the real cursor can take over from that exact spot. */
let handoff: { x: number; y: number } | null = null;
const listeners = new Set<() => void>();

export function markIntroEntered(at: { x: number; y: number } | null = null) {
  if (entered) return;
  entered = true;
  handoff = at;
  listeners.forEach((fn) => fn());
}

export const isIntroEntered = () => entered;
export const getIntroHandoff = () => handoff;

export function subscribeIntro(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** True once the intro has opened onto the page (always false during server rendering). */
export function useIntroEntered() {
  return useSyncExternalStore(subscribeIntro, isIntroEntered, () => false);
}
