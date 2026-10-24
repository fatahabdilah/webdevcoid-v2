"use client";

import { useEffect } from "react";

/** The CSS loops that run forever: the Layanan landing page scroll and the Kenapa kami page-design marquee. */
const LOOPS = ".sb-scroll, .vv-marquee";

/**
 * Pauses the page's endless CSS loops while they are off screen (the rule: everything that animates continuously
 * pauses off screen). Marks each with data-off, which globals.css turns into animation-play-state: paused; a single
 * observer for the whole page, started after load so it never delays the first paint.
 */
export function PauseOffscreen() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(LOOPS);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.toggleAttribute("data-off", !e.isIntersecting);
      },
      { rootMargin: "200px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
