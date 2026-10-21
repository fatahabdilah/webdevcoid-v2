import type { CSSProperties } from "react";
import { stages } from "@/content/home";
import { noOrphan } from "@/lib/text";
import { Check, ProcessChatLine, ProcessEye, ProcessEyeLine, ProcessPen, ProcessPenLine, ProcessRocket, ProcessRocketLine, ProcessStructure, WhatsApp } from "../icons";
import { Reveal } from "../motion";
import { SectionHeader } from "../SectionHeader";

/**
 * "Cara kerja" (Figma 1175:3827, adapted to webdev): one card shows the four stages as a flow (a small
 * glass illustration per stage, joined by dashed lines, numbered I–IV), and a grid underneath spells
 * each stage out. White section; the card fades from white into the brand blues.
 */

/** The stage details' icons: line, as icons beside text (the illustrations above keep the filled ones). */
const icons = { chat: ProcessChatLine, pen: ProcessPenLine, eye: ProcessEyeLine, rocket: ProcessRocketLine };

/** Frosted card floating on the gradient: translucent white, a hairline white edge, soft light from below. */
const glass =
  "border-[0.5px] border-white bg-white/50 shadow-[0_0.8px_1.6px_rgba(0,0,0,0.08),inset_0_-20px_66px_rgba(255,255,255,0.7)] backdrop-blur-md";

/** Phones and tablets: the whole card is blue (white labels sit under every stage there). */
const cardBgStacked =
  "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-holo-75)_50%,white)_0%,var(--color-holo-75)_12%,var(--color-holo-50)_55%,var(--color-holo-25)_100%)]";
/** Desktop: white at the top, melting into the brand blues behind the labels (a wide blurred band, as in the design). */
const cardGlow =
  "linear-gradient(180deg, var(--color-holo-100) 0%, color-mix(in srgb, var(--color-holo-75) 22%, white) 14%, color-mix(in srgb, var(--color-holo-75) 55%, white) 27%, var(--color-holo-75) 40%, var(--color-holo-50) 56%, var(--color-holo-25) 82%)";

