"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { values } from "@/content/home";
import { useMedia } from "@/lib/useMedia";
import { noOrphan } from "@/lib/text";
import { Emblem } from "../Emblem";
import { easeFramer } from "../motion";
import "./values-system.css";

/**
 * "Kenapa kami" (Figma 1373:2051, adapted to webdev): on the left the intro and the three values as a list that
 * plays through 1 → 2 → 3 and round again (a brand-blue loading line fills along the open value; when it's full
 * the next one opens; a click picks one); on the right a card with the system: the webdev emblem at the centre
 * (Figma 1241:2), the three value nodes on a ring round it, the open value's node lit and labelled, its keywords
 * floating round the emblem, light running along the lines, its name in a caption under the ring.
 * The loading line's CSS animation drives the timing, so pausing the section's animations (off screen) pauses
 * the whole thing; with reduced motion nothing loops and the list only changes on click.
 */

const PLAY_MS = 5200;
/** The diagram's SVG box. Nodes sit on the ring (radius R) at the top, bottom right and bottom left. */
const S = 460;
const C = S / 2;
const R = 206;
const EMBLEM_R = 112;
const polar = (deg: number, r: number) => ({ x: C + r * Math.cos((deg * Math.PI) / 180), y: C + r * Math.sin((deg * Math.PI) / 180) });
const NODE_DEG = [-90, 30, 150];
const NODES = NODE_DEG.map((d) => polar(d, R));
/** Keywords sit between the nodes, between the emblem and the ring. */
const KEY_DEG = [-30, 90, 210];
const KEYS = KEY_DEG.map((d) => polar(d, 176));
const pct = (v: number) => `${(v / S) * 100}%`;

