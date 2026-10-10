"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ANIMATIONS_ENABLED } from "./motion";

type TickerProps = {
  children: ReactNode;
  /** Pixels per second, like Framer's Ticker speed. */
  speed?: number;
  gap?: number;
  direction?: "left" | "right";
  /** Width of the edge fade, in percent of the ticker width. 0 disables it. */
  fade?: number;
  className?: string;
};

/**
 * Infinite horizontal marquee (Framer "Ticker" component).
 * Runs as a CSS animation on the compositor and pauses while off-screen.
 */
export function Ticker({ children, speed = 50, gap = 0, direction = "left", fade = 25, className = "" }: TickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [setWidth, setSetWidth] = useState(0);
  const [copies, setCopies] = useState(2);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const set = setRef.current;
      if (!container || !set) return;
      const w = set.getBoundingClientRect().width;
      setSetWidth(w);
      setCopies(Math.max(2, Math.ceil(container.offsetWidth / Math.max(w, 1)) + 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    if (setRef.current) ro.observe(setRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animate = ANIMATIONS_ENABLED && setWidth > 0;
  const trackStyle: CSSProperties | undefined = animate
    ? {
        ["--ticker-distance" as string]: `${setWidth}px`,
        animationDuration: `${setWidth / speed}s`,
        animationDirection: direction === "right" ? "reverse" : "normal",
        animationPlayState: visible ? "running" : "paused",
      }
    : undefined;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${fade ? "fade-x" : ""} ${className}`}
      style={{ ["--fade" as string]: `${fade}%` }}
    >
      <div className={`flex w-max items-center ${animate ? "ticker-track" : ""}`} style={trackStyle}>
        {Array.from({ length: copies }, (_, i) => (
          <div
            key={i}
            ref={i === 0 ? setRef : undefined}
            aria-hidden={i > 0}
            className="flex shrink-0 items-center"
            style={{ gap, paddingRight: gap }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
