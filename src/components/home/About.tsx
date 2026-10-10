"use client";

import Image from "next/image";
import { useEffect, useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { stats } from "@/content/home";
import { PlayLarge } from "../icons";
import { ANIMATIONS_ENABLED, Reveal } from "../motion";
import { SubTitle } from "../SectionHeader";
import { Ticker } from "../Ticker";

const intro =
  "Kami membantu berbagai jenis bisnis dan institusi, mulai dari brand baru, startup, sampai perusahaan, tampil profesional secara online lewat website modern yang cepat dan berkualitas.";

/**
 * Characters fade from 20% to full opacity as the paragraph scrolls through the viewport.
 * Scroll progress is written to a single CSS variable; each character derives its opacity from it in CSS.
 */
function ScrollTextReveal({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] });
  const total = text.length;
  let index = 0;

  const write = (p: number) => ANIMATIONS_ENABLED && ref.current?.style.setProperty("--p", String(p * total));
  useMotionValueEvent(scrollYProgress, "change", write);
  useEffect(() => {
    if (ANIMATIONS_ENABLED) ref.current?.style.setProperty("--p", String(scrollYProgress.get() * total));
  }, [scrollYProgress, total]);

  return (
    <p
      ref={ref}
      style={{ ["--p" as string]: ANIMATIONS_ENABLED ? 0 : total }}
      className="w-full max-w-[1000px] text-center text-[26px] leading-[31px] font-normal tracking-[-1px] text-grey-01 sm:text-[36px] sm:leading-[41px] sm:tracking-[-1.5px] md:text-[48px] md:leading-[52px]"
    >
      {(() => {
        const words = text.split(" ");
        const renderWord = (word: string, wi: number) => (
          <span key={wi} className="inline-block whitespace-pre">
            {[...(wi < words.length - 1 ? `${word} ` : word)].map((c) => {
              const i = index++;
              return (
                <span key={i} style={{ opacity: `clamp(0.2, calc(0.2 + (var(--p) - ${i}) * 0.8), 1)` }}>
                  {c}
                </span>
              );
            })}
          </span>
        );
        const tailFrom = Math.max(0, words.length - 2);
        // The last two words share a no-wrap span so the paragraph never ends on a lone word.
        return (
          <>
            {words.slice(0, tailFrom).map((w, wi) => renderWord(w, wi))}
            <span className="whitespace-nowrap">{words.slice(tailFrom).map((w, ti) => renderWord(w, tailFrom + ti))}</span>
          </>
        );
      })()}
    </p>
  );
}

/** Thumbnail with a magnetic play button; tilts up from 60° as it scrolls into view. */
function IntroVideo() {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.3"] });
  const progress = useSpring(scrollYProgress, { stiffness: 300, damping: 40 });
  const scale = useTransform(progress, [0, 1], [0.8, 1]);
  const rotateX = useTransform(progress, [0, 1], [60, 0]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 20 });
  const y = useSpring(my, { stiffness: 200, damping: 20 });

  function onMove(e: PointerEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.min(len, 40) / len;
    mx.set(dx * k);
    my.set(dy * k);
  }

  return (
    <div className="relative z-[2] [perspective:2000px] max-md:w-[70%] md:w-[500px] lg:w-[600px]">
      <motion.a
        ref={ref}
        href="/#portfolio"
        aria-label="Lihat karya kami"
        style={ANIMATIONS_ENABLED ? { scale, rotateX } : undefined}
        onPointerMove={onMove}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        className="group relative block aspect-[1.5] w-full overflow-hidden rounded-3xl transition-shadow duration-500 ease-framer hover:shadow-[0_0_40px_0_#fff]"
      >
        <Image src="/images/about.png" alt="Tim sedang berdiskusi di depan layar presentasi" fill sizes="600px" className="object-cover" />
        <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/20 shadow-[inset_0_0_40px_0_#fff] transition-shadow duration-500 group-hover:shadow-[inset_0_0_80px_0_#fff]">
          <motion.span
            style={{ x, y }}
            className="flex size-20 items-center justify-center rounded-full bg-white-05 text-white transition-colors duration-300 group-hover:bg-white-03"
          >
            <PlayLarge width={40} height={40} />
          </motion.span>
        </span>
      </motion.a>
    </div>
  );
}

function StatsTicker() {
  return (
    <Ticker speed={100} gap={220} className="py-2.5">
      {stats.map((s) => (
        <span
          key={s.value}
          className="flex shrink-0 items-center gap-4 text-[64px] leading-none font-semibold tracking-[-0.08em] whitespace-nowrap uppercase md:text-[114px]"
        >
          <span className="text-grey-00">{s.value}</span>
          <span className="text-holo-75">{s.label}</span>
        </span>
      ))}
    </Ticker>
  );
}

export function About() {
  return (
    <section
      id="about"
      className="flex flex-col items-center gap-16 overflow-clip bg-white py-16 md:gap-24 md:py-24 lg:gap-[120px] lg:py-[120px]"
    >
      <div className="flex w-full max-w-[1280px] flex-col items-center px-5 md:px-10 lg:px-20">
        <div className="flex w-full max-w-[850px] flex-col items-center gap-6">
          <Reveal>
            <SubTitle number="001" name="tentang kami" />
          </Reveal>
          <ScrollTextReveal text={intro} />
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center">
        <div className="absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2">
          <StatsTicker />
        </div>
        <IntroVideo />
      </div>
    </section>
  );
}
