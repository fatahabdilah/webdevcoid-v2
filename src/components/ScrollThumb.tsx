"use client";

import { useEffect, useRef } from "react";

/**
 * The site's scroll indicator, in place of the browser's scrollbar (hidden on site pages in globals.css): a slim
 * thumb at the right edge that shows only while the page moves and fades out when it stops, like macOS. Blended by
 * difference, so it reads white over the black hero and footer and dark over the white sections. Decorative: the page
 * still scrolls by wheel, touch and keyboard as usual. Transform and opacity only.
 */
export function ScrollThumb() {
  const thumb = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = thumb.current;
    if (!el) return;
    // touch screens keep their own scroll indicator (CSS cannot hide it there), so this one is for mouse and trackpad
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.documentElement;
    root.classList.add("no-scrollbar");
    let hide = 0;
    let frame = 0;

    const draw = () => {
      frame = 0;
      const view = window.innerHeight;
      const page = document.documentElement.scrollHeight;
      if (page <= view + 1) {
        el.style.opacity = "0";
        return;
      }
      const h = Math.max(40, (view / page) * view);
      const y = (window.scrollY / (page - view)) * (view - h - 8);
      el.style.height = `${h}px`;
      el.style.transform = `translateY(${4 + y}px)`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
      el.style.opacity = "1";
      clearTimeout(hide);
      hide = window.setTimeout(() => (el.style.opacity = "0"), 900);
    };

    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", draw);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", draw);
      cancelAnimationFrame(frame);
      clearTimeout(hide);
      root.classList.remove("no-scrollbar");
    };
  }, []);

  return (
    <div data-scroll-thumb="" aria-hidden className="pointer-events-none fixed top-0 right-[3px] z-[99998] mix-blend-difference [@media(hover:none),(pointer:coarse)]:hidden">
      <div ref={thumb} className="w-[5px] rounded-full bg-white/70 opacity-0 transition-opacity duration-500" />
    </div>
  );
}