function Diagram({ active, playing, onPick }: { active: number; playing: boolean; onPick: (i: number) => void }) {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    if (playing) el.unpauseAnimations();
    else el.pauseAnimations();
  }, [playing]);

  // spokes from the emblem's edge out to each node; curves between nodes, bowing in towards the emblem
  const spoke = (i: number) => {
    const a = polar(NODE_DEG[i], EMBLEM_R + 6);
    return `M${a.x} ${a.y}L${NODES[i].x} ${NODES[i].y}`;
  };
  const curve = (i: number) => {
    const p = NODES[i], q = NODES[(i + 1) % 3], m = polar((NODE_DEG[i] + NODE_DEG[(i + 1) % 3] + (i === 2 ? 360 : 0)) / 2, 150);
    return `M${p.x} ${p.y}Q${m.x} ${m.y} ${q.x} ${q.y}`;
  };

  return (
    <div className="relative aspect-square w-full">
      <svg ref={svg} viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="vs-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-holo-75)" stopOpacity="0" />
            <stop offset="0.7" stopColor="var(--color-holo-75)" stopOpacity="0.9" />
            <stop offset="1" stopColor="white" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* the ring, with brighter arcs drifting round it both ways */}
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgb(255 255 255 / 0.12)" />
        <circle cx={C} cy={C} r={R + 18} fill="none" stroke="rgb(255 255 255 / 0.05)" strokeDasharray="1 7" />
        <g className="vs-orbit" style={{ transformOrigin: `${C}px ${C}px` }}>
          <path d={`M ${C} ${C - R} A ${R} ${R} 0 0 1 ${polar(-25, R).x} ${polar(-25, R).y}`} fill="none" stroke="url(#vs-arc)" strokeWidth="1.6" strokeLinecap="round" />
          <path d={`M ${polar(150, R).x} ${polar(150, R).y} A ${R} ${R} 0 0 1 ${polar(190, R).x} ${polar(190, R).y}`} fill="none" stroke="url(#vs-arc)" strokeWidth="1.6" strokeLinecap="round" />
        </g>
        <g className="vs-orbit-back" style={{ transformOrigin: `${C}px ${C}px` }}>
          <path d={`M ${polar(60, R + 18).x} ${polar(60, R + 18).y} A ${R + 18} ${R + 18} 0 0 1 ${polar(110, R + 18).x} ${polar(110, R + 18).y}`} fill="none" stroke="url(#vs-arc)" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round" />
        </g>
        {/* the links between the values */}
        {NODES.map((_, i) => (
          <path key={`c${i}`} d={curve(i)} fill="none" stroke="rgb(255 255 255 / 0.1)" />
        ))}
        {NODES.map((_, i) => (
          <path
            key={`s${i}`}
            d={spoke(i)}
            fill="none"
            strokeDasharray="3 5"
            className="transition-[stroke] duration-700"
            stroke={i === active ? "color-mix(in srgb, var(--color-holo-75) 85%, transparent)" : "rgb(255 255 255 / 0.14)"}
          />
        ))}
        {/* light running out along the spokes (brighter on the open value) and round the curves */}
        {NODES.map((_, i) => (
          <circle key={`ls${i}`} r={i === active ? 3.2 : 2} fill={i === active ? "white" : "var(--color-holo-75)"} opacity={i === active ? 1 : 0.5}>
            <animateMotion dur={`${2.2 + i * 0.35}s`} repeatCount="indefinite" path={spoke(i)} begin={`${i * 0.6}s`} />
          </circle>
        ))}
        {NODES.map((_, i) => (
          <circle key={`lc${i}`} r="1.8" fill="var(--color-holo-75)" opacity="0.8">
            <animateMotion dur="5.5s" repeatCount="indefinite" path={curve(i)} begin={`${i * 1.8}s`} />
          </circle>
        ))}
      </svg>

      {/* the emblem, breathing, with a soft blue halo */}
      <div
        aria-hidden
        className="absolute rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-holo-50)_55%,transparent),transparent)] blur-2xl"
        style={{ left: pct(C - EMBLEM_R * 1.25), top: pct(C - EMBLEM_R * 1.25), width: pct(EMBLEM_R * 2.5), height: pct(EMBLEM_R * 2.5) }}
      />
      <div className="vs-breathe absolute" style={{ left: pct(C - EMBLEM_R), top: pct(C - EMBLEM_R), width: pct(EMBLEM_R * 2) }}>
        <Emblem className="w-full" />
      </div>

      {/* the open value's keywords, round the emblem */}
      {KEYS.map((k, j) => (
        <div key={j} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pct(k.x), top: pct(k.y) }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${active}-${j}`}
              initial={{ opacity: 0, y: 8, scale: 0.92, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, delay: 0.15 + j * 0.08, ease: easeFramer } }}
              exit={{ opacity: 0, y: -6, scale: 0.96, filter: "blur(4px)", transition: { duration: 0.25, ease: easeFramer } }}
              className="t-body-s flex items-center gap-1.5 max-sm:text-xs rounded-full border border-white/12 bg-[#0d1220]/80 px-2.5 py-1 whitespace-nowrap text-white-02 backdrop-blur-md"
            >
              <span className="size-1.5 rounded-full bg-holo-75" />
              {values[active].keywords[j]}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}

      {/* the value nodes */}
      {values.map((v, i) => {
        const on = i === active;
        return (
          <button
            key={v.number}
            type="button"
            onClick={() => onPick(i)}
            aria-label={`${v.number} ${v.short}`}
            aria-pressed={on}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: pct(NODES[i].x), top: pct(NODES[i].y) }}
          >
            {on && <span aria-hidden className="vs-ping absolute inset-0 rounded-full bg-holo-75/50" />}
            <span
              className={`relative flex size-12 items-center justify-center rounded-full border transition-[background-color,border-color,box-shadow,transform] duration-500 ${
                on
                  ? "scale-110 border-white/50 bg-[radial-gradient(70%_70%_at_50%_30%,var(--color-holo-75),var(--color-holo-50)_60%,var(--color-holo-25))] shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-holo-75)_18%,transparent)]"
                  : "border-white/15 bg-[#121725] hover:border-white/35"
              }`}
            >
              <Image src={v.icon} alt="" width={64} height={64} className="size-6" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ValuesSystem({ intro }: { intro: ReactNode }) {
  const [active, setActive] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const playing = onScreen && !reduced;
  const next = () => setActive((a) => (a + 1) % values.length);

  return (
    <div
      ref={root}
      className={`grid w-full grid-cols-1 items-center gap-12 md:gap-16 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:gap-14 ${playing ? "" : "vs-paused"}`}
    >
      <div className="flex flex-col gap-12 lg:gap-16">
        {intro}
        {/* the values, one open at a time */}
        <ol className="flex flex-col">
          {values.map((v, i) => {
            const on = i === active;
            return (
              <li key={v.number} className="relative border-t border-white/10 last:border-b">
                {/* the loading line: fills while this value is open, then the next one opens */}
                <span aria-hidden className="absolute -top-px left-0 h-[2px] w-full overflow-hidden">
                  {on && (
                    <span
                      key={`p${active}`}
                      onAnimationEnd={next}
                      className="vs-progress block h-full w-full bg-[linear-gradient(90deg,var(--color-holo-50),var(--color-holo-75),white)]"
                      style={{ animationDuration: `${PLAY_MS}ms` }}
                    />
                  )}
                </span>
                <button type="button" onClick={() => setActive(i)} aria-expanded={on} className="group flex w-full cursor-pointer items-center gap-4 py-5 text-left">
                  <span
                    className={`t-caption flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ${
                      on ? "border-holo-75 bg-holo-50 text-white" : "border-white/15 text-white-03 group-hover:border-white/35"
                    }`}
                  >
                    {v.number}
                  </span>
                  <span className={`t-title-s transition-colors duration-500 ${on ? "text-white" : "text-white-03 group-hover:text-white-02"}`}>{v.title.replace("\n", " ")}</span>
                </button>
                {/* the open value's text. Every body is as tall as the longest text (all three sit stacked in it, the
                    others invisible) and opening and closing share one timing, so as one opens and the other closes the
                    list keeps its height and nothing below it moves. */}
                <div
                  aria-hidden={!on}
                  className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.44,0,0.56,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="grid pr-6 pb-6 pl-11">
                      {values.map((w, j) => (
                        <p
                          key={w.number}
                          className={`t-body-l text-white-02 [grid-area:1/1] ${
                            j !== i
                              ? "invisible"
                              : `transition-[opacity,translate,filter] ${on ? "translate-y-0 opacity-100 blur-[0px] delay-150 duration-500" : "-translate-y-1 opacity-0 blur-[2px] duration-200"}`
                          }`}
                        >
                          {noOrphan(w.text)}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* the system card */}
      <div className="relative isolate flex w-full items-center justify-center overflow-hidden rounded-3xl border border-white/8 bg-[#04060d] md:aspect-[4/3] lg:aspect-[762/804]">
        {/* light: a deep navy field, a drifting band of blue across it, a brighter corner, the brand blues pooling below */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_50%_55%,color-mix(in_srgb,var(--color-holo-25)_70%,transparent),transparent_75%)]" />
        <div
          aria-hidden
          className="vs-drift absolute -inset-1/4 -z-10 opacity-80 blur-3xl"
          style={{
            background:
              "conic-gradient(from 200deg at 60% 40%, transparent 0deg, color-mix(in srgb, var(--color-holo-50) 55%, transparent) 50deg, transparent 110deg, color-mix(in srgb, var(--color-holo-75) 35%, transparent) 200deg, transparent 260deg)",
          }}
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_88%_6%,color-mix(in_srgb,var(--color-holo-75)_40%,transparent),transparent_70%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[radial-gradient(70%_80%_at_50%_100%,color-mix(in_srgb,var(--color-holo-50)_35%,transparent),transparent_70%)]" />
        {/* texture: the dot grid, and fine grain */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[url(/images/patterns/dots.svg)] bg-center opacity-[0.06]" />
        <svg aria-hidden className="absolute inset-0 -z-10 size-full opacity-[0.12] mix-blend-overlay">
          <filter id="vs-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#vs-grain)" />
        </svg>
        <div className="flex w-full max-w-[560px] flex-col items-center gap-8 px-8 pt-14 pb-10 sm:px-14">
          <Diagram active={active} playing={playing} onPick={setActive} />
          {/* the open value's name */}
          <div className="relative h-9 w-full" aria-live="polite">
            <AnimatePresence initial={false}>
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, delay: 0.1, ease: easeFramer } }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.25, ease: easeFramer } }}
                className="absolute inset-x-0 mx-auto flex w-fit items-center gap-2 rounded-full border border-white/15 bg-[#121725]/80 px-4 py-2 whitespace-nowrap backdrop-blur-sm"
              >
                <span className="t-body-s text-white-03">{values[active].number}</span>
                <span className="t-body-m-medium text-white">{values[active].short}</span>
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