/** I · consultation: the chat and the brief, ticked off. */
function StageConsult() {
  const rows = [
    { Icon: WhatsApp, title: "WhatsApp", sub: "Terhubung" },
    { Icon: ProcessStructure, title: "Struktur halaman", sub: "Disusun" },
    { Icon: Check, title: "Jenis website", sub: "Dipilih" },
  ];
  return (
    <div className={`relative h-[227px] w-[216px] overflow-hidden rounded-[14px] ${glass}`}>
      <div className="flex flex-col gap-[23px] px-[27px] pt-[31px]">
        {rows.map(({ Icon, title, sub }) => (
          <div key={title} className="flex h-[39px] items-center gap-[7px]">
            <span className="flex size-8 shrink-0 items-center justify-center text-grey-01">
              <Icon className="size-6" />
            </span>
            <span className="flex flex-col px-[2.6px] whitespace-nowrap">
              <span className="text-[15.8px] leading-[23.7px] font-medium tracking-[-0.01em] text-grey-01/80">{title}</span>
              <span className="text-[14px] leading-[21px] font-medium tracking-[-0.01em] text-grey-01/60">{sub}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** II · design: rings of light round a frosted chip with the pen. */
function StageDesign() {
  return (
    <div className="relative flex size-[198px] items-center justify-center rounded-full border border-white/40 bg-white/20">
      <span className="size-[138px] rounded-full border border-white/80 bg-white/20" />
      {/* the faint middle ring, halfway between the inner (138) and outer (198) ones */}
      <span className="absolute size-[168px] rounded-full border border-white/70 opacity-35" />
      <span className={`absolute flex size-[68px] items-center justify-center rounded-full text-grey-01 ${glass}`}>
        <ProcessPen className="h-7 w-auto" />
      </span>
    </div>
  );
}

/** III · preview: three notes stacked at slight angles. */
function StagePreview() {
  const notes = [
    { Icon: ProcessEye, text: "Preview beranda", w: 170, x: 4, y: 0, r: -6.9 },
    { Icon: ProcessPen, text: "Revisi warna", w: 152, x: 0, y: 76, r: 5.3 },
    { Icon: Check, text: "Disetujui", w: 150, x: 22, y: 150, r: -4 },
  ];
  return (
    <div className="relative h-[227px] w-[192px]">
      {notes.map(({ Icon, text, w, x, y, r }) => (
        <div
          key={text}
          className={`absolute flex h-[73px] items-center gap-[7px] rounded-[13.5px] px-6 ${glass}`}
          style={{ width: w, left: x, top: y, transform: `rotate(${r}deg)` }}
        >
          <span className="flex size-8 shrink-0 items-center justify-center text-grey-01">
            <Icon className="size-[22px]" />
          </span>
          <span className="w-[80px] text-[15.2px] leading-[17px] font-medium tracking-[-0.01em] text-grey-01/80">{text}</span>
        </div>
      ))}
    </div>
  );
}

/** IV · launch: the site is online. */
function StageLive() {
  return (
    <div className={`relative flex h-[111px] w-[256px] items-center gap-[15px] overflow-hidden rounded-[15px] bg-white/30 pl-5 ${glass}`}>
      <span className="flex size-[59px] shrink-0 items-center justify-center rounded-full bg-grey-01/10 text-grey-01">
        <ProcessRocket className="h-[30px] w-auto" />
      </span>
      <span className="flex flex-col">
        <span className="text-[26px] leading-[31px] font-semibold tracking-[-0.02em] text-grey-01/80">Online</span>
        <span className="text-[14.8px] leading-[22px] font-medium tracking-[-0.01em] text-grey-01/80">namabisnismu.com</span>
      </span>
    </div>
  );
}

const illustrations = [StageConsult, StageDesign, StagePreview, StageLive];

/** On desktop some lines reach into an illustration's box so they meet what's drawn there, not its empty edge
 *  (keyed by connector): either side of the design circle, through its faint outer ring to the solid inner one
 *  ((198 − 138) / 2 = 30px); and from the preview notes, whose middle card ("Revisi warna", 152px) ends 40px short
 *  of the 192px box. */
const circleReach: Record<number, string> = { 1: "lg:-mr-[30px]", 2: "lg:-ml-[30px]", 3: "lg:-ml-[40px]" };

/** Desktop grid placement: column `--c`, row 1 (illustrations) or 2 (labels). */
const at = (c: number) => ({ "--c": c }) as CSSProperties;
const row1 = "lg:[grid-column:var(--c)] lg:[grid-row:1]";
const row2 = "lg:[grid-column:var(--c)] lg:[grid-row:2]";

/** Between two stages: a dashed line that keeps flowing to the next one (down on phones, across on desktop, edge to
 *  edge of its column; none in the tablet 2 × 2) and, on desktop, a divider between the labels. */
function Connector({ col, reach = "" }: { col: number; reach?: string }) {
  return (
    <div className="contents">
      <div className={`flex h-10 items-center justify-center md:hidden lg:flex lg:h-auto ${reach} ${row1}`} style={at(col)}>
        <span className="flow-dash h-full w-0.5 lg:h-0.5 lg:w-full" />
      </div>
      <div className={`hidden items-center justify-center lg:flex ${row2}`} style={at(col)}>
        <span className="h-[38px] w-px rounded-full bg-white/30" />
      </div>
    </div>
  );
}

export function Process() {
  return (
    <section id="process" className="flex justify-center bg-white px-5 py-16 md:px-10 md:py-20 lg:px-20 lg:py-[100px]">
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-12 md:gap-16 lg:gap-20">
        <SectionHeader
          number="004"
          name="cara kerja"
          title="Kamu arahkan, kami yang bangun."
          // Breaks after the comma: wider than "kami yang bangun." (7.92em), narrower than "Kamu arahkan, kami" (8.49em)
          titleWidth="max-w-[8.2em]"
          body="Cukup ceritakan bisnismu lewat WhatsApp. Struktur, desain, dan kontennya kami yang susun."
        />

        <div className="flex w-full flex-col items-center gap-10 md:gap-16 lg:gap-[89px]">
          {/* The flow */}
          <Reveal y={50} amount={0.2} className="w-full">
            <div className={`relative isolate w-full overflow-hidden rounded-3xl px-5 py-12 md:py-16 lg:bg-white lg:bg-none lg:px-8 lg:pt-16 lg:pb-10 ${cardBgStacked}`}>
              <div aria-hidden className="pointer-events-none absolute -inset-x-[40%] top-[60px] -z-10 hidden h-[640px] blur-[100px] lg:block" style={{ backgroundImage: cardGlow }} />
              <div className="flex flex-col items-center md:grid md:grid-cols-2 md:items-start md:gap-x-6 md:gap-y-14 lg:grid-cols-[auto_minmax(24px,1fr)_auto_minmax(24px,1fr)_auto_minmax(24px,1fr)_auto] lg:grid-rows-[228px_auto] lg:items-center lg:gap-0">
                {stages.map((stage, i) => {
                  const Illustration = illustrations[i];
                  return (
                    <div key={stage.numeral} className="flex flex-col items-center lg:contents">
                      {i > 0 && <Connector col={i * 2} reach={circleReach[i] ?? ""} />}
                      <Reveal y={24} delay={0.1 * i} amount={0.4} className={`flex justify-center ${row1}`} style={at(i * 2 + 1)}>
                        <Illustration />
                      </Reveal>
                      {/* Numeral and name under the illustration (the labels row on desktop) */}
                      <div className={`flex flex-col items-center gap-2 pt-6 pb-2 text-center text-white lg:gap-4 lg:pt-[50px] lg:pb-[13px] ${row2}`} style={at(i * 2 + 1)}>
                        <span className="t-body-l text-white">{stage.numeral}</span>
                        <span className="text-[22px] leading-[27px] font-medium tracking-[-0.025em] whitespace-nowrap">{stage.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Each stage spelled out */}
          <Reveal y={30} amount={0.3} className="w-full max-w-[1040px]">
            <div className="grid w-full grid-cols-1 md:grid-cols-2">
              {stages.map((stage, i) => {
                const Icon = icons[stage.icon];
                const right = i % 2 === 1, top = i < 2;
                return (
                  <div
                    key={stage.numeral}
                    className={`flex border-grey-07 py-6 md:py-[30px] ${i < stages.length - 1 ? "max-md:border-b" : ""} ${top ? "md:border-b" : "md:items-end"} ${
                      right ? "md:justify-end md:pl-8" : "md:border-r md:pr-8"
                    }`}
                  >
                    <div className="flex w-full max-w-[434px] items-start gap-2.5">
                      <span className="flex w-6 shrink-0 justify-center py-[3px] text-grey-01 opacity-90">
                        <Icon className="size-5" />
                      </span>
                      <p className="t-body-l font-medium text-grey-03">
                        <span className="font-semibold text-grey-01">{stage.lead}</span> {noOrphan(stage.text)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
