"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { getIntroHandoff, useIntroEntered } from "@/lib/intro";
import { CURSOR_SIZE as SIZE, CUSTOM_CURSOR_QUERY, VIEW_H, VIEW_W, cursorPath } from "@/lib/cursorShape";

/** Clickable things morph the arrow into a circle (links out of the site add a ↗); text fields hand over to the system I-beam. */
const POINTER = 'a, button, [role="button"], label, select, summary, input[type="checkbox"], input[type="radio"], input[type="submit"], input[type="button"], .cursor-pointer';
const TEXT = 'input:not([type="checkbox"], [type="radio"], [type="submit"], [type="button"]), textarea, [contenteditable="true"]';
/** A link that leaves the site: opens a new tab or points at another origin (WhatsApp, Instagram, client sites). */
function isExternal(target: Element | null) {
  const a = target?.closest<HTMLAnchorElement>("a[href]");
  return !!a && (a.target === "_blank" || a.origin !== location.origin);
}
const cursorCss = `*, *::before, *::after { cursor: none !important; }
:is(${TEXT}) { cursor: text !important; }`;

/**
 * Spring-following arrow cursor that turns to face the direction of travel (Framer "Smooth Cursor").
 * Over links and buttons it morphs into a circle; over text fields the system I-beam takes over.
 * Only on devices with a precise hovering pointer and at least 768px wide; reduced motion keeps the system cursor.
 * Hidden while the intro runs; when it opens, it takes over from the intro's scripted cursor at the same spot.
 */
export function SmoothCursor() {
  const [enabled, setEnabled] = useState(false);
  const x = useSpring(-100, { stiffness: 400, damping: 45, mass: 1 });
  const y = useSpring(-100, { stiffness: 400, damping: 45, mass: 1 });
  const rotate = useSpring(0, { stiffness: 300, damping: 60 });
  const scale = useSpring(1, { stiffness: 500, damping: 35 });
  /** 0 = arrow, 1 = circle; the outline is re-drawn from it every frame */
  const morph = useSpring(0, { stiffness: 260, damping: 32 }); // critically damped: no overshoot past either shape
  /** 1 over external links: the circle grows a little and shows ↗ */
  const ext = useSpring(0, { stiffness: 260, damping: 32 });
  const boxScale = useTransform(() => scale.get() * (1 + 0.6 * ext.get()));
  const arrowScale = useTransform(ext, [0, 1], [0.4, 1]);
  const d = useTransform(morph, cursorPath);
  /** 0 over text fields, where the system I-beam shows instead */
  const visible = useSpring(1, { stiffness: 500, damping: 40 });
  /** 0 until the intro has opened onto the page */
  const entered = useIntroEntered();
  const shown = useSpring(0, { stiffness: 500, damping: 40 });
  const opacity = useTransform(() => visible.get() * shown.get());

  const last = useRef({ x: 0, y: 0, t: 0 });
  const angle = useRef({ previous: 0, accumulated: 0 });
  const pressed = useRef(false);

  // Decide whether this device gets the custom cursor
  useEffect(() => {
    const query = window.matchMedia(CUSTOM_CURSOR_QUERY);
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;

    const move = (px: number, py: number) => {
      const now = performance.now();
      const dt = now - last.current.t;
      const vx = dt > 0 ? (px - last.current.x) / dt : 0;
      const vy = dt > 0 ? (py - last.current.y) / dt : 0;
      last.current = { x: px, y: py, t: now };
      x.set(px);
      y.set(py);

      if (Math.hypot(vx, vy) > 0.1) {
        // Point the arrow along the motion; accumulate so it never spins the long way round
        const current = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
        let diff = current - angle.current.previous;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        angle.current.accumulated += diff;
        angle.current.previous = current;
        rotate.set(angle.current.accumulated);

        // Slight squish while moving (unless held down)
        if (!pressed.current) {
          scale.set(0.95);
          clearTimeout(settle);
          settle = setTimeout(() => !pressed.current && scale.set(1), 150);
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        move(e.clientX, e.clientY);
      });
    };
    // Arrow over plain content, circle over clickable things, system I-beam over text fields
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target instanceof Element ? e.target : null;
      const text = !!target?.closest(TEXT);
      const link = !text && !!target?.closest(POINTER);
      visible.set(text ? 0 : 1);
      morph.set(link ? 1 : 0);
      ext.set(link && isExternal(target) ? 1 : 0);
    };
    const onDown = () => {
      pressed.current = true;
      scale.set(0.7);
    };
    const onUp = () => {
      pressed.current = false;
      scale.set(1);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("mouseleave", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onUp);
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [enabled, x, y, rotate, scale, morph, ext, visible]);

  // Take over from the intro's scripted cursor: same spot, still the circle, then morph back to the arrow.
  // If the mouse has already moved, the real position wins.
  useEffect(() => {
    if (!enabled || !entered) return;
    const handoff = getIntroHandoff();
    if (handoff && last.current.t === 0) {
      x.jump(handoff.x);
      y.jump(handoff.y);
      rotate.jump(0);
      morph.jump(1);
      morph.set(0);
      shown.jump(1);
    } else {
      shown.set(1);
    }
  }, [enabled, entered, x, y, rotate, morph, shown]);

  if (!enabled) return null;

  return (
    <>
      {/* Hide the system cursor while the custom one is active (text fields keep the I-beam) */}
      <style>{cursorCss}</style>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-999999 will-change-transform"
        style={{ x, y, scale: boxScale, opacity, width: SIZE, height: SIZE, marginLeft: -SIZE / 2, marginTop: -SIZE / 2 }}
      >
        {/* Black body, white outline (stroke painted under the fill, so only its outer half shows), soft drop shadow.
            Only the shape turns with the direction of travel; the ↗ below stays upright. */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 size-full"
          style={{ rotate }}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          fill="none"
        >
          <motion.path d={d} fill="black" stroke="white" strokeWidth={4.5} strokeLinejoin="round" paintOrder="stroke" filter="url(#smooth-cursor-shadow)" />
          <defs>
            <filter id="smooth-cursor-shadow" x={-5} y={-5} width={60} height={64} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy={2.25825} />
              <feGaussianBlur stdDeviation={2.25825} />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="shadow" />
              <feBlend mode="normal" in="SourceGraphic" in2="shadow" result="shape" />
            </filter>
          </defs>
        </motion.svg>
        {/* External link: ↗ inside the circle */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 size-full"
          style={{ opacity: ext, scale: arrowScale }}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          fill="none"
        >
          <path d="M19.5 32.5L30.5 21.5M22.5 21.5H30.5V29.5" stroke="white" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.div>
    </>
  );
}
