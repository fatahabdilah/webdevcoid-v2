"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { motion } from "motion/react";
import { plans, type Plan } from "@/content/home";
import { STACKED_QUERY, useMedia } from "@/lib/useMedia";
import { waLink } from "@/content/site";
import { Button } from "../Button";
import { ArrowButton } from "../ArrowButton";
import { CtaAvatar } from "../CtaAvatar";
import { DitherDots } from "../DitherDots";
import { Badge, Check } from "../icons";
import { Reveal } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { noOrphan } from "@/lib/text";
import { RiBuilding2Fill, RiDashboardFill, RiPagesFill, type RemixiconComponentType } from "@remixicon/react";

/** Text colour follows the highlight (it slides in with a spring; the colour fades alongside). */
const fade = "transition-colors duration-300 ease-out";

/** The price, or for custom work the quote phrase ("dihitung setelah / Konsultasi") in the same slot. */
function Price({ plan, light }: { plan: Plan; light: boolean }) {
  const label = plan.quote?.label ?? (plan.from ? "mulai dari" : "");
  return (
    // Pulled up toward the tagline; the label line stays (empty or not) so prices line up across cards
    <div className="-mt-2 flex flex-col">
      <span className={`t-body-s h-[19px] ${fade} ${light ? "text-white" : "text-grey-03"}`}>{label}</span>
      <span className={`t-title-xl max-lg:text-[min(48px,12vw)] lg:t-title-l ${fade} ${light ? "text-white" : "text-grey-01"}`}>
        {plan.quote ? (
          plan.quote.value
        ) : (
          <>
            Rp{plan.price}
            <span className={`${fade} ${light ? "text-white" : "text-grey-04"}`}>.000</span>
          </>
        )}
      </span>
    </div>
  );
}

/** What each plan is (Remix Icon): one page, a company building, a dashboard. */
const planGlyphs: Record<Plan["icon"], RemixiconComponentType> = { page: RiPagesFill, building: RiBuilding2Fill, dashboard: RiDashboardFill };

/** Plan tile with the plan's glyph in white: grey glass, turning to the brand gradient on the active (highlighted)
 *  card. The gradient fades in over the grey alongside the card's text (gradients can't be colour-transitioned). */
function PlanIcon({ plan, active }: { plan: Plan; active: boolean }) {
  return (
    <div className="relative flex size-12 items-center justify-center overflow-hidden rounded-xl bg-grey-03 text-white shadow-[inset_0_0_7px_0_#fff,inset_0_-1.5px_1.2px_0_#000]">
      <span
        aria-hidden
        className={`absolute inset-0 rounded-[inherit] shadow-[inset_0_-1.5px_1.2px_0_#d7d7d7] transition-opacity duration-300 ease-out ${active ? "opacity-100" : "opacity-0"}`}
        style={{ background: "radial-gradient(70.7% 70.7% at 50% 50%, var(--color-holo-75) 0%, var(--color-holo-50) 55%, var(--color-holo-25) 100%)" }}
      />
      {(() => {
        const I = planGlyphs[plan.icon];
        return <I size={22} aria-hidden className="relative" />;
      })()}
    </div>
  );
}

const highlightSpring = { type: "spring", stiffness: 400, damping: 35 } as const;

/** Highlighted card (Figma 1076:76): the brand gradient, white at the top left to black at the bottom right. */
const highlightBg =
  "linear-gradient(-21.55deg, var(--color-holo-0) 4.68%, var(--color-holo-25) 21.37%, var(--color-holo-50) 47.43%, var(--color-holo-75) 73.98%, var(--color-holo-100) 99.53%)";

/** Premium (most expensive) plan: the dark end of the same gradient, with a light-blue sheen at the top left. */
const premiumBg = [
  "radial-gradient(90% 45% at 0% 0%, color-mix(in srgb, var(--color-holo-75) 45%, transparent), transparent)",
  "linear-gradient(-21.55deg, var(--color-holo-0) 25%, var(--color-holo-25) 65%, var(--color-holo-50) 100%)",
].join(", ");

type PlanCardProps = {
  plan: Plan;
  highlighted: boolean;
  /** Whether the highlight arrives from the premium card (it starts dark and clears on the way). */
  fromPremium: boolean;
  /** Desktop: the pointer picks the card. Off on stacked layouts, where scrolling does. */
  pointer: boolean;
  onActivate: () => void;
};

