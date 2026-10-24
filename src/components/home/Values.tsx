import { values } from "@/content/home";
import { Reveal } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { Lines } from "../Lines";
import { noOrphan } from "@/lib/text";
import { bentoCard, cardTitle, cardWords } from "./surfaces";
import { BriefVisual, GrowthVisual, WorkVisual } from "./ValueVisuals";

/*
 * "Kenapa kami": three cards (layout after the owner's Figma, Brand Hub 1174:261), set like the Layanan cards since
 * the owner found this the one weak section (2026-10-24): the shared light card surface with a soft blue glow in its
 * top right corner, a large visual on top whose edges fade into the card, then a t-title-m title and a t-body-m line,
 * centred close under it. The visuals tell webdev.co.id's own story, see ValueVisuals.tsx.
 */

const visuals = [
  { node: <BriefVisual key="brief" />, scale: "md:scale-[1.12]" },
  { node: <WorkVisual key="work" />, scale: "" },
  { node: <GrowthVisual key="growth" />, scale: "md:scale-[1.12]" },
];

function ValueCard({ title, text, visual }: (typeof values)[number] & { visual: (typeof visuals)[number] }) {
  return (
    <article className={`${bentoCard} relative isolate flex h-full min-w-0 flex-col overflow-hidden`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 -z-10 size-[420px] rounded-full opacity-25 blur-[40px]"
        style={{ background: "radial-gradient(closest-side, var(--color-holo-75), transparent)" }}
      />
      {/* the visual, its top and bottom fading into the card */}
      <div aria-hidden className="flex h-[300px] items-end justify-center pt-6 [mask-image:linear-gradient(180deg,transparent,#000_12%,#000_88%,transparent)] md:h-[330px]">
        <div className={visual.scale ? `w-full flex justify-center ${visual.scale}` : "w-full"}>{visual.node}</div>
      </div>
      <div className={`${cardWords} items-center px-8 pt-2 pb-8 text-center md:px-10 md:pb-10`}>
        <h3 className={`${cardTitle} text-grey-01`}>
          <Lines text={title} />
        </h3>
        <p className="t-body-m max-w-[300px] text-pretty text-grey-03">{noOrphan(text)}</p>
      </div>
    </article>
  );
}

export function Values() {
  return (
    <section id="values" className="flex justify-center bg-white px-5 py-16 md:px-10 md:py-20 lg:px-20 lg:py-[100px]">
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-12 md:gap-16 lg:gap-20">
        <SectionHeader
          number="002"
          name="kenapa kami"
          title="Kenapa webdev.co.id?"
          body="Website yang bukan cuma bagus dilihat, tapi cepat dan mendukung tujuan bisnismu."
        />
        <div className="grid w-full max-w-[400px] gap-4 lg:max-w-none lg:grid-cols-3 lg:gap-6">
          {values.map((v, i) => (
            <Reveal key={v.number} y={50} delay={i * 0.15} amount={0.3} className="min-w-0">
              <ValueCard {...v} visual={visuals[i]} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
