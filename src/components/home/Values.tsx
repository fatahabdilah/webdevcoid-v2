import { RiFlashlightFill, RiPenNibFill, RiVipDiamondFill, type RemixiconComponentType } from "@remixicon/react";
import { values } from "@/content/home";
import { Reveal } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { Lines } from "../Lines";
import { noOrphan } from "@/lib/text";

/*
 * "Kenapa kami": three value cards, the design the owner liked (restored after the self-playing list + system
 * diagram version, which is archived in social/archive/kenapa-kami-system/). White section: each card is a light
 * shell around a dark tile (navy-black, the site's one black: the pricing Custom card, the liquid-metal button) with a dotted field, the value's icon in a blue-glowing double ring on a brand-blue disc,
 * and its number tab at the tile's foot.
 */

/** The values' glyphs (Remix Icon): a pen nib for custom design, a diamond for premium, a flash for fast. */
const ICONS: Record<string, RemixiconComponentType> = { custom: RiPenNibFill, premium: RiVipDiamondFill, fast: RiFlashlightFill };

function ValueCard({ number, title, text, icon }: (typeof values)[number]) {
  const Icon = ICONS[icon];
  return (
    <div className="flex h-full w-full flex-col items-center gap-2 overflow-hidden rounded-3xl border border-white bg-grey-08 p-2 shadow-[0_0_0_1px_var(--color-grey-07),0_10px_30px_-18px_rgba(0,0,0,0.25)] lg:items-start lg:justify-between">
      <div className="relative flex h-[228px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#363a44_-143.93%,#00040f_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] lg:aspect-square lg:h-auto">
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 z-0 size-[310px] -translate-x-1/2 -translate-y-1/2 bg-[url(/images/patterns/dots.svg)] bg-center opacity-10"
        />
        {/* Icon in a blue-glowing double ring; the disc runs light blue → blue (brand gradient) */}
        <div className="relative rounded-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-holo-75)_5%,transparent)_0%,transparent_100%)] p-3">
          <div className="rounded-full bg-holo-75/30 p-2 shadow-[0_0_80px_0_color-mix(in_srgb,var(--color-holo-75)_60%,transparent)] backdrop-blur-md">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(180deg,var(--color-holo-75)_0%,var(--color-holo-50)_100%)] shadow-[0_2px_4px_0_color-mix(in_srgb,var(--color-holo-25)_50%,transparent),inset_0_0_24px_0_rgba(255,255,255,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.6)] lg:size-30">
              {Icon && <Icon aria-hidden className="size-10 text-white lg:size-14" />}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-lg bg-[linear-gradient(180deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_100%)] p-2 backdrop-blur-[5px]">
          <span className="t-body-s block text-white md:t-caption lg:t-body-m">{number}</span>
        </div>
      </div>
      <div className="flex w-[88%] flex-col gap-2 p-4 text-center md:w-full lg:px-5 lg:py-6">
        <h3 className="t-body-l-medium text-grey-01 lg:t-title-s">
          <Lines text={title} />
        </h3>
        <p className="t-body-m text-grey-03">{noOrphan(text)}</p>
      </div>
    </div>
  );
}

export function Values() {
  return (
    <section id="values" className="flex justify-center bg-white px-5 py-16 md:px-10 md:py-20 lg:px-20 lg:py-[100px]">
      <div className="flex w-full max-w-[1040px] flex-col items-center gap-12 md:gap-16 lg:gap-20">
        <SectionHeader
          number="002"
          name="kenapa kami"
          title="Kenapa webdev.co.id?"
          body="Website yang bukan cuma bagus dilihat, tapi cepat dan mendukung tujuan bisnismu."
        />
        <div className="flex w-full max-w-[400px] flex-col items-stretch gap-2 md:max-w-none md:flex-row">
          {values.map((v, i) => (
            <Reveal key={v.number} y={50} delay={i * 0.2} amount={0.3} className="flex-1">
              <ValueCard {...v} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