function PlanCard({ plan, highlighted, fromPremium, pointer, onActivate }: PlanCardProps) {
  return (
    <div
      // Mouse/pen: follow the pointer; a tap also selects (a touch's enter/leave would fire on every
      // swipe that starts on a card, flashing the highlight while scrolling)
      onPointerEnter={pointer ? (e) => e.pointerType !== "touch" && onActivate() : undefined}
      onClick={pointer ? onActivate : undefined}
      onFocusCapture={onActivate}
      data-plan=""
      data-premium={plan.premium ? "" : undefined}
      className="relative isolate flex flex-col gap-8 rounded-2xl p-6 lg:flex-1 lg:p-8"
    >
      {/* Blue highlight shared by all cards; it slides to whichever card is hovered */}
      {highlighted && (
        <motion.div
          layoutId="plan-highlight"
          transition={highlightSpring}
          className="absolute inset-0 -z-10 overflow-hidden border border-white shadow-[inset_0_0_19px_0_rgba(0,0,0,0.25)]"
          // In style (not a class) so Motion keeps the corners round while the box stretches between cards
          style={{ backgroundImage: highlightBg, borderRadius: 16 }}
        >
          {/* The premium tint travels with the highlight: it darkens while sliding onto the premium card and
              clears while sliding off, instead of sitting on that card waiting for the highlight to arrive */}
          <motion.div
            aria-hidden
            className="absolute inset-0 shadow-[inset_0_0_19px_0_rgba(0,0,0,0.25)]"
            style={{ backgroundImage: premiumBg }}
            initial={{ opacity: fromPremium ? 1 : 0 }}
            animate={{ opacity: plan.premium ? 1 : 0 }}
            // Same spring as the slide, so the tint's progress matches the highlight's position frame by frame
            transition={highlightSpring}
          />
        </motion.div>
      )}
      <div className="relative flex flex-col gap-6 border-b border-grey-07 pb-6 lg:pb-8">
        <PlanIcon plan={plan} active={highlighted} />
        <div className="flex flex-col gap-2">
          <h3 className={`t-title-m ${fade} ${highlighted ? "text-white" : "text-grey-01"}`}>{noOrphan(plan.name)}</h3>
          <p className={`t-body-m text-balance ${fade} ${highlighted ? "text-white" : "text-grey-03"}`}>{noOrphan(plan.tagline)}</p>
        </div>
        <Price plan={plan} light={highlighted} />

        {plan.featured && (
          <div className="absolute top-0 right-0 h-8 overflow-hidden rounded-xl p-px" style={{ backgroundImage: "var(--holo-gradient)" }}>
            <div className="relative flex h-[30px] items-center justify-center gap-1 overflow-hidden rounded-[11px] bg-black px-2 py-1">
              <Image src="/images/patterns/dots-badge.png" alt="" width={116} height={170} className="pointer-events-none absolute top-1/2 left-0 w-full opacity-20" />
              <Badge width={16} height={16} className="relative text-white" />
              <span className="t-body-s relative whitespace-nowrap text-white">Rekomendasi</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-8">
        <ul className="flex flex-col gap-1">
          {plan.features.map((f) => (
            <li key={f.label} className={`flex items-start gap-2 ${f.included ? "" : "opacity-40"}`}>
              {f.included ? (
                <Check width={16} height={16} className={`mt-[2.4px] size-4 shrink-0 ${fade} ${highlighted ? "text-white" : "text-grey-01"}`} />
              ) : (
                <span aria-hidden className={`mt-[2.4px] flex size-4 items-center justify-center ${fade} ${highlighted ? "text-white" : "text-grey-03"}`}>
                  –
                </span>
              )}
              <span className={`t-body-m ${fade} ${highlighted ? "text-white" : "text-grey-03"} ${f.included ? "" : "line-through"}`}>
                {noOrphan(f.label)}
                {!f.included && <span className="sr-only"> (tidak termasuk)</span>}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3">
          <Button href={waLink(`Halo webdev.co.id, saya tertarik dengan ${plan.name}.`)} block muted={!highlighted} inverted={highlighted}>
            {plan.cta}
          </Button>
          <p className="t-body-s text-grey-04">{noOrphan(plan.renewal)}</p>
        </div>
      </div>
    </div>
  );
}

/** Curtains of the aurora ambient: position and width in % of the section, drift period and offset in s. */
const auroraBands = [
  { kind: "shade", x: -6, w: 16, t: 11, d: -3 },
  { kind: "light", x: 4, w: 14, t: 9, d: -6 },
  { kind: "shade", x: 18, w: 12, t: 13, d: -1 },
  { kind: "light", x: 24, w: 16, t: 10, d: -4 },
  { kind: "shade", x: 40, w: 16, t: 12, d: -8 },
  { kind: "light", x: 46, w: 12, t: 8, d: -2 },
  { kind: "light", x: 58, w: 16, t: 11, d: -7 },
  { kind: "shade", x: 66, w: 12, t: 9, d: -5 },
  { kind: "light", x: 76, w: 14, t: 12, d: -3 },
  { kind: "shade", x: 86, w: 18, t: 10, d: -9 },
  { kind: "light", x: 92, w: 12, t: 9, d: -1 },
];

/** Ambient behind the section while the premium plan is active (.aurora in globals.css). */
function Aurora({ on, ref }: { on: boolean; ref: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={ref} aria-hidden className="aurora" data-on={on ? "" : undefined}>
      {auroraBands.map((b, i) => (
        <i
          key={i}
          className={b.kind}
          style={{ left: `${b.x}%`, width: `${b.w}%`, animationDuration: `${b.t}s`, animationDelay: `${b.d}s` } as CSSProperties}
        />
      ))}
      <DitherDots on={on} />
    </div>
  );
}

export function Pricing() {
  const featured = Math.max(0, plans.findIndex((p) => p.featured));
  // The highlighted card, and the one the highlight came from (so the premium tint can travel with it)
  const [selection, setSelection] = useState({ active: featured, from: featured });
  const { active } = selection;
  const setActive = (i: number) => setSelection((s) => (s.active === i ? s : { active: i, from: s.active }));
  const fromPremium = !!plans[selection.from]?.premium;
  // Stacked layouts (phones, tablets): the highlight follows the scroll instead of the pointer
  const stacked = useMedia(STACKED_QUERY);
  // The aurora ambient shows while the premium (most expensive) plan is the active one
  const ambient = !!plans[active]?.premium;
  const sectionRef = useRef<HTMLElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  // The header switches tone a beat after the ambient, once the reveal has reached (or left) it
  const [headerDark, setHeaderDark] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setHeaderDark(ambient), ambient ? 450 : 300);
    return () => window.clearTimeout(t);
  }, [ambient]);

  // Stacked: the card nearest the middle of the screen is the active one (the premium card turns the
  // ambient on as it scrolls into the middle). Off screen, it rests on the featured card again.
  useEffect(() => {
    const section = sectionRef.current;
    if (!stacked || !section) return;
    const cards = [...section.querySelectorAll<HTMLElement>("[data-plan]")];
    let raf = 0;
    const update = () => {
      raf = 0;
      const s = section.getBoundingClientRect();
      if (s.bottom < 0 || s.top > innerHeight) return setActive(featured);
      const mid = innerHeight / 2;
      let best = featured;
      let nearest = Infinity;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < nearest) [nearest, best] = [d, i];
      });
      setActive(best);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, [stacked, featured]);

  // The ambient opens from the premium card's centre: measure it (and how far the circle must
  // reach to cover the section) just before it turns on.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const aurora = auroraRef.current;
    const card = section?.querySelector<HTMLElement>("[data-premium]");
    if (!ambient || !section || !aurora || !card) return;
    // measured against the ambient itself, which reaches past the section top and bottom
    const s = aurora.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    const x = c.left + c.width / 2 - s.left;
    const y = c.top + c.height / 2 - s.top;
    const reach = Math.hypot(Math.max(x, s.width - x), Math.max(y, s.height - y)) + 200;
    aurora.style.setProperty("--ox", `${x}px`);
    aurora.style.setProperty("--oy", `${y}px`);
    aurora.style.setProperty("--reach", `${reach}px`);
  }, [ambient]);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative isolate flex justify-center overflow-x-clip px-5 pt-24 pb-28 md:px-10 md:pt-28 md:pb-36 lg:px-20 lg:pt-[140px] lg:pb-[180px]"
    >
      <Aurora on={ambient} ref={auroraRef} />
      <div className="flex w-full max-w-[1040px] flex-col items-center gap-12 md:gap-16 lg:gap-20">
        <SectionHeader
          tone={headerDark ? "dark" : "light"}
          pillTone={headerDark ? "dark" : "light"}
          titleGradient={false}
          number="006"
          name="harga"
          title="Pilih yang pas untuk bisnismu"
          body="Sudah termasuk domain, hosting, dan SSL tahun pertama. Tanpa biaya tersembunyi."
        />
        <div className="flex w-full flex-col gap-2">
          <Reveal
            y={50}
            amount={0.1}
            onPointerLeave={(e) => !stacked && e.pointerType !== "touch" && setActive(featured)}
            className={`flex w-full flex-col gap-2 rounded-3xl p-2 transition-colors duration-700 ease-out md:p-2 lg:flex-row lg:gap-2 ${ambient ? "bg-white/88" : "bg-grey-08"}`}
          >
            {plans.map((p, i) => (
              <PlanCard key={p.name} plan={p} highlighted={active === i} fromPremium={fromPremium} pointer={!stacked} onActivate={() => setActive(i)} />
            ))}
          </Reveal>

          <Reveal
            y={50}
            delay={0.2}
            amount={0.3}
            className="flex w-full flex-col items-center gap-6 overflow-hidden rounded-3xl border border-grey-07 p-10 shadow-[inset_0_0_1px_2px_rgba(255,255,255,0.3),inset_0_-2px_1px_0_rgba(0,0,0,0.12),inset_0_0_40px_0_rgba(255,255,255,0.15)]"
            style={{ backgroundImage: "var(--holo-radial)" }}
          >
            <div className="flex w-full flex-col items-center gap-6">
              <CtaAvatar image="/images/avatars/cta-pricing.png" />
              <div className="flex w-full flex-col items-center gap-2 text-center">
                <h3 className="t-title-m text-balance text-white">Belum yakin mana yang&nbsp;pas?</h3>
                <p className="t-body-m text-white-02">Ceritakan kebutuhanmu, kami sarankan pilihan yang sesuai&nbsp;anggaran.</p>
              </div>
            </div>
            <ArrowButton>Konsultasi Gratis</ArrowButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
