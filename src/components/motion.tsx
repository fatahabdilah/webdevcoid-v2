"use client";

import { Fragment, useLayoutEffect, useRef, type CSSProperties, type ElementType } from "react";
import { motion, type HTMLMotionProps, type Transition, type Variants } from "motion/react";
import { useIntroEntered } from "@/lib/intro";
import { noOrphan } from "@/lib/text";

/**
 * Master switch for site animations. Set to false to render everything in its final state
 * (no reveals, scroll effects, tickers or smooth scroll) — e.g. for capturing the page into Figma.
 */
export const ANIMATIONS_ENABLED = true;

/** Framer "spring-physics 320 70 1" – the default appear spring used across the template. */
export const spring: Transition = { type: "spring", stiffness: 320, damping: 70, mass: 1 };
/** Framer "tween 0.44,0,0.56,1" */
export const easeFramer = [0.44, 0, 0.56, 1] as const;

type RevealProps = HTMLMotionProps<"div"> & {
  y?: number;
  x?: number;
  delay?: number;
  /** Animate when mounted instead of when scrolled into view. */
  onMount?: boolean;
  /** Fraction of the element that must be visible before it animates in. */
  amount?: number;
};

/** Fades (and optionally slides) an element in, like Framer's Appear effect. */
export function Reveal({ y = 0, x = 0, delay = 0, onMount, amount = 0.5, transition, ...rest }: RevealProps) {
  // On-mount reveals wait for the intro to open onto the page, so they play where they can be seen
  const entered = useIntroEntered();
  if (!ANIMATIONS_ENABLED) return <motion.div {...rest} />;
  const t = { ...(transition ?? spring), delay };
  const hidden = { opacity: 0, x, y };
  const shown = { opacity: 1, x: 0, y: 0 };
  if (onMount) return <motion.div initial={hidden} animate={entered ? shown : hidden} transition={t} {...rest} />;
  return <motion.div initial={hidden} whileInView={shown} viewport={{ once: true, amount }} transition={t} {...rest} />;
}

type WordsProps = {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  y?: number;
  blur?: number;
  onMount?: boolean;
  transition?: Transition;
  /** Gradient text (a CSS background-image), continuous across the words. */
  gradient?: string;
};

/**
 * Gradient text that survives the word animation: `background-clip: text` on the heading doesn't
 * reach words animating on their own layers, so each word paints its own slice of one gradient
 * that spans its line (--gw wide, offset by the word's position --gx, measured below).
 */
const gradientWord = (gradient: string): CSSProperties => ({
  backgroundImage: gradient,
  backgroundSize: "var(--gw) 100%",
  backgroundPosition: "var(--gx) 0",
  backgroundRepeat: "no-repeat",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});

/** Measures where each [data-word] sits within the text, for gradientWord. */
function useGradientSlices(gradient: string | undefined, text: string) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!gradient || !root) return;
    const measure = () => {
      // Group the words into lines, so every line runs through the whole gradient.
      const lines = new Map<number, { el: HTMLElement; left: number; right: number }[]>();
      for (const el of root.querySelectorAll<HTMLElement>("[data-word]")) {
        const r = el.getBoundingClientRect();
        const key = Math.round(r.top / 4);
        lines.set(key, [...(lines.get(key) ?? []), { el, left: r.left, right: r.right }]);
      }
      for (const words of lines.values()) {
        const min = Math.min(...words.map((w) => w.left));
        const width = Math.max(...words.map((w) => w.right)) - min;
        for (const w of words) {
          w.el.style.setProperty("--gw", `${width}px`);
          w.el.style.setProperty("--gx", `${min - w.left}px`);
        }
      }
    };
    measure();
    document.fonts.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [gradient, text]);
  return ref;
}

/** Word-by-word text effect (Framer "Text Effect" with word tokenization). Use "\n" for line breaks. */
export function Words({
  text,
  as: Tag = "h2",
  className,
  delay = 0.2,
  stagger = 0.07,
  y = 10,
  blur = 0,
  onMount,
  transition = { duration: 0.8, ease: easeFramer },
  gradient,
}: WordsProps) {
  const ref = useGradientSlices(gradient, text);
  const entered = useIntroEntered();
  if (!ANIMATIONS_ENABLED) {
    return (
      <Tag className={className}>
        <span style={gradient ? { ...gradientWord(gradient), backgroundSize: "100% 100%", WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" } : undefined}>
          {text.split("\n").map((line, li) => (
            <Fragment key={li}>
              {li > 0 && <br />}
              {noOrphan(line)}
            </Fragment>
          ))}
        </span>
      </Tag>
    );
  }
  const container: Variants = {
    hidden: {},
    show: { transition: { delayChildren: delay, staggerChildren: stagger } },
  };
  const word: Variants = {
    hidden: { opacity: 0, y, filter: blur ? `blur(${blur}px)` : "blur(0px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition },
  };
  const trigger = onMount ? { animate: entered ? "show" : "hidden" } : { whileInView: "show", viewport: { once: true, amount: 0.5 } };

  return (
    <Tag ref={ref} className={className}>
      <motion.span className="block" initial="hidden" {...trigger} variants={container}>
        {text.split("\n").map((line, li) => (
          <Fragment key={li}>
            {li > 0 && <br />}
            {(() => {
              // The last two words share a no-wrap span so the line never ends on a lone word
              // (not on two-word lines, which must still be able to wrap on narrow phones).
              const ws = line.split(" ");
              const tail = ws.slice(ws.length > 2 ? -2 : -1);
              const head = ws.slice(0, ws.length - tail.length);
              const renderWord = (w: string) => (
                <motion.span className="inline-block" variants={word} data-word={gradient ? "" : undefined} style={gradient ? gradientWord(gradient) : undefined}>
                  {w}
                </motion.span>
              );
              return (
                <>
                  {head.map((w, wi) => (
                    <Fragment key={wi}>
                      {renderWord(w)}{" "}
                    </Fragment>
                  ))}
                  <span className="whitespace-nowrap">
                    {tail.map((w, ti) => (
                      <Fragment key={ti}>
                        {ti > 0 && " "}
                        {renderWord(w)}
                      </Fragment>
                    ))}
                  </span>
                </>
              );
            })()}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
