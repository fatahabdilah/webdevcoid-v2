"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  RiArrowRightLine,
  RiBuilding2Line,
  RiCheckLine,
  RiCodeSSlashLine,
  RiLayoutTopLine,
  RiSearchLine,
  RiSmartphoneLine,
  RiSpeedUpLine,
  RiWhatsappFill,
  type RemixiconComponentType,
} from "@remixicon/react";
import { useMedia } from "@/lib/useMedia";
import "./values-visuals.css";

/*
 * The "Kenapa kami" visuals, after the owner's reference (contentrewards.com, "Introducing the new solution";
 * Figma Brand Hub 1174:261): small product UI that tells a story in steps, a demo cursor doing the clicking.
 *   01 a three-step brief (website type, pages, brand colour), the cursor picking and pressing "Lanjut";
 *   02 a row of finished page designs drifting by;
 *   03 three panels in turn (site health, this month's visitors, chats coming in).
 * In webdev.co.id's own content, type and brand blues. Scenes advance only while the card is on screen; with reduced
 * motion they hold the first one. Decorative: the card's words say it.
 */

const STEP_MS = 4500;

/** Which step to show: advances every STEP_MS while the element is on screen (and motion is allowed). */
function useSteps(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!onScreen || reduced) return;
    const t = setInterval(() => setStep((s) => (s + 1) % count), STEP_MS);
    return () => clearInterval(t);
  }, [onScreen, reduced, count]);
  return { ref, step, playing: onScreen && !reduced };
}

const fade = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.25 } },
};

