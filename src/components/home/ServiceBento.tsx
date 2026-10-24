import Image from "next/image";
import {
  RiBarChartBoxFill,
  RiFileList3Fill,
  RiQuestionMark,
  RiShoppingBag3Fill,
  type RemixiconComponentType,
} from "@remixicon/react";
import { services, type Service } from "@/content/home";
import { noOrphan } from "@/lib/text";
import { ScreenCompare } from "./ScreenCompare";
import { bentoCard, cardTitle, cardWords } from "./surfaces";
import "./service-bento.css";

/*
 * Layanan as a bento on the owner's grid "1 1 2 / 3 4 4" (the row under it, "5 6 6", is the consultation and
 * "Sudah termasuk" in Services.tsx), after the owner's reference (2026-10-24): contentrewards.com "The best by
 * design." (plain light cards, a big title and a larger grey line at the top left, small product UI floating in the
 * rest: fanned coloured cards, a review box, floating tags, a dark checklist) rebuilt with webdev.co.id's own content
 * and brand blues. 400px tall on desktop like the row under it. Animations are CSS (service-bento.css), transform and
 * opacity only, still with reduced motion.
 */

const byKey = Object.fromEntries(services.map((s) => [s.key, s])) as Record<Service["key"], Service>;

const card = `${bentoCard} relative isolate flex flex-col overflow-hidden p-8 md:p-10 lg:h-[400px]`;

/** The card's words, set like the other sections' cards (surfaces.ts). */
function Words({ s, className = "" }: { s: Service; className?: string }) {
  return (
    <div className={`relative z-[1] ${cardWords} ${className}`}>
      <h3 className={`${cardTitle} text-grey-01`}>{s.title}</h3>
      <p className="t-body-m max-w-[293px] text-pretty text-grey-03">{noOrphan(s.text)}</p>
    </div>
  );
}

/* 1 · Custom */

/*
 * After the owner's Figma (Brand Hub 1472:9036 for the layout, 1472:10024 for the cards, 2026-10-24): the words
 * centred on the left, and four 217 × 310 playing cards with a white hairline fading out towards the bottom, an inset
 * sheen and a long soft shadow (on the two middle ones), leaning a little (-6° / -2° / 0° / 5°) and rising to the right
 * at the Figma's own spots on an 851 × 400 card, running past its foot, with a blue glow in the top right corner. Colours follow the Figma
 * (grey, black, orange) with a brand-blue Dashboard, the owner's call for this card only. Each holds a glyph in a soft round, its name and one
 * line (like contentrewards.com "Flexible"), and a white panel of the thing itself, skewed and tilted like a card on a
 * table, cut by the card's foot; the black one is "Ide kamu?" with a big skewed "?". On hover each card rises on its own.
 */
const fanShadow =
  "shadow-[-168px_91px_54px_0_rgba(0,0,0,0.01),-108px_58px_49px_0_rgba(0,0,0,0.05),-61px_33px_41px_0_rgba(0,0,0,0.17),-27px_15px_31px_0_rgba(0,0,0,0.29),-6px_4px_17px_0_rgba(0,0,0,0.33)]";

/** Leaning to the left (Toko online, Sistem) or to the right (Dashboard, the "?"), as in the Figma. */
const leanLeft = "rotate(-5deg) skewX(10deg) scaleY(0.98)";
const leanRight = "rotate(5deg) skewX(-10deg) scaleY(0.98)";

/** A white panel inside a kind card, placed by its top left and leaning like a card on a table. */
function Panel({ children, x, y, w, lean, className = "" }: { children: React.ReactNode; x: number; y: number; w: number; lean: string; className?: string }) {
  return (
    <div className={`absolute overflow-hidden bg-white text-grey-01 ${className}`} style={{ left: x, top: y, width: w, transform: lean }}>
      {children}
    </div>
  );
}

