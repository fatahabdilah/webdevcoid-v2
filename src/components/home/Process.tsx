"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { steps } from "@/content/home";
import { ProcessGraph, ProcessMagnify, ProcessRocket, ProcessSettings, ProcessStructure } from "../icons";
import { Reveal } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { noOrphan } from "@/lib/text";

const icons = {
  magnify: ProcessMagnify,
  structure: ProcessStructure,
  settings: ProcessSettings,
  graph: ProcessGraph,
  rocket: ProcessRocket,
};

const ease = "duration-500 ease-[cubic-bezier(0.44,0,0.56,1)]";
/** Section background; inactive steps sit flush on it. */
const sectionBg = "bg-[#101010]";
/** Highlight behind an active step. */
const activeStepBg = "bg-[linear-gradient(180deg,#1e1e1e_0%,#000_205.06%)]";
/** Icon and text of steps the fill hasn't reached yet are shown at 20%. Applied per part rather than
 *  on the whole step, so the dot keeps sitting above the rail. */
const dimmed = (active: boolean) => `transition-opacity ${ease} ${active ? "opacity-100" : "opacity-20"}`;

/**
 * Step background: the section colour with the step gradient faded in once the step is reached
 * (gradients can't be colour-transitioned, so the overlay's opacity is animated instead).
 * `half` renders just the top or bottom half of that surface, lined up with the step's gradient.
 */
