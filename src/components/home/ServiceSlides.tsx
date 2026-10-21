"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import { services, type ServiceArtName } from "@/content/home";
import { noOrphan } from "@/lib/text";
import { Check } from "../icons";
import { easeFramer } from "../motion";
import { CompanyProfileArt, LandingPageArt, OnlineStoreArt, storyLength, WebAppArt, type StoryProps } from "./ServiceArt";
import { bentoCard as card } from "./surfaces";

const arts = {
  company: CompanyProfileArt,
  landing: LandingPageArt,
  store: OnlineStoreArt,
  webapp: WebAppArt,
};

/** Each illustration's canvas (its SVG viewBox), so the box waiting for it has its exact shape. */
const artSize: Record<ServiceArtName, [number, number]> = {
  company: [740, 480],
  landing: [560, 310],
  webapp: [560, 310],
  store: [740, 480],
};

/**
 * The live illustration, mounted only once the card comes near the screen; until then an empty box of the same
 * shape (the SVGs are a large share of the page's DOM, and decorative: the text says it in words).
 */
function LazyArt({ art, story }: { art: ServiceArtName; story: StoryProps }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Art = arts[art];
  const [w, h] = artSize[art];
  return near ? <Art {...story} /> : <div ref={ref} aria-hidden className="w-full" style={{ aspectRatio: `${w} / ${h}` }} />;
}

