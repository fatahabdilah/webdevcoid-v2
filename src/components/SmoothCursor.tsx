"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { getIntroHandoff, useIntroDone } from "@/lib/intro";
import { CURSOR_SIZE as SIZE, CUSTOM_CURSOR_QUERY, VIEW_H, VIEW_W, cursorPath } from "@/lib/cursorShape";

/** Clickable things morph the arrow into a circle; text fields hand over to the system I-beam. */
const POINTER = 'a, button, [role="button"], label, select, summary, input[type="checkbox"], input[type="radio"], input[type="submit"], input[type="button"], .cursor-pointer';
const TEXT = 'input:not([type="checkbox"], [type="radio"], [type="submit"], [type="button"]), textarea, [contenteditable="true"]';
const cursorCss = `*, *::before, *::after { cursor: none !important; }
:is(${TEXT}) { cursor: text !important; }`;

/**
 * Spring-following arrow cursor that turns to face the direction of travel (Framer "Smooth Cursor").
 * Over links and buttons it morphs into a circle; over text fields the system I-beam takes over.
 * Only on devices with a precise hovering pointer and at least 768px wide; reduced motion keeps the system cursor.
 * Hidden until the intro has finished; then it appears where the intro's scripted cursor stopped.
 */
export function SmoothCursor() {
  const [enabled, setEnabled] = useState(false);
  // Follows the mouse with a little glide (critically damped, ~30 ms time constant). 400 / 45 / 1 felt heavy;
  // 1200 / 55 / 0.6 was a touch too quick for the owner.
  const x = useSpring(-100, { stiffness: 800, damping: 47, mass: 0.7 });
  const y = useSpring(-100, { stiffness: 800, damping: 47, mass: 0.7 });
  // Turns promptly but without wobble (critically damped); was 300 / 60, which dragged behind the direction
  const rotate = useSpring(0, { stiffness: 500, damping: 45 });
  const scale = useSpring(1, { stiffness: 500, damping: 35 });
  /** 0 = arrow, 1 = circle; the outline is re-drawn from it every frame */
  const morph = useSpring(0, { stiffness: 260, damping: 32 }); // critically damped: no overshoot past either shape
  const d = useTransform(morph, cursorPath);
  /** 0 over text fields, where the system I-beam shows instead */
  const visible = useSpring(1, { stiffness: 500, damping: 40 });
  /** 0 until the intro has finished */
  const introDone = useIntroDone();
  const shown = useSpring(0, { stiffness: 500, damping: 40 });
  /** 0 while the mouse is outside the browser window */
  const inside = useSpring(1, { stiffness: 500, damping: 40 });
  const opacity = useTransform(() => visible.get() * shown.get() * inside.get());

  const last = useRef({ x: 0, y: 0, t: 0 });
  const away = useRef(false);
  const angle = useRef({ previous: 0, accumulated: 0 });
  /** The direction of travel, smoothed over the last few events so a jittery hand doesn't wobble the arrow; only
   *  steps of 3px or more count, measured from where the direction was last updated (x, y) */
  const heading = useRef({ vx: 0, vy: 0, x: 0, y: 0 });
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
    let settle: ReturnType<typeof setTimeout> | undefined;

    const move = (px: number, py: number) => {
      if (away.current) {
        // Back in the window: appear right here instead of gliding over from where the mouse left
        away.current = false;
        x.jump(px);
        y.jump(py);
        last.current = { x: px, y: py, t: performance.now() };
        inside.set(1);
        return;
      }
      const now = performance.now();
      const dt = now - last.current.t;
      const vx = dt > 0 ? (px - last.current.x) / dt : 0;
      const vy = dt > 0 ? (py - last.current.y) / dt : 0;
      last.current = { x: px, y: py, t: now };
      x.set(px);
      y.set(py);

      // smooth the direction (an exponential average of the velocity), counting only real moves, not a trembling hand
      const h = heading.current;
      const stepped = Math.hypot(px - h.x, py - h.y) >= 3;
      if (stepped) {
        h.vx = h.vx * 0.6 + vx * 0.4;
        h.vy = h.vy * 0.6 + vy * 0.4;
        h.x = px;
        h.y = py;
      }

      if (stepped && Math.hypot(h.vx, h.vy) > 0.25) {
        // Point the arrow along the motion; accumulate so it never spins the long way round
        const current = (Math.atan2(h.vy, h.vx) * 180) / Math.PI + 90;
        let diff = current - angle.current.previous;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        // small changes (a slightly curved line) aren't worth turning for
        if (Math.abs(diff) > 4) {
          angle.current.accumulated += diff;
          angle.current.previous = current;
          rotate.set(angle.current.accumulated);
        }

        // Slight squish while moving (unless held down)
        if (!pressed.current) {
          scale.set(0.95);
          clearTimeout(settle);
          settle = setTimeout(() => !pressed.current && scale.set(1), 150);
        }
      }
    };

    // Straight to the spring on every event (the spring itself renders once per frame): waiting for the next frame
    // here only added a frame of lag
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") move(e.clientX, e.clientY);
    };
    // Arrow over plain content, circle over clickable things, system I-beam over text fields
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target instanceof Element ? e.target : null;
      const field = !!target?.closest(TEXT);
      const link = !field && !!target?.closest(POINTER);
      visible.set(field ? 0 : 1);
      morph.set(link ? 1 : 0);
    };
    const onDown = () => {
      pressed.current = true;
      scale.set(0.7);
    };
    const onUp = () => {
      pressed.current = false;
      scale.set(1);
    };
    // Mouse left the browser window: fade the cursor out (and drop any press)
    const onLeave = () => {
      onUp();
      away.current = true;
      inside.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      clearTimeout(settle);
    };
  }, [enabled, x, y, rotate, scale, morph, visible, inside]);

  // Appear once the intro (loading) has finished: where the intro's scripted cursor stopped if the mouse
  // hasn't moved, otherwise at the mouse.
  useEffect(() => {
    if (!enabled || !introDone) return;
    const handoff = getIntroHandoff();
    if (handoff && last.current.t === 0) {
      x.jump(handoff.x);
      y.jump(handoff.y);
      rotate.jump(0);
    }
    shown.set(1);
  }, [enabled, introDone, x, y, rotate, shown]);

  if (!enabled) return null;

  return (
    <>
      {/* Hide the system cursor while the custom one is active (text fields keep the I-beam) */}
      <style>{cursorCss}</style>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-999999 will-change-transform"
        style={{ x, y, scale, opacity, width: SIZE, height: SIZE, marginLeft: -SIZE / 2, marginTop: -SIZE / 2 }}
      >
        {/* Black body, white outline (stroke painted under the fill, so only its outer half shows), soft drop shadow.
            The shape turns with the direction of travel. */}
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
      </motion.div>
    </>
  );
}
