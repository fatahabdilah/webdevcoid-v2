"use client";

import { useEffect, useRef, useState } from "react";
import { markIntroDone, markIntroEntered } from "@/lib/intro";
import { LOGO_MARK_D, LOGO_WORDMARK_D } from "@/lib/logoPaths";
import { ANIMATIONS_ENABLED } from "../motion";
import "./preloader.css";

/** The mark's four shapes: three bars, then the bracket. */
const PARTS = LOGO_MARK_D.match(/M[^M]+/g) ?? [];

/**
 * First-load loader, about 1.6 s: the webdev lockup builds itself on black (the mark's three bars grow up one after
 * another, the bracket closes, then "webdev.co.id" comes into focus beside it), then the camera zooms through the
 * mark: it rushes towards us as the wordmark and the black fade, and the hero zooms out from behind it. It's all CSS (preloader.css), so it plays from the first paint even
 * before React hydrates; this component only follows the veil's animation to tell the rest of the site when
 * the page has opened ("entered": navbar, cursor, smooth scroll, entrance animations) and when it's gone.
 * The previous intro (logo write-on, scripted click, zoom through the logo) is archived in social/archive/intro-v1.
 * Skipped with reduced motion, and when site animations are off (e.g. capturing the page into Figma).
 */
export function Preloader() {
  const [mounted, setMounted] = useState(ANIMATIONS_ENABLED);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finish = () => {
      markIntroDone();
      setMounted(false);
    };
    const root = rootRef.current;
    if (!ANIMATIONS_ENABLED || !root || matchMedia("(prefers-reduced-motion: reduce)").matches) return finish();
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);

    // The veil's own CSS animation (it may already be under way if hydration came late)
    const lift = root.getAnimations().find((a) => (a as CSSAnimation).animationName === "intro-lift");
    if (!lift) return finish();
    const delay = Number(lift.effect?.getTiming().delay ?? 0);
    const elapsed = Number(lift.currentTime ?? 0);
    const enter = setTimeout(() => markIntroEntered(), Math.max(0, delay - elapsed));
    let cancelled = false;
    lift.finished.then(() => !cancelled && finish(), () => !cancelled && finish());
    return () => {
      cancelled = true;
      clearTimeout(enter);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div ref={rootRef} className="intro-root" aria-hidden>
      {/* the official lockup: the mark at the origin, the wordmark in lockup coordinates beside it */}
      <svg className="intro-mark" viewBox="0 0 592.951 124.852" fill="#fff">
        {PARTS.map((d, i) => (
          <path key={i} className={i < 3 ? "intro-bar" : "intro-bracket"} style={{ animationDelay: `${0.05 + i * 0.08}s` }} fillRule="evenodd" d={d} />
        ))}
        <path className="intro-word" d={LOGO_WORDMARK_D} />
      </svg>
    </div>
  );
}
