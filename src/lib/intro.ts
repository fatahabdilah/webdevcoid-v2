import { useSyncExternalStore } from "react";

/**
 * Intro (preloader) state shared across the app.
 * "entered" flips as the loader's veil starts to lift: the page's own entrance animations, smooth scroll and the
 * real cursor wait for it. It stays true for the rest of the visit, so client-side navigations are unaffected.
 */
let entered = false;
/** "done" flips once the veil has lifted and the loader is gone. */
let done = false;
/** Where an intro's scripted cursor ended, so the real cursor could take over from that spot (the current
 *  loader has none, so it stays null; kept for the archived intro in social/archive/intro-v1). */
let handoff: { x: number; y: number } | null = null;
const listeners = new Set<() => void>();

export function markIntroEntered(at: { x: number; y: number } | null = null) {
  if (entered) return;
  entered = true;
  handoff = at;
  listeners.forEach((fn) => fn());
}

export function markIntroDone() {
  if (done) return;
  entered = done = true;
  listeners.forEach((fn) => fn());
}

export const isIntroEntered = () => entered;
export const isIntroDone = () => done;

/**
 * For animated canvases on the first screen: "off" while the intro covers the page (nothing to see),
 * "zoom" while it lifts away (keep moving, but go easy on the GPU), "run" once it is gone.
 */
export const introPhase = () => (done ? "run" : entered ? "zoom" : "off");
export const getIntroHandoff = () => handoff;

export function subscribeIntro(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** True once the intro has opened onto the page (always false during server rendering). */
export function useIntroEntered() {
  return useSyncExternalStore(subscribeIntro, isIntroEntered, () => false);
}

const noSubscription = () => () => {};
/**
 * useIntroEntered, but only listening while `listen` is true. Lets a component that only sometimes needs the
 * intro (a reveal on mount, not on scroll) skip re-rendering when the intro opens.
 */
export function useIntroEnteredIf(listen: boolean) {
  return useSyncExternalStore(listen ? subscribeIntro : noSubscription, isIntroEntered, () => false);
}

/** True once the intro has finished and its overlay is gone (always false during server rendering). */
export function useIntroDone() {
  return useSyncExternalStore(subscribeIntro, isIntroDone, () => false);
}