const kinds: { Icon: RemixiconComponentType; name: string; note: string; bg: string; at: [number, number, number]; shadow: boolean; panel: React.ReactNode }[] = [
  {
    Icon: RiShoppingBag3Fill,
    name: "Toko online",
    note: "Katalog, keranjang, bayar",
    bg: "linear-gradient(150deg, #484848 9%, #1c1c1c 91%)",
    at: [279, 142, -6.14],
    shadow: false,
    panel: (
      <Panel
        x={48}
        y={143}
        w={197}
        lean={leanLeft}
        className="rounded-xl p-2.5 shadow-[-84px_76px_32px_rgba(0,0,0,0.01),-54px_49px_29px_rgba(0,0,0,0.04),-30px_27px_24px_rgba(0,0,0,0.15),-13px_12px_18px_rgba(0,0,0,0.25),-3px_3px_10px_rgba(0,0,0,0.29)]"
      >
        <div className="flex gap-2 border-b-[0.625px] border-grey-07 pb-1.5 text-[7px] leading-[1.5] text-grey-03">
          <span className="font-semibold text-grey-01">Produk</span>
          <span>Keranjang</span>
          <span>Bayar</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {["kaos", "cangkir", "lilin", "tanaman"].map((p) => (
            <div key={p} className="relative aspect-square overflow-hidden rounded-md">
              <Image src={`/images/stock/${p}.jpg`} alt="" fill sizes="86px" className="object-cover" />
            </div>
          ))}
        </div>
      </Panel>
    ),
  },
  {
    Icon: RiBarChartBoxFill,
    name: "Dashboard",
    note: "Angka bisnis, real-time",
    bg: "linear-gradient(142deg, var(--color-holo-75) 25%, var(--color-holo-25) 92%)",
    at: [426, 120, -2.24],
    shadow: true,
    panel: (
      <Panel
        x={20}
        y={156}
        w={205}
        lean="rotate(7deg) skewX(-10deg) scaleY(0.98)"
        className="rounded-[12.5px] p-[10.4px] shadow-[40px_-17px_17px_rgba(0,0,0,0.02),22px_-9px_15px_rgba(0,0,0,0.06),9px_-4px_10px_rgba(0,0,0,0.1),2px_-1px_6px_rgba(0,0,0,0.11)]"
      >
        <p className="text-[7.3px] leading-[1.5] text-grey-03">Omzet bulan ini</p>
        <p className="mt-0.5 text-[15.6px] leading-[1.5] font-semibold tracking-[-0.02em]">
          Rp48,2jt <span className="text-[7.3px] font-medium text-[#1f9d4c]">+18%</span>
        </p>
        <div className="mt-2 flex h-[73px] items-end gap-[4px]">
          {[39, 54, 46, 70, 61, 84, 100].map((h, i) => (
            <span key={i} className="flex-1 rounded-t-[3px] bg-[linear-gradient(180deg,var(--color-holo-75),#8db8ff)]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </Panel>
    ),
  },
  {
    Icon: RiQuestionMark,
    name: "Ide kamu?",
    note: "Kami yang bikin",
    bg: "linear-gradient(150deg, #2c2c2c 42%, #000 91%)",
    at: [569, 97, 0.33],
    shadow: true,
    panel: (
      <p
        className="absolute top-[118px] left-[-72px] w-[292px] text-center text-[202px] leading-none font-bold text-white/15 [filter:drop-shadow(21px_12px_12px_rgba(0,0,0,0.26))_drop-shadow(5px_3px_6.5px_rgba(0,0,0,0.3))]"
        style={{ transform: leanRight }}
      >
        ?
      </p>
    ),
  },
  {
    Icon: RiFileList3Fill,
    name: "Sistem",
    note: "Stok, invoice, laporan",
    bg: "linear-gradient(162deg, #ff8400 13%, #000 338%)",
    at: [711, 97, 4.68],
    shadow: false,
    panel: (
      <Panel
        x={31}
        y={149}
        w={265}
        lean={leanLeft}
        className="h-[157px] rounded-[16px] p-[13.4px] shadow-[-40px_31px_20px_rgba(0,0,0,0.02),-23px_17px_17px_rgba(0,0,0,0.06),-10px_8px_13px_rgba(0,0,0,0.1),-3px_2px_7px_rgba(0,0,0,0.11)]"
      >
        <p className="text-[9.4px] leading-[1.5] text-grey-03">Stok gudang</p>
        <p className="mt-[2.7px] text-[20px] leading-[1.5] font-semibold tracking-[-0.02em]">1.284 item</p>
        <div className="mt-2 h-[5.4px] overflow-hidden rounded-full bg-grey-07">
          <div className="h-full w-[68%] rounded-full bg-[#ff8400]" />
        </div>
        <div className="mt-[10.7px] flex flex-col gap-[5.4px] text-[9.4px] leading-[1.5]">
          {[
            ["Invoice #2041", "Lunas"],
            ["Invoice #2042", "Proses"],
            ["Laporan Okt", "Siap"],
          ].map(([a, b]) => (
            <span key={a} className="flex justify-between">
              {a} <span className="font-medium text-[#d96e00]">{b}</span>
            </span>
          ))}
        </div>
      </Panel>
    ),
  },
];

/** A soft blurred pool of brand blue (the Figma's two glows). */
function Glow({ className, color }: { className: string; color: string }) {
  return <div className={`pointer-events-none absolute rounded-full ${className}`} style={{ background: `radial-gradient(closest-side, ${color}, transparent)` }} />;
}

/** Custom: kinds of custom build held like a hand of playing cards, at the Figma's positions. */
function CustomCard() {
  return (
    <article className={`${card} md:col-span-2 md:min-h-[380px] md:justify-center md:py-0!`}>
      <div aria-hidden className="relative -mx-7 -mb-7 h-[210px] md:static md:m-0 md:h-auto">
        <div className="absolute top-[-36px] left-[calc(50%-300px)] h-[400px] w-[851px] origin-top-left scale-50 md:top-0 md:right-0 md:left-auto md:origin-top-right md:scale-100">
          <Glow className="top-[-300px] left-[490px] h-[597px] w-[721px] opacity-30 blur-[40px] max-md:hidden" color="var(--color-holo-75)" />
          {kinds.map(({ Icon, name, note, bg, at: [x, y, a], shadow, panel }) => (
            <div
              key={name}
              className={`sb-card absolute h-[310px] w-[217px] overflow-hidden rounded-[12.5px] text-white ${shadow ? fanShadow : ""}`}
              style={{ left: x, top: y, background: bg, "--a": `${a}deg` } as React.CSSProperties}
            >
              <div className="relative p-4">
                <span className="grid size-11 place-items-center rounded-full bg-white/12">
                  <Icon size={20} />
                </span>
                <p className="mt-4 text-[22px] leading-[1.25] font-medium tracking-[-0.02em] whitespace-nowrap">{name}</p>
                <p className="mt-1 text-[11px] leading-[1.5] whitespace-nowrap text-white/75">{note}</p>
              </div>
              {panel}
              <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_-2.4px_2.4px_rgba(0,0,0,0.25),inset_0_2.4px_7.8px_rgba(255,255,255,0.39)]" />
              {/* the white hairline, fading out towards the bottom */}
              <span className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white [mask-image:linear-gradient(180deg,#000_20%,transparent_85%)]" />
            </div>
          ))}
          <Glow className="top-[-180px] left-[560px] h-[358px] w-[433px] opacity-20 blur-[24px]" color="var(--color-holo-50)" />
        </div>
      </div>
      <Words s={byKey.custom} className="order-first md:max-w-[207px]" />
    </article>
  );
}

/* 2 · Landing Page */

/*
 * After the owner's Figma (Brand Hub "Article" 1462:6014, 2026-10-24): a real landing page we built (arifsyauqi.com,
 * captured whole) as a 264px-wide page scrolling on its own forever down a white-to-blue card, faded in at the top so it
 * melts into the blue, fading into white at the foot under the words, which sit at the bottom left here. The scroll is two stacked copies sliding by one.
 */
function LandingCard() {
  const page = <Image src="/images/portfolio/arifsyauqi-page.jpg" alt="" width={792} height={10978} sizes="264px" className="block w-full" />;
  return (
    <article
      className={`${card} h-[400px] justify-end shadow-[inset_0_0_1px_0_rgba(255,255,255,0.3),inset_0_-2px_1px_0_rgba(0,0,0,0.12)]!`}
      style={{ background: "linear-gradient(15deg, #fff 37%, var(--color-holo-75) 92%, var(--color-holo-50) 160%)" }}
    >
      {/* the page fades in from nothing over its first 56px, so it melts into the blue; the mask box runs 60px past
          the page on the right so the page shadow is kept */}
      <div aria-hidden className="absolute top-0 left-1/2 h-[620px] w-[324px] -translate-x-[132px] pr-[60px] [mask-image:linear-gradient(180deg,transparent,#000_56px)]">
        <div className="relative h-full overflow-hidden rounded-b-[4px] bg-[#0a0a0b] shadow-[3px_0_3.5px_rgba(0,0,0,0.17),13px_0_6.5px_rgba(0,0,0,0.14),29px_0_8.5px_rgba(0,0,0,0.08),52px_0_10.5px_rgba(0,0,0,0.03)]">
          <div className="sb-scroll">
            {page}
            {page}
          </div>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[221px] bg-[linear-gradient(186deg,rgba(255,255,255,0)_33%,#fff_67%)]" />
      <div aria-hidden className="pointer-events-none absolute top-[160px] left-[40%] h-[358px] w-[377px] opacity-70">
        <Glow className="inset-0 opacity-30 blur-[40px]" color="var(--color-holo-75)" />
        <Glow className="top-[72px] left-[94px] h-[215px] w-[226px] opacity-20 blur-[24px]" color="var(--color-holo-50)" />
      </div>
      <Words s={byKey.landing} />
    </article>
  );
}

/* 3 · Company Profile */

/*
 * After the owner's Figma (Brand Hub "Article" 1462:6052, 2026-10-24): hands holding a tablet with a company site on
 * it, filling the top of a plain light card (the owner dropped the Figma blue, 2026-10-24), fading into the card over
 * the words, which sit at the bottom left like the other cards.
 */
function CompanyCard() {
  return (
    <article
      className={`${card} h-[400px] justify-end`}>
      <Image
        src="/images/services/company-tablet.png"
        alt=""
        width={1322}
        height={1098}
        sizes="459px"
        className="pointer-events-none absolute top-[-36px] left-1/2 w-[459px] max-w-none -translate-x-1/2"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[210px] bg-[linear-gradient(180deg,rgba(252,252,252,0)_0%,rgba(252,252,252,0.7)_25%,rgba(252,252,252,0.9)_38%,var(--color-grey-09)_50%)]" />
      <Words s={byKey.company} />
    </article>
  );
}

/* 4 · Redesign, maintenance & migrasi */

/*
 * After the owner's Figma (Brand Hub "Article" 1480:2044, 2026-10-24): the words centred on the left, and a monitor on
 * a desk with a site we built (arifsyauqi.com) on its screen, half of it shown as a rough wireframe, the "before":
 * the visitor drags the divider (ScreenCompare.tsx).
 */
function ExistingCard() {
  return (
    <article className={`${card} md:col-span-2 md:min-h-[380px] md:justify-center md:py-0!`}>
      <div className="relative -mx-8 -mb-8 h-[230px] md:static md:m-0 md:h-auto">
        <div className="absolute top-[-10px] left-[calc(50%-310px)] h-[400px] w-[851px] origin-top-left scale-[0.55] md:top-0 md:right-0 md:left-auto md:origin-top-right md:scale-100">
          <Image
            src="/images/services/existing-monitor.png"
            alt=""
            width={2350}
            height={1318}
            sizes="1042px"
            className="absolute top-[-102px] left-[-126px] w-[1042px] max-w-none"
          />
          <ScreenCompare />
        </div>
      </div>
      <Words s={byKey.existing} className="order-first md:max-w-[308px] [&>p]:max-w-[308px]" />
    </article>
  );
}

export function ServiceBento() {
  return (
    <div className="grid w-full gap-2 md:grid-cols-2 lg:grid-cols-3">
      <CustomCard />
      <LandingCard />
      <CompanyCard />
      <ExistingCard />
    </div>
  );
}