/** The demo cursor for one scene: from off-screen to (x1, y1), click, to (x2, y2), click. */
function Cursor({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <svg
      viewBox="0 0 24 28"
      className="vv-cursor pointer-events-none absolute top-0 left-0 z-10 h-6 w-5 drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
      style={{ "--x1": `${x1}px`, "--y1": `${y1}px`, "--x2": `${x2}px`, "--y2": `${y2}px` } as CSSProperties}
    >
      <path d="M2 2v20.5l5.6-5.2 3.6 8.2 3.7-1.6-3.6-8.1H19z" fill="#000" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** A step of the brief: its question on top, the choices, and Batal / Lanjut. */
function Step({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col">
      <p className="text-[12px] font-medium text-grey-01">{title}</p>
      <p className="mb-3 text-[10px] text-grey-04">{hint}</p>
      {children}
      <div className="mt-3 flex justify-end gap-1.5">
        <span className="rounded-full bg-grey-07/60 px-3 py-1 text-[10px] text-grey-04">Batal</span>
        <span className="vv-press rounded-full bg-holo-50 px-3 py-1 text-[10px] font-medium text-white">Lanjut</span>
      </div>
    </div>
  );
}

const types: { Icon: RemixiconComponentType; name: string; note: string }[] = [
  { Icon: RiLayoutTopLine, name: "Landing Page", note: "1 halaman promo" },
  { Icon: RiBuilding2Line, name: "Company Profile", note: "Sampai 6 halaman" },
  { Icon: RiCodeSSlashLine, name: "Custom", note: "Sesuai kebutuhan" },
];
const pageNames = ["Beranda", "Layanan", "Tentang kami", "Portfolio", "Kontak", "Blog"];
const swatches = ["var(--color-holo-50)", "var(--color-holo-25)", "#000", "var(--color-holo-75)"];

/** 01 · Desain custom: a three-step brief, website type, pages, brand colour; the cursor does the choosing. */
export function BriefVisual() {
  const { ref, step } = useSteps(3);
  return (
    <div ref={ref} className="relative h-[230px] w-[320px] shrink-0">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} {...fade} className="absolute inset-x-0 top-0">
          {step === 0 && (
            <Step title="Jenis website" hint="Pilih yang sesuai tujuan bisnismu.">
              <div className="grid grid-cols-3 gap-2">
                {types.map(({ Icon, name, note }, i) => (
                  <div key={name} className="relative flex h-[118px] flex-col rounded-xl border border-white bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-holo-75)_8%,#fff),#fff)] p-2.5 shadow-[0_8px_24px_-16px_rgba(1,31,108,0.35)]">
                    {i === 2 && <span className="vv-on absolute inset-0 rounded-xl ring-2 ring-holo-50" />}
                    <span className="absolute top-2.5 right-2.5 grid size-3.5 place-items-center rounded-full border border-grey-06/40 bg-white">
                      {i === 2 && <span className="vv-on size-2 rounded-full bg-holo-50" />}
                    </span>
                    <span className="grid size-7 place-items-center rounded-full bg-white text-holo-50 shadow-[0_2px_6px_rgba(1,31,108,0.12)]">
                      <Icon size={14} />
                    </span>
                    <p className="mt-auto text-[11px] leading-tight font-medium text-grey-01">{name}</p>
                    <p className="mt-0.5 text-[9px] leading-tight text-grey-04">{note}</p>
                  </div>
                ))}
              </div>
            </Step>
          )}
          {step === 1 && (
            <Step title="Halaman" hint="Pilih halaman yang kamu butuhkan.">
              <div className="flex h-[118px] flex-wrap content-start gap-1.5 rounded-xl bg-white/70 p-2.5">
                {pageNames.map((p) => {
                  const on = p === "Beranda" || p === "Layanan";
                  const picked = p === "Portfolio";
                  return (
                    <span key={p} className="relative rounded-full border border-grey-07 bg-white px-2.5 py-1 text-[10px] text-grey-03">
                      {on && <span className="absolute inset-0 rounded-full bg-holo-50" />}
                      {picked && <span className="vv-on absolute inset-0 rounded-full bg-holo-50" />}
                      <span className={`relative ${on ? "text-white" : ""}`}>{p}</span>
                      {picked && <span className="vv-on absolute inset-0 grid place-items-center text-white">{p}</span>}
                    </span>
                  );
                })}
              </div>
            </Step>
          )}
          {step === 2 && (
            <Step title="Warna brand" hint="Desain mengikuti identitas bisnismu.">
              <div className="flex h-[118px] items-center gap-3 rounded-xl bg-white/70 p-3">
                <div className="flex flex-col gap-2">
                  {swatches.map((c, i) => (
                    <span key={c} className="relative size-5 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" style={{ background: c }}>
                      {i === 0 && <span className="vv-on absolute -inset-1 rounded-full ring-2 ring-holo-50" />}
                    </span>
                  ))}
                </div>
                {/* the page, taking the colour */}
                <div className="relative h-full flex-1 overflow-hidden rounded-lg border border-grey-07 bg-white">
                  <div className="h-[46%] bg-grey-07" />
                  <div className="vv-on absolute inset-x-0 top-0 h-[46%] bg-[linear-gradient(135deg,var(--color-holo-25),var(--color-holo-50))]" />
                  <div className="space-y-1 p-2">
                    <div className="h-1.5 w-[70%] rounded-full bg-grey-07" />
                    <div className="h-1.5 w-[50%] rounded-full bg-grey-07" />
                    <div className="relative mt-1 h-3 w-10 rounded-full bg-grey-07">
                      <span className="vv-on absolute inset-0 rounded-full bg-holo-50" />
                    </div>
                  </div>
                </div>
              </div>
            </Step>
          )}
          <Cursor {...[{ x1: 262, y1: 92, x2: 292, y2: 178 }, { x1: 252, y1: 52, x2: 292, y2: 178 }, { x1: 22, y1: 60, x2: 292, y2: 178 }][step]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const designs = [
  { photo: "klinik", name: "Klinik Senyum", line: "Senyum sehat untuk keluarga" },
  { photo: "lilin", name: "Senja Candle", line: "Lilin aromaterapi buatan tangan" },
  { photo: "kaos", name: "Katun Lokal", line: "Kaos premium, nyaman dipakai" },
  { photo: "tanaman", name: "Rimbun", line: "Tanaman hias untuk rumahmu" },
  { photo: "cangkir", name: "Kopi Pagi", line: "Cangkir keramik buatan lokal" },
];

/** One finished page design: a photo hero, the name, a line, a button. */
function PageDesign({ photo, name, line }: (typeof designs)[number]) {
  return (
    <div className="flex h-[262px] w-[135px] shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-[0_10px_28px_-18px_rgba(1,31,108,0.45)]">
      <div className="relative h-[160px]">
        <Image src={`/images/stock/${photo}.jpg`} alt="" fill sizes="135px" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-2.5">
        <p className="flex items-center gap-1 text-[10px] font-semibold text-grey-01">
          <span className="size-2 rounded-sm bg-holo-50" /> {name}
        </p>
        <p className="mt-1 text-[9px] leading-snug text-grey-03">{line}</p>
        <span className="mt-auto w-fit rounded-full bg-holo-50 px-2 py-0.5 text-[8px] font-medium text-white">Lihat</span>
      </div>
    </div>
  );
}

/** 02 · Kualitas premium: a row of finished page designs drifting by, cut by the card's sides. */
export function WorkVisual() {
  return (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]">
      <div className="vv-marquee flex w-max gap-3">
        {[...designs, ...designs].map((p, i) => (
          <PageDesign key={i} {...p} />
        ))}
      </div>
    </div>
  );
}

const checks: { Icon: RemixiconComponentType; name: string; meta: string; value: string; done: number }[] = [
  { Icon: RiSpeedUpLine, name: "Kecepatan", meta: "Ringan dibuka di HP", value: "98", done: 0.98 },
  { Icon: RiSearchLine, name: "SEO", meta: "Siap ditemukan di Google", value: "100", done: 1 },
  { Icon: RiSmartphoneLine, name: "Tampilan di HP", meta: "Rapi di semua layar", value: "100", done: 1 },
];
const chats = [
  { name: "Budi", text: "Halo, mau tanya harga paketnya", time: "09.12" },
  { name: "Sari", text: "Bisa kirim ke Bandung?", time: "09.40" },
  { name: "Andi", text: "Saya mau pesan 2 ya", time: "10.05" },
];

/** A panel of the site's dashboard: a small header and its content. */
function Panel({ title, action, children }: { title: string; action: string; children: ReactNode }) {
  return (
    <div className="w-full rounded-2xl border border-white bg-white/70 p-3 shadow-[0_10px_30px_-20px_rgba(1,31,108,0.4)]">
      <div className="mb-2.5 flex items-center justify-between px-1 text-[11px] text-grey-04">
        <span>{title}</span>
        <span className="flex items-center gap-1">
          {action} <RiArrowRightLine size={11} />
        </span>
      </div>
      {children}
    </div>
  );
}

/** 03 · Cepat dibuka: the site's health, this month's visitors, then the chats they send, in turn. */
export function GrowthVisual() {
  const { ref, step } = useSteps(3);
  return (
    <div ref={ref} className="relative h-[250px] w-[300px] shrink-0">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} {...fade} className="absolute inset-x-0 top-0">
          {step === 0 && (
            <Panel title="Performa website" action="Laporan">
              <div className="flex flex-col gap-2">
                {checks.map(({ Icon, name, meta, value, done }, i) => (
                  <div key={name} className={`rounded-xl border border-grey-07 bg-white p-2.5 ${i === 2 ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-lg bg-[linear-gradient(180deg,var(--color-holo-75),var(--color-holo-50))] text-white">
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="text-[12px] font-medium text-grey-01">{name}</p>
                        <p className="text-[10px] text-grey-04">{meta}</p>
                      </div>
                      <span className="text-[11px] font-medium text-holo-50">{value}</span>
                    </div>
                    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-grey-08">
                      <span className="vv-fill block h-full rounded-full bg-holo-50" style={{ width: `${done * 100}%`, animationDelay: `${i * 150}ms` }} />
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
          {step === 1 && (
            <Panel title="Pengunjung bulan ini" action="Detail">
              <div className="px-1">
                <p className="flex items-baseline gap-2">
                  <span className="text-[22px] font-semibold tracking-[-0.03em] text-grey-01">12.480</span>
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--color-holo-50)_10%,#fff)] px-1.5 py-0.5 text-[10px] font-medium text-holo-50">+24%</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    ["Google", "62%"],
                    ["Instagram", "25%"],
                    ["WhatsApp", "13%"],
                  ].map(([k, v]) => (
                    <span key={k} className="rounded-full border border-grey-07 bg-white px-2 py-0.5 text-[10px] text-grey-03">
                      {k} <span className="text-holo-50">{v}</span>
                    </span>
                  ))}
                </div>
                <svg viewBox="0 0 260 90" className="mt-3 h-[96px] w-full overflow-visible" aria-hidden>
                  <defs>
                    <linearGradient id="vv-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#236EF3" stopOpacity="0.22" />
                      <stop offset="1" stopColor="#236EF3" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 78 C40 74 60 60 92 62 S150 50 176 36 S226 20 260 8 L260 90 L0 90Z" fill="url(#vv-area)" />
                  <path d="M0 78 C40 74 60 60 92 62 S150 50 176 36 S226 20 260 8" pathLength={1} fill="none" stroke="#0346D6" strokeWidth="2" strokeLinecap="round" className="vv-draw" />
                </svg>
              </div>
            </Panel>
          )}
          {step === 2 && (
            <Panel title="Chat masuk" action="Buka">
              <div className="flex flex-col gap-2">
                {chats.map((c, i) => (
                  <div key={c.name} className={`flex items-center gap-2.5 rounded-xl border border-grey-07 bg-white p-2.5 ${i === 2 ? "opacity-50" : ""}`}>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-holo-50 text-white">
                      <RiWhatsappFill size={15} />
                    </span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="flex justify-between text-[12px] font-medium text-grey-01">
                        {c.name} <span className="text-[10px] font-normal text-grey-04">{c.time}</span>
                      </p>
                      <p className="truncate text-[10px] text-grey-04">{c.text}</p>
                    </div>
                    {i === 0 && (
                      <span className="vv-on grid size-4 place-items-center rounded-full bg-holo-50 text-white">
                        <RiCheckLine size={10} />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          )}
          {step !== 1 && <Cursor {...(step === 0 ? { x1: 220, y1: 66, x2: 250, y2: 14 } : { x1: 240, y1: 52, x2: 250, y2: 14 })} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
