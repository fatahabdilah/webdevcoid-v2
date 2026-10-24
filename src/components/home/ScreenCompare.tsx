"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/*
 * The before/after on the monitor in the Layanan "Redesign, maintenance & migrasi" card (ServiceBento.tsx): this very
 * section of webdev.co.id, as a grey wireframe left of the divider and as the real page right of it. The screen is
 * drawn flat (330 × 206) and laid onto the photo's screen with one matrix3d; the visitor drags the divider
 * left and right by its knob (the owner, 2026-10-24). A pointer on the card is mapped back onto the flat screen with the
 * inverse of that matrix, so the divider stays under the finger even though the screen is in perspective.
 */

const W = 330;
const H = 206;
/** Flat screen → card (851 × 400), the four screen corners in the photo. */
const onScreen = "matrix3d(0.734112,-0.112063,0,-0.00035874,-0.016858,0.957745,0,-1.55313e-05,0,0,1,0,400,84.5,0,1)";
/** Card → flat screen, the inverse of onScreen. */
const back = [
  [1.1406403, 0.012661039, -457.32597],
  [0.097227485, 1.0437697, -127.08953],
  [0.00041070336, 2.0753121e-5, 0.83396502],
];

/** A browser bar across the top of the screen, light for the wireframe, dark for the real page. */
function Bar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex h-[12px] shrink-0 items-center gap-1 px-1.5 ${dark ? "bg-[#1c1c1e]" : "bg-[#e2e2e2]"}`}>
      <span className={`size-1 rounded-full ${dark ? "bg-white/30" : "bg-[#bdbdbd]"}`} />
      <span className={`size-1 rounded-full ${dark ? "bg-white/30" : "bg-[#bdbdbd]"}`} />
      <span className={`ml-1 rounded-full px-1.5 text-[5px] leading-[7px] ${dark ? "bg-white/10 text-white/60" : "bg-[#cfcfcf] text-transparent"}`}>webdev.co.id</span>
    </div>
  );
}

/** The "after": this very section, Layanan on webdev.co.id (a screenshot of its top). */
function Page() {
  return (
    <div className="flex size-full flex-col bg-white">
      <Bar dark />
      <Image src="/images/services/existing-after.jpg" alt="" width={1056} height={621} sizes="330px" className="block w-full" />
    </div>
  );
}

/** The "before": the same section as a grey low-fidelity wireframe, laid out like the screenshot. */
function Wireframe() {
  const box =
    "relative overflow-hidden rounded-t-[5px] bg-[#d9d9d9] after:absolute after:inset-0 after:bg-[linear-gradient(to_top_right,transparent_calc(50%-0.5px),#bdbdbd,transparent_calc(50%+0.5px)),linear-gradient(to_bottom_right,transparent_calc(50%-0.5px),#bdbdbd,transparent_calc(50%+0.5px))]";
  return (
    <div className="flex size-full flex-col bg-[#efefef]">
      <Bar />
      <div className="flex flex-col items-center gap-[4px] pt-[15px]">
        <span className="h-[6px] w-[26px] rounded-full bg-[#d0d0d0]" />
        <span className="h-[14px] w-[147px] rounded-[2px] bg-[#bdbdbd]" />
        <span className="h-[14px] w-[118px] rounded-[2px] bg-[#bdbdbd]" />
        <span className="mt-[5px] h-[4px] w-[107px] rounded-full bg-[#d0d0d0]" />
        <span className="h-[4px] w-[60px] rounded-full bg-[#d0d0d0]" />
      </div>
      <div className="mt-auto grid h-[100px] grid-cols-[195fr_96fr] gap-[2px] px-[18px]">
        <span className={box} />
        <span className={box} />
      </div>
    </div>
  );
}

/** Wireframe on the left of the divider, the real page on the right; the divider moves by dragging its knob. */
export function ScreenCompare() {
  const [split, setSplit] = useState(0.5);
  const [dragging, setDragging] = useState(false);
  const layer = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    const stage = layer.current?.parentElement;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const k = r.width / 851;
    const X = (e.clientX - r.left) / k;
    const Y = (e.clientY - r.top) / k;
    const w = back[2][0] * X + back[2][1] * Y + back[2][2];
    const x = (back[0][0] * X + back[0][1] * Y + back[0][2]) / w;
    setSplit(Math.min(0.97, Math.max(0.03, x / W)));
  };

  return (
    <div
      aria-hidden
      ref={layer}
      className="pointer-events-none absolute top-0 left-0 overflow-hidden"
      style={{ width: W, height: H, transform: onScreen, transformOrigin: "0 0" }}
    >
      <Page />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${(1 - split) * 100}% 0 0)` }}>
        <Wireframe />
      </div>
      <div className="absolute inset-0" style={{ transform: `translateX(${split * 100}%)` }}>
        <span className="absolute inset-y-0 left-0 w-[1.5px] -translate-x-1/2 bg-white shadow-[0_0_6px_rgba(0,0,0,0.5)]" />
        {/* the knob: the only thing that takes the pointer; a 32px target around a 20px dot that swells on hover */}
        <span
          className="group pointer-events-auto absolute top-1/2 left-0 grid size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none place-items-center"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          <span
            className={`grid size-5 place-items-center rounded-full bg-white text-[8px] font-bold text-grey-01 shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.3] group-hover:shadow-[0_0_0_3px_rgba(255,255,255,0.35),0_4px_10px_rgba(0,0,0,0.45)] ${
              dragging ? "scale-[1.15] shadow-[0_0_0_3px_rgba(255,255,255,0.35),0_4px_10px_rgba(0,0,0,0.45)]" : ""
            }`}
          >
            ‹›
          </span>
        </span>
      </div>
    </div>
  );
}
