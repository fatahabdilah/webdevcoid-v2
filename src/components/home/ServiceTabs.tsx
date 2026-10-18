"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { services, type ServiceArtName } from "@/content/home";
import { noOrphan } from "@/lib/text";
import { Check } from "../icons";
import { easeFramer } from "../motion";
import { CompanyProfileArt, LandingPageArt, OnlineStoreArt, WebAppArt, type StoryProps } from "./ServiceArt";
import { bentoCard as card } from "./surfaces";

const arts = { company: CompanyProfileArt, landing: LandingPageArt, store: OnlineStoreArt, webapp: WebAppArt };

/** Each illustration's canvas (its SVG viewBox), so the box waiting for it has its exact shape. */
const artSize: Record<ServiceArtName, [number, number]> = { company: [740, 480], landing: [560, 310], webapp: [560, 310], store: [740, 480] };

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

/** One service's text: title, story, its three points and (Custom) the example chips. No prices here (the owner's call; they live in Harga). */
function Story({ service: s, shown, onShow }: { service: (typeof services)[number]; shown: number; onShow: (i: number) => void }) {
  return (
    <div className="flex flex-col">
      <h3 className="t-title-l text-grey-01">{s.title}</h3>
      <p className="t-body-l mt-3 max-w-[30ch] text-grey-03">{noOrphan(s.text)}</p>
      <ul className="mt-6 flex flex-col gap-3">
        {s.points.map((p) => (
          <li key={p} className="t-body-m flex items-start gap-2.5 text-grey-01">
            <Check width={18} height={18} className="mt-0.5 shrink-0 text-holo-50" />
            {p}
          </li>
        ))}
      </ul>
      {s.arts.length > 1 && (
        <div className="mt-8 flex items-center gap-2" role="group" aria-label="Contoh">
          {s.arts.map((x, i) => (
            <button
              key={x.art}
              type="button"
              aria-pressed={i === shown}
              onClick={() => onShow(i)}
              className={`t-body-s cursor-pointer rounded-full border px-3 py-1.5 transition-colors duration-300 ${i === shown ? "border-holo-50 bg-holo-50 text-white" : "border-grey-07 text-grey-03 hover:border-grey-04"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const swap = {
  initial: { opacity: 0, y: 12, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: easeFramer } },
  exit: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.2, ease: easeFramer } },
};

/**
 * Layanan (option C of the owner's layout study, Figma 1428:108): tabs for the three services, in the order of the
 * pricing plans, over one large card: the service's story and three points on the left; its live
 * illustration large on the right (Custom shows an online store and a dashboard in turn, or on its chips). Opens on
 * Company Profile, the recommended plan. Arrow keys move between tabs.
 */
export function ServiceTabs() {
  const start = Math.max(0, services.findIndex((s) => s.key === "company"));
  const [tab, setTab] = useState(start);
  const [shown, setShown] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const s = services[tab];
  const a = s.arts[shown] ?? s.arts[0];
  const [w, h] = artSize[a.art];

  const select = (i: number) => {
    setTab(i);
    setShown(0);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = (tab + (e.key === "ArrowRight" ? 1 : services.length - 1)) % services.length;
    select(i);
    tabs.current[i]?.focus();
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 md:gap-6">
      <div role="tablist" aria-label="Jenis website" onKeyDown={onKey} className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-grey-07 bg-grey-08 p-1">
        {services.map((x, i) => {
          const on = i === tab;
          return (
            <button
              key={x.key}
              ref={(el) => void (tabs.current[i] = el)}
              id={`service-tab-${x.key}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="service-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              className={`t-body-s md:t-body-m-medium relative cursor-pointer rounded-full px-4 py-2.5 whitespace-nowrap transition-colors duration-300 md:px-6 ${on ? "text-white" : "text-grey-03 hover:text-grey-01"}`}
            >
              {on && <motion.span layoutId="service-tab-pill" aria-hidden className="absolute inset-0 rounded-full bg-grey-01 shadow-[0_6px_14px_-8px_rgba(0,0,0,0.5)]" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
              <span className="relative">{x.title}</span>
            </button>
          );
        })}
      </div>

      <div
        id="service-panel"
        role="tabpanel"
        aria-labelledby={`service-tab-${s.key}`}
        className={`${card} relative isolate grid w-full grid-cols-1 overflow-hidden lg:h-[500px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(70% 75% at 72% 100%, color-mix(in srgb, var(--color-holo-75) 20%, transparent), transparent)" }}
        />
        {/* the service: story, points, price. Every tab's block sits in the same grid cell (the others invisible), so the
            column is always as tall as the longest and switching tabs never moves the page. */}
        <div className="grid items-center p-8 md:p-10 lg:py-12 lg:pr-4 lg:pl-12">
          {services.map((x) => (
            <div key={x.key} aria-hidden className="invisible [grid-area:1/1]">
              <Story service={x} shown={0} onShow={() => {}} />
            </div>
          ))}
          <div className="[grid-area:1/1]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={s.key} {...swap}>
                <Story service={s} shown={shown} onShow={setShown} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* the live illustration, large; a fixed box below desktop so switching tabs never moves the page */}
        <div className="relative flex aspect-[740/480] items-end justify-center overflow-hidden px-4 md:px-10 lg:aspect-auto lg:h-full lg:px-0 lg:pt-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${s.key}-${a.art}`} {...swap} className="w-full" style={{ maxWidth: `${(w / 740) * 100}%` }}>
              <div style={{ aspectRatio: `${w} / ${h}` }}>
                <LazyArt
                  art={a.art}
                  story={{
                    active: true,
                    // Custom: when one example's story has played through, show the other
                    onLoop: () => s.arts.length > 1 && setShown((i) => (i + 1) % s.arts.length),
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
