"use client";

import { useEffect, useRef, useState } from "react";
import { services, type Service } from "@/content/home";
import { useMedia } from "@/lib/useMedia";
import { Reveal } from "../motion";
import { CompanyProfileArt, LandingPageArt, OnlineStoreArt, WebAppArt, type StoryProps } from "./ServiceArt";
import { bentoCard as card } from "./surfaces";

const arts = { company: CompanyProfileArt, landing: LandingPageArt, store: OnlineStoreArt, webapp: WebAppArt };

/** Each illustration's canvas (its SVG viewBox), so the box waiting for it has its exact shape. */
const artSize: Record<Service["art"], [number, number]> = { company: [740, 480], landing: [560, 310], webapp: [560, 310], store: [740, 480] };

/**
 * The live illustration, mounted only once its card comes near the screen; until then an empty box of the same
 * shape. The four SVGs are about half the page's DOM, so leaving them out of the first render saves the load
 * its layout and hydration (and they're decorative: the title and text say it in words).
 */
function LazyArt({ art, story }: { art: Service["art"]; story: StoryProps }) {
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

/** Where each card's blue glow rises from (along the bottom edge), so the four aren't identical. */
const glowAt: Record<Service["art"], string> = { company: "68%", landing: "28%", webapp: "74%", store: "58%" };

/**
 * A service bento: title and story over its live illustration, which runs edge to edge (the bottom, and the
 * sides it touches) so the mock-up reads as part of the card. Wide cards put the text on the left from md.
 */
function ServiceCard({ service, story }: { service: Service; story: StoryProps }) {
  const { title, text, art, wide } = service;
  return (
    <div className={`${card} relative isolate flex h-full w-full flex-col overflow-hidden ${wide ? "md:flex-row" : ""}`}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: `radial-gradient(75% 70% at ${glowAt[art]} 100%, color-mix(in srgb, var(--color-holo-75) 20%, transparent), transparent)` }}
      />
      <div className={`flex flex-col gap-2 p-8 pb-0 md:p-10 ${wide ? "md:w-[32%] md:shrink-0 md:pr-0" : "md:pb-0"}`}>
        <h3 className="t-title-m text-grey-01">{title}</h3>
        <p className="t-body-m text-balance text-grey-03">{text}</p>
      </div>
      <div className={`mt-auto pt-6 ${wide ? "md:min-w-0 md:flex-1 md:pt-10" : ""}`}>
        <LazyArt art={art} story={story} />
      </div>
    </div>
  );
}

/**
 * The four service bentos, 1 1 2 / 3 4 4 on desktop (wide cards span two columns), 1 1 / 2 3 / 4 4 on tablets,
 * stacked on phones. One illustration plays at a time: the hovered card, or else each in turn (desktop);
 * the card crossing the middle of the screen (touch screens).
 */
export function ServiceBento() {
  const hover = useMedia("(hover: hover) and (pointer: fine)");
  const [hovered, setHovered] = useState<number | null>(null);
  const [turn, setTurn] = useState(0);
  const [centre, setCentre] = useState(0);
  const cards = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (hover) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCentre(Number((e.target as HTMLElement).dataset.card))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    cards.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [hover]);

  const active = hover ? (hovered ?? turn) : centre;
  return (
    <div className="flex flex-col gap-2 md:grid md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[420px_420px]">
      {services.map((s, i) => (
        <Reveal key={s.art} y={50} delay={[0.2, 0.3, 0.25, 0.35][i]} amount={0.2} className={`lg:min-h-0 ${s.wide ? "md:col-span-2" : ""}`}>
          <div
            ref={(el) => void (cards.current[i] = el)}
            data-card={i}
            className="h-full"
            onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(i)}
            onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(null)}
          >
            <ServiceCard
              service={s}
              story={{
                active: active === i,
                // Taking turns: once this card's story has played through, the next one starts
                onLoop: () => hovered === null && setTurn((t) => (t === i ? (i + 1) % services.length : t)),
              }}
            />
          </div>
        </Reveal>
      ))}
    </div>
  );
}