/** One service's text: title, story and its three points. No prices here (the owner's call; they live in Harga). */
function Story({ service: s }: { service: (typeof services)[number] }) {
  return (
    <div className="flex flex-col">
      <h3 className="t-title-m text-grey-01 sm:t-title-l">{s.title}</h3>
      <p className="t-body-l mt-3 max-w-[30ch] text-grey-03">{noOrphan(s.text)}</p>
      <ul className="mt-5 flex flex-col gap-3">
        {s.points.map((p) => (
          <li key={p} className="t-body-m flex items-start gap-2.5 text-grey-01">
            <Check width={18} height={18} className="mt-0.5 shrink-0 text-holo-50" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

const swap = {
  initial: { opacity: 0, y: 12, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: easeFramer },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: easeFramer },
  },
};

/** Prev / next: a round outline button, like the reference's. */
function Step({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const Icon = dir === "prev" ? RiArrowLeftLine : RiArrowRightLine;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Layanan sebelumnya" : "Layanan berikutnya"}
      className="grid size-10 cursor-pointer place-items-center rounded-full border border-grey-07 bg-white text-grey-01 shadow-[var(--shadow-card)] transition-colors duration-300 hover:border-grey-01 hover:bg-grey-01 hover:text-white"
    >
      <Icon className="size-5" />
    </button>
  );
}

/**
 * Layanan: the three services as slides of one large card (after the owner's reference: numbered steps above the
 * story, round prev / next buttons; the live illustration large on the right). In the pricing plans' order,
 * opening on Company Profile, the recommended plan. It moves on by itself: when a service's illustration has played
 * its story through (Custom: both of its examples), the next one comes: the active number's ring fills over that time
 * and moving on is its end, so pausing the ring pauses the slides. It pauses while the pointer is over the card (they
 * are reading) and while the card is off screen. Once the visitor picks a slide (a number, an arrow or the arrow keys), it
 * stays put.
 */
export function ServiceSlides() {
  const start = Math.max(
    0,
    services.findIndex((s) => s.key === "company"),
  );
  const [tab, setTab] = useState(start);
  const [shown, setShown] = useState(0);
  const [auto, setAuto] = useState(true);
  const [onScreen, setOnScreen] = useState(false);
  const [reading, setReading] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const s = services[tab];
  const a = s.arts[shown] ?? s.arts[0];
  const [w, h] = artSize[a.art];
  const n = services.length;
  // the ring runs as long as the whole slide plays (all of its examples), and only while the card is in view
  const length = s.arts.reduce((t, x) => t + storyLength(x.art), 0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (i: number, byHand = true) => {
    setTab((i + n) % n);
    setShown(0);
    if (byHand) setAuto(false);
  };
  // an example's story has played through: Custom shows its other one (the ring's end moves to the next service)
  const onLoop = () => s.arts.length > 1 && setShown((shown + 1) % s.arts.length);
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    go(tab + (e.key === "ArrowRight" ? 1 : -1));
  };

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Jenis website"
      onKeyDown={onKey}
      onPointerEnter={(e) => e.pointerType === "mouse" && setReading(true)}
      onPointerLeave={() => setReading(false)}
      className={`${card} relative isolate grid w-full grid-cols-1 overflow-hidden lg:h-[400px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(70% 75% at 72% 100%, color-mix(in srgb, var(--color-holo-75) 20%, transparent), transparent)",
        }}
      />
      <div className="flex flex-col gap-8 p-8 md:p-10 lg:gap-0 lg:py-8 lg:pr-4 lg:pl-12">
        {/* the numbered steps on top (the active one fills, with a ring that runs while it plays) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" role="group" aria-label="Pilih layanan">
            {services.map((x, i) => {
              const on = i === tab;
              return (
                <button
                  key={x.key}
                  type="button"
                  aria-label={x.title}
                  aria-current={on}
                  onClick={() => go(i)}
                  className={`t-body-s relative grid size-10 cursor-pointer place-items-center rounded-full font-medium transition-colors duration-300 ${on ? "bg-grey-01 text-white" : "border border-grey-07 text-grey-03 hover:border-grey-04 hover:text-grey-01"}`}
                >
                  {i + 1}
                  {on && auto && (
                    <svg aria-hidden viewBox="0 0 48 48" className="pointer-events-none absolute -inset-1 size-12 -rotate-90">
                      <circle
                        key={`${tab}-${onScreen}`}
                        cx="24"
                        cy="24"
                        r="23"
                        pathLength="1"
                        fill="none"
                        stroke="var(--color-holo-50)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="service-ring"
                        onAnimationEnd={() => go(tab + 1, false)}
                        style={
                          {
                            animationDuration: `${length}ms`,
                            animationPlayState: onScreen && !reading ? "running" : "paused",
                          } as CSSProperties
                        }
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          {/* prev / next: beside the numbers on phones, in the card's bottom right corner on desktop */}
          <div className="flex items-center gap-2 lg:absolute lg:right-6 lg:bottom-6 lg:z-[1]">
            <Step dir="prev" onClick={() => go(tab - 1)} />
            <Step dir="next" onClick={() => go(tab + 1)} />
          </div>
        </div>

        {/* the service: story and points. Every slide's block sits in the same grid cell (the others invisible), so the
            column is always as tall as the longest and changing slides never moves the page. */}
        <div className="grid lg:my-auto" aria-live={auto ? "off" : "polite"}>
          {services.map((x) => (
            <div key={x.key} aria-hidden className="invisible [grid-area:1/1]">
              <Story service={x} />
            </div>
          ))}
          <div className="[grid-area:1/1]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={s.key} {...swap}>
                <Story service={s} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* the live illustration, large; a fixed box below desktop so changing slides never moves the page */}
      <div className="relative flex aspect-[740/480] items-end justify-center overflow-hidden px-4 md:px-10 lg:aspect-auto lg:h-full lg:px-0 lg:pt-12">
        <AnimatePresence mode="wait" initial={false}>
          {/* on desktop the card is 400px: the art is capped to the height left above it (400 − 48 top padding) */}
          <motion.div
            key={`${s.key}-${a.art}`}
            {...swap}
            className="w-full max-w-[var(--fit-w)] lg:max-w-[min(var(--fit-w),var(--fit-h))]"
            style={
              {
                "--fit-w": `${(w / 740) * 100}%`,
                "--fit-h": `${Math.round((352 * w) / h)}px`,
              } as CSSProperties
            }
          >
            <div style={{ aspectRatio: `${w} / ${h}` }}>
              <LazyArt art={a.art} story={{ active: true, onLoop }} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