function StepSurface({ active, className = "", half }: { active: boolean; className?: string; half?: "top" | "bottom" }) {
  return (
    <span aria-hidden className={`absolute ${sectionBg} ${className}`}>
      <span
        className={`absolute inset-0 rounded-[inherit] transition-opacity ${ease} ${activeStepBg} ${half ? `bg-[length:100%_200%] ${half === "top" ? "bg-top" : "bg-bottom"}` : ""} ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}

function Dot({ active }: { active: boolean }) {
  return (
    <span
      className={`relative flex size-9 shrink-0 rounded-xl p-[3px] transition-[background] ${ease}`}
      style={{ background: active ? "linear-gradient(270deg, var(--color-holo-0), var(--color-holo-25), var(--color-holo-50), var(--color-holo-75), var(--color-holo-100))" : "transparent" }}
    >
      <span
        className={`flex size-full items-center justify-center rounded-lg transition-all ${ease} ${
          active ? "scale-100 border-0" : "scale-[0.7] border-[3px] border-grey-02 bg-grey-00"
        }`}
        style={
          active
            ? { background: "radial-gradient(70.7% 70.7% at 50% 50%, var(--color-holo-100) 0%, var(--color-holo-75) 25%, var(--color-holo-50) 50%, var(--color-holo-25) 75%, var(--color-holo-0) 100%)" }
            : undefined
        }
      >
        <span className={`size-3 rounded-full transition-colors ${ease} ${active ? "bg-white" : "bg-grey-01"}`} />
      </span>
    </span>
  );
}

function IconBlock({ step, active, showNumber }: { step: (typeof steps)[number]; active: boolean; showNumber: boolean }) {
  const Icon = icons[step.icon];
  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative flex size-20 shrink-0 items-center justify-center rounded-xl border bg-grey-01 bg-clip-padding transition-colors ${ease} ${
          active ? "border-transparent text-white" : "border-grey-02 text-white-03"
        }`}
      >
        <span
          aria-hidden
          className={`absolute inset-0 rounded-[11px] bg-[linear-gradient(180deg,var(--color-holo-50)_0%,var(--color-holo-0)_100%)] transition-opacity ${ease} ${active ? "opacity-100" : "opacity-0"}`}
        />
        <Icon className="relative h-[34px] w-auto" />
        {/* Inner glow sits on top of the fill, as in the design */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-[11px] transition-shadow ${ease} ${
            active ? "shadow-[inset_0_0_12px_0_#000]" : "shadow-[inset_0_0_12px_0_rgba(255,255,255,0.06)]"
          }`}
        />
      </div>
      {/* Number badge: same dark chip for every step (Figma 1078:558) */}
      {showNumber && (
        <div className="flex size-8 items-center justify-center rounded-xl bg-[#1f1f1f]">
          <span className="t-body-m text-white">{step.number}</span>
        </div>
      )}
    </div>
  );
}

function Step({ step, index, active, first, last }: { step: (typeof steps)[number]; index: number; active: boolean; first: boolean; last: boolean }) {
  const mirrored = index % 2 === 1;

  return (
    <div className={`relative flex w-full items-center rounded-2xl px-4 max-md:gap-4 md:h-40 ${mirrored ? "md:px-0" : "md:px-10"}`}>
      <StepSurface active={active} className="inset-0 -z-10 rounded-2xl" />
      {/* Center column with the dot; it also masks the line above the first and below the last step */}
      <div className="relative z-[2] flex w-10 shrink-0 self-stretch items-center justify-center md:order-2 md:w-40">
        {first && <StepSurface active={active} half="top" className="inset-x-0 top-0 h-1/2" />}
        {last && <StepSurface active={active} half="bottom" className="inset-x-0 bottom-0 h-1/2" />}
        <span className="relative">
          <Dot active={active} />
        </span>
      </div>

      {/* Icon side */}
      <div className={`flex shrink-0 items-center md:flex-1 md:py-10 ${dimmed(active)} ${mirrored ? "md:order-3 md:justify-start" : "md:order-1 md:justify-end"}`}>
        <div className="md:hidden">
          <IconBlock step={step} active={active} showNumber={false} />
        </div>
        <div className="hidden md:block">
          <IconBlock step={step} active={active} showNumber />
        </div>
      </div>

      {/* Text side */}
      <div className={`flex flex-1 py-10 ${dimmed(active)} ${mirrored ? "md:order-1 md:justify-end" : "md:order-3 md:justify-start"}`}>
        <div className={`flex w-full flex-col gap-1 ${mirrored ? "md:max-w-[320px] md:text-right" : "md:max-w-[300px]"}`}>
          <h3 className="t-title-s text-white">{noOrphan(step.title)}</h3>
          <p className="t-body-m text-white-03">{noOrphan(step.text)}</p>
        </div>
      </div>
    </div>
  );
}

export function Process() {
  const mainRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const centers = useRef<number[]>([]);
  const [active, setActive] = useState(1);
  const { scrollYProgress } = useScroll({ target: mainRef, offset: ["start center", "end center"] });
  const lineY = useTransform(scrollYProgress, (p) => `${(p - 1) * 100}%`);

  useEffect(() => {
    const measure = () => {
      const main = mainRef.current;
      if (!main) return;
      centers.current = itemRefs.current.map((el) => (el ? (el.offsetTop + el.offsetHeight / 2) / main.offsetHeight : 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (mainRef.current) ro.observe(mainRef.current);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // The first step is on from the start (the rail begins at its dot); later steps light up once the fill reaches them.
    setActive(Math.max(1, centers.current.filter((c) => p >= c).length));
  });

  return (
    <section id="process" className={`flex justify-center ${sectionBg} px-5 py-16 md:px-10 md:py-20 lg:px-20 lg:py-[100px]`}>
      <div className="flex w-full max-w-[1040px] flex-col items-center gap-12 md:gap-16 lg:gap-20">
        <SectionHeader
          tone="dark"
          number="004"
          name="cara kerja"
          title="Kamu arahkan, kami yang bangun."
          // Breaks after the comma: wider than "kami yang bangun." (7.92em), narrower than "Kamu arahkan, kami" (8.49em)
          titleWidth="max-w-[8.2em]"
          body="Cukup ceritakan bisnismu lewat WhatsApp. Struktur, desain, dan kontennya kami yang susun."
        />
        <Reveal y={50} amount={0.2} className="w-full">
          {/* isolate: step surfaces (-z-10) stay behind the rail but above the section background */}
          <div ref={mainRef} className="relative isolate flex w-full flex-col gap-4">
            {steps.map((s, i) => (
              <div key={s.number} ref={(el) => void (itemRefs.current[i] = el)}>
                <Step step={s} index={i} active={i < active} first={i === 0} last={i === steps.length - 1} />
              </div>
            ))}
            {/* Grey rail with the gradient fill that follows the scroll position */}
            <div className="pointer-events-none absolute top-0 bottom-0 left-9 z-[1] w-px bg-grey-02 md:left-1/2 md:-translate-x-1/2">
              <div className="absolute inset-y-0 -left-px w-[3px] overflow-hidden">
                <motion.div
                  className="h-full w-full rounded-full"
                  style={{ y: lineY, background: "linear-gradient(180deg, var(--color-holo-0), var(--color-holo-25), var(--color-holo-50), var(--color-holo-75), var(--color-holo-100))" }}
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
