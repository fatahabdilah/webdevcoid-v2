"use client";

import { useEffect, useRef, useState } from "react";
import { markIntroEntered } from "@/lib/intro";
import { cursorPath } from "../cursorShape";
import { ANIMATIONS_ENABLED } from "../motion";
import { runIntro } from "./runIntro";
import "./preloader.css";

/**
 * First-load intro: logo write-on (starts immediately) → scripted cursor click → zoom through the logo.
 * Rendered on the server so the veil covers the page from the first paint; Esc skips it.
 * Skipped entirely when site animations are off (e.g. capturing the page into Figma).
 */
export function Preloader() {
  const [mounted, setMounted] = useState(ANIMATIONS_ENABLED);
  const rootRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ANIMATIONS_ENABLED) {
      markIntroEntered();
      return;
    }
    const root = rootRef.current;
    const cover = coverRef.current;
    if (!root || !cover) return;
    const q = <T extends Element>(name: string) => root.querySelector<T>(`[data-intro="${name}"]`)!;
    return runIntro(
      {
        root,
        cover,
        stage: q<HTMLElement>("stage"),
        defs: q<SVGDefsElement>("defs"),
        cam: q<SVGGElement>("cam"),
        ink: q<SVGGElement>("ink"),
        solid: q<SVGGElement>("solid"),
        hole: q<SVGGElement>("hole"),
        dither: q<HTMLCanvasElement>("dither"),
        vignette: q<HTMLElement>("vignette"),
        cursor: q<HTMLElement>("cursor"),
        cursorShape: q<SVGPathElement>("cursor-shape"),
        rings: [...root.querySelectorAll<HTMLElement>('[data-intro="ring"]')],
      },
      { onEnter: markIntroEntered, onDone: () => setMounted(false) },
    );
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div ref={coverRef} className="intro-cover" aria-hidden />
      <div ref={rootRef} className="intro-root" aria-hidden>
        {/* Dark veil; at the click the logo becomes a window cut into it */}
        <svg className="intro-veil" preserveAspectRatio="none">
          <defs>
            <mask id="intro-hole" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
              <rect width="100%" height="100%" fill="#fff" />
              <g data-intro="hole" fill="#000" visibility="hidden" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="#070404" mask="url(#intro-hole)" />
        </svg>
        <div className="intro-vignette" data-intro="vignette" />
        <canvas className="intro-dither" data-intro="dither" />
        <div className="intro-stage" data-intro="stage">
          <svg viewBox="0 0 599 125" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs data-intro="defs" />
            <g data-intro="cam">
              <g data-intro="ink" fill="#f3eee6" />
              <g data-intro="solid" fill="#f3eee6" opacity="0" />
            </g>
          </svg>
        </div>
        <div className="intro-ring" data-intro="ring" />
        <div className="intro-ring" data-intro="ring" />
        {/* Scripted cursor, drawn like the site cursor (arrow ↔ circle morph) */}
        <div className="intro-cursor" data-intro="cursor">
          <svg viewBox="0 0 50 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              data-intro="cursor-shape"
              d={cursorPath(0)}
              fill="black"
              stroke="white"
              strokeWidth={4.5}
              strokeLinejoin="round"
              paintOrder="stroke"
              filter="url(#intro-cursor-shadow)"
            />
            <defs>
              <filter id="intro-cursor-shadow" x={-5} y={-5} width={60} height={64} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feDropShadow dx={0} dy={2.25} stdDeviation={2.25} floodColor="#000" floodOpacity={0.35} />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div className="intro-grain" aria-hidden />
    </>
  );
}
