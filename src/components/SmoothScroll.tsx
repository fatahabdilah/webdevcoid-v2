"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { isIntroEntered, subscribeIntro } from "@/lib/intro";
import { ANIMATIONS_ENABLED } from "./motion";

/** Inertia scrolling, the equivalent of Framer's "Smooth Scroll" component. */
export function SmoothScroll() {
  useEffect(() => {
    if (!ANIMATIONS_ENABLED) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    // Hold the page still under the intro; scrolling starts once it opens
    if (!isIntroEntered()) lenis.stop();
    const unsubscribe = subscribeIntro(() => isIntroEntered() && lenis.start());
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      lenis.destroy();
    };
  }, []);

  return null;
}
