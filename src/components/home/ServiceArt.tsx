"use client";

import { getImageProps } from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useSpring } from "motion/react";
import { brand, mix } from "@/lib/brand";
import { useMedia } from "@/lib/useMedia";
import { VIEW_H, VIEW_W, cursorPath } from "@/lib/cursorShape";

/*
 * Illustrations for the service bentos (ServiceBento.tsx), in webdev.co.id's style: white UI cards, brand
 * blues, Geist, real photos (free Unsplash, no brands). Each tells its service's own story as a short
 * storyboard; only the active card plays (see ServiceBento), the rest hold their finished frame, as does
 * every card with reduced motion. Canvases are sized so one canvas unit is ~0.75px on desktop in every card.
 */

const BLUE = brand.blue;
const LIGHT = brand.light;
const NAVY = brand.navy;
/** Light blue on its way to white: the brand gradient's lightest stretch, for tints. */
const tint = (t: number) => mix(LIGHT, brand.white, t);
const EDGE = tint(0.86);
const SOFT = tint(0.94);
const INK = "#1a1a1a"; // grey-01
const MUTED = "#525252"; // grey-03
const SUBTLE = "#8a8f98";

/** Optimised URL for a photo placed inside an SVG. */
const photo = (src: string, width: number) => getImageProps({ src, alt: "", width, height: width }).props.src;

/** Ids unique to this instance, so gradients and filters never collide (some bentos render twice). */
function useIds() {
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (name: string) => `${base}-${name}`;
}
type Ids = ReturnType<typeof useIds>;
const url = (id: string) => `url(#${id})`;

/** A 24-unit icon (Lucide geometry), centred on (cx, cy) at the given size. */
function Icon({ cx, cy, size, children }: { cx: number; cy: number; size: number; children: ReactNode }) {
  const s = size / 24;
  return <g transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${s})`}>{children}</g>;
}

const stroke = (color: string, width = 2) =>
  ({ fill: "none", stroke: color, strokeWidth: width, strokeLinecap: "round", strokeLinejoin: "round" }) as const;

/** Lucide glyphs (24-unit geometry, stroked by the caller). */
const glyph = {
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  bag: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  megaphone: (
    <>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </>
  ),
  chat: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  bolt: <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
};
type GlyphName = keyof typeof glyph;

/** WhatsApp glyph (Simple Icons, CC0), filled, in a 24-unit box. */
const WA =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z";

/* ------------------------------------------------------------------ Kit */

/** Gradients and shadows shared by every illustration. */
function Defs({ id }: { id: Ids }) {
  return (
    <defs>
      <linearGradient id={id("panel")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={tint(0.92)} />
        <stop offset="1" stopColor={tint(0.58)} />
      </linearGradient>
      <radialGradient id={id("sheen")} cx=".15" cy=".05" r=".8">
        <stop offset="0" stopColor="#fff" stopOpacity=".85" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id("blue")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={LIGHT} />
        <stop offset="1" stopColor={BLUE} />
      </linearGradient>
      <linearGradient id={id("deep")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={tint(0.5)} />
        <stop offset="1" stopColor={LIGHT} />
      </linearGradient>
      <linearGradient id={id("fade")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity=".6" />
        <stop offset=".7" stopColor="#000" stopOpacity="0" />
      </linearGradient>
      {/* Device frames: a titanium phone edge, an aluminium laptop base, the shadow they cast */}
      <linearGradient id={id("titan")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#6b6b70" />
        <stop offset=".45" stopColor="#2c2c2f" />
        <stop offset="1" stopColor="#56565b" />
      </linearGradient>
      <linearGradient id={id("alu")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f1f2f4" />
        <stop offset=".55" stopColor="#c9ccd1" />
        <stop offset="1" stopColor="#9da1a8" />
      </linearGradient>
      <radialGradient id={id("floor")}>
        <stop offset="0" stopColor={NAVY} stopOpacity=".22" />
        <stop offset="1" stopColor={NAVY} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id("area")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={LIGHT} stopOpacity=".35" />
        <stop offset="1" stopColor={LIGHT} stopOpacity="0" />
      </linearGradient>
      <filter id={id("card")} x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor={NAVY} floodOpacity=".14" />
      </filter>
      <filter id={id("lift")} x="-50%" y="-50%" width="200%" height="220%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor={BLUE} floodOpacity=".3" />
      </filter>
    </defs>
  );
}

/** White card with a soft shadow and a hairline edge. */
function Card({ id, x, y, w, h, r = 20 }: { id: Ids; x: number; y: number; w: number; h: number; r?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill="#fff" filter={url(id("card"))} />
      <rect x={x + 0.75} y={y + 0.75} width={w - 1.5} height={h - 1.5} rx={r - 0.75} fill="none" stroke={EDGE} strokeWidth="1.5" />
    </g>
  );
}

/** White pill chip with a brand-blue icon disc, optionally tilted (Hostinger's floating tags). */
function Chip({ id, x, y, label, icon, fs = 17, rotate = 0 }: { id: Ids; x: number; y: number; label: string; icon: GlyphName; fs?: number; rotate?: number }) {
  const h = fs * 2.3;
  const w = label.length * fs * 0.55 + h + fs * 0.9;
  return (
    <g transform={rotate ? `rotate(${rotate} ${x + w / 2} ${y + h / 2})` : undefined}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#fff" filter={url(id("card"))} />
      <rect x={x + 0.75} y={y + 0.75} width={w - 1.5} height={h - 1.5} rx={h / 2 - 0.75} fill="none" stroke={EDGE} strokeWidth="1.5" />
      <circle cx={x + h / 2} cy={y + h / 2} r={h * 0.33} fill={url(id("blue"))} />
      <Icon cx={x + h / 2} cy={y + h / 2} size={h * 0.34}>
        <g {...stroke("#fff", 2.8)}>{glyph[icon]}</g>
      </Icon>
      <text x={x + h * 0.95} y={y + h / 2 + fs * 0.36} fontSize={fs} fontWeight={500} fill={INK}>
        {label}
      </text>
    </g>
  );
}

/** Brand gradient pill button, with an optional WhatsApp glyph. */
function PillButton({ id, x, y, w, h, label, fs, whatsapp }: { id: Ids; x: number; y: number; w: number; h: number; label: string; fs: number; whatsapp?: boolean }) {
  const textX = whatsapp ? x + w / 2 + fs * 0.7 : x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={url(id("blue"))} filter={url(id("lift"))} />
      {whatsapp && <path d={WA} fill="#fff" transform={`translate(${textX - label.length * fs * 0.28 - fs * 1.55} ${y + h / 2 - fs * 0.55}) scale(${(fs * 1.1) / 24})`} />}
      <text x={textX} y={y + h / 2 + fs * 0.36} fontSize={fs} fontWeight={600} fill="#fff" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

/** A rounded "text line" placeholder. */
function Bar({ x, y, w, h = 8, fill = tint(0.72) }: { x: number; y: number; w: number; h?: number; fill?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />;
}

/* ------------------------------------------------------------------ Storyboard */

/** What every service illustration takes: whether it is the card playing, and a callback when a loop ends. */
export type StoryProps = { active: boolean; onLoop?: () => void };

/**
 * Steps through a looping storyboard (one duration per step, in ms) while the card is active and on screen,
 * calling `onLoop` each time it comes round. Otherwise it holds `rest`, a finished frame (always, with
 * reduced motion). Returns the stage ref, the step to draw and whether it is playing.
 */
function useStory(durations: number[], rest: number, { active, onLoop }: StoryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(rest);
  const [onScreen, setOnScreen] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const loop = useRef(onLoop);
  useEffect(() => {
    loop.current = onLoop;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const playing = active && onScreen && !reduced;
  useEffect(() => {
    if (!playing) return;
    let s = -1;
    let played = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      s = (s + 1) % durations.length;
      // Back at the start after a full run: report the loop
      if (s === 0 && played) loop.current?.();
      played = true;
      setStep(s);
      timer = setTimeout(tick, durations[s]);
    };
    timer = setTimeout(tick, 0);
    return () => clearTimeout(timer);
  }, [playing, durations]);
  return [ref, playing ? step : rest, playing] as const;
}

type CursorState = {
  /** Centre of the cursor, in canvas units (the site cursor is centred on the pointer). */
  x: number;
  y: number;
  /** Set on a click step (a fresh value per click) to press and ripple. */
  tap?: number;
  /** Width in canvas units. */
  size?: number;
};

const ARROW = cursorPath(0);

/**
 * The demo cursor is the site cursor's arrow (lib/cursorShape): rounded, black with a white rim, turning
 * to face its direction of travel the short way round and pressing to 70% on a click. It stays an arrow
 * (the site cursor's hover circle reads as a stray dot in a picture). It lives in an HTML layer over the
 * SVG, so its glide is a compositor transform; positions map via cqw.
 */
function DemoCursor({ w, x, y, tap, size = 30 }: CursorState & { w: number }) {
  const u = (n: number) => `${(n / w) * 100}cqw`;
  const rotate = useSpring(-20, { stiffness: 300, damping: 60 });
  const last = useRef<[number, number] | null>(null);
  useEffect(() => {
    const prev = last.current;
    last.current = [x, y];
    if (!prev || Math.hypot(x - prev[0], y - prev[1]) < 4) return;
    const target = (Math.atan2(y - prev[1], x - prev[0]) * 180) / Math.PI + 90;
    const now = rotate.get();
    rotate.set(now + ((((target - now) % 360) + 540) % 360) - 180);
  }, [x, y, rotate]);
  const h = (size * VIEW_H) / VIEW_W;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0"
      style={{ transform: `translate(${u(x)}, ${u(y)})`, transition: "transform 0.85s cubic-bezier(0.65, 0, 0.35, 1)" }}
    >
      {tap !== undefined && <span key={`r${tap}`} className="art-ripple absolute top-0 left-0 block rounded-full bg-holo-75/40" style={{ width: u(size * 1.7), height: u(size * 1.7) }} />}
      <div key={`c${tap ?? "-"}`} className={tap !== undefined ? "art-press" : undefined} style={{ width: u(size), height: u(h), marginLeft: u(-size / 2), marginTop: u(-h / 2) }}>
        <motion.svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} overflow="visible" className="block size-full" style={{ rotate, filter: "drop-shadow(0 2px 2.5px rgb(0 0 0 / 0.12))" }}>
          <path d={ARROW} fill="black" stroke="white" strokeWidth={4.5} strokeLinejoin="round" paintOrder="stroke" />
        </motion.svg>
      </div>
    </div>
  );
}

type ArtProps = { width: number; height: number; stage: RefObject<HTMLDivElement | null>; cursor?: CursorState; children: ReactNode };

function Art({ width, height, stage, cursor, children }: ArtProps) {
  return (
    <div ref={stage} className="relative w-full shrink-0 [container-type:inline-size]">
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden className="block h-auto w-full" fontWeight={400}>
        {children}
      </svg>
      {cursor && <DemoCursor w={width} {...cursor} />}
    </div>
  );
}

/** Fades and springs its children in when `on` (chips, toasts, new rows). */
function Pop({ on, children, from = 10 }: { on: boolean; children: ReactNode; from?: number }) {
  return (
    <g
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : `translateY(${from}px) scale(0.96)`,
        transformBox: "fill-box",
        transformOrigin: "center",
        transition: "opacity 0.4s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {children}
    </g>
  );
}

/** A photo clipped to a rounded rectangle. */
function Photo({ id, name, src, x, y, w, h, r, width, position = "xMidYMid slice" }: { id: Ids; name: string; src: string; x: number; y: number; w: number; h: number; r: number; width: number; position?: string }) {
  return (
    <>
      <clipPath id={id(name)}>
        <rect x={x} y={y} width={w} height={h} rx={r} />
      </clipPath>
      <image href={photo(src, width)} x={x} y={y} width={w} height={h} preserveAspectRatio={position} clipPath={url(id(name))} />
    </>
  );
}

/** A press on a button without the cursor: a quick squeeze and a ring (re-played each time `on` turns true). */
function Tap({ on, cx, cy, children }: { on: boolean; cx: number; cy: number; children: ReactNode }) {
  return (
    <g>
      <g key={on ? "on" : "off"} className={on ? "art-tap" : undefined} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        {children}
      </g>
      {on && <circle key="ring" className="art-ring" cx={cx} cy={cy} r="34" fill={LIGHT} fillOpacity=".35" style={{ transformBox: "fill-box", transformOrigin: "center" }} />}
    </g>
  );
}

/* ------------------------------------------------------------------ Devices */

/**
 * A phone in the style of a current iPhone (no logo): titanium edge, black bezel, rounded screen with the
 * pill-shaped camera cut-out and a status bar. Children draw in screen coordinates (0, 0 = screen top left).
 */
function Phone({ id, name, x, y, w, h, children }: { id: Ids; name: string; x: number; y: number; w: number; h: number; children: ReactNode }) {
  const r = w * 0.17;
  const b = w * 0.036;
  const [sx, sy, sw, sh, sr] = [x + b, y + b, w - 2 * b, h - 2 * b, r - b];
  const island = sw * 0.32;
  return (
    <g>
      {/* Side buttons */}
      {[
        [x - 2.2, 0.17, 0.05],
        [x - 2.2, 0.25, 0.1],
        [x - 2.2, 0.37, 0.1],
        [x + w - 0.8, 0.29, 0.15],
      ].map(([bx, at, len]) => (
        <rect key={at} x={bx} y={y + h * at} width="3" height={h * len} rx="1.5" fill="#3a3a3d" />
      ))}
      <rect x={x} y={y} width={w} height={h} rx={r} fill={url(id("titan"))} filter={url(id("card"))} />
      <rect x={x + 1.4} y={y + 1.4} width={w - 2.8} height={h - 2.8} rx={r - 1.4} fill="#0a0a0b" />
      <clipPath id={id(name)}>
        <rect x={sx} y={sy} width={sw} height={sh} rx={sr} />
      </clipPath>
      <g clipPath={url(id(name))}>
        <rect x={sx} y={sy} width={sw} height={sh} fill="#fff" />
        <g transform={`translate(${sx} ${sy})`}>
          {children}
          {/* Status bar */}
          <text x={sw * 0.15} y={sw * 0.105} fontSize={sw * 0.058} fontWeight={600} fill={INK}>
            9:41
          </text>
          <rect x={(sw - island) / 2} y={sw * 0.04} width={island} height={sw * 0.092} rx={sw * 0.046} fill="#000" />
          <g fill={INK}>
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={sw * 0.7 + k * sw * 0.024} y={sw * (0.095 - 0.012 * (k + 1))} width={sw * 0.016} height={sw * 0.012 * (k + 1)} rx="0.6" />
            ))}
            <rect x={sw * 0.82} y={sw * 0.06} width={sw * 0.085} height={sw * 0.042} rx={sw * 0.012} fill="none" stroke={INK} strokeWidth="0.9" />
            <rect x={sw * 0.826} y={sw * 0.066} width={sw * 0.062} height={sw * 0.03} rx={sw * 0.007} />
          </g>
        </g>
      </g>
    </g>
  );
}

/** Content top inside a Phone screen (below the status bar), for a screen width. */
const phoneTop = (sw: number) => sw * 0.17;

/**
 * A laptop in the style of a MacBook (no logo): black bezel with the camera notch inside a thin aluminium
 * rim, then the aluminium base with its thumb scoop, and a soft shadow on the "floor". Children draw in
 * screen coordinates.
 */
function Laptop({ id, name, x, y, w, children }: { id: Ids; name: string; x: number; y: number; w: number; children: ReactNode }) {
  const h = w * 0.64;
  const [side, top, bottom] = [w * 0.022, w * 0.03, w * 0.028];
  const [sx, sy, sw, sh] = [x + side, y + top, w - 2 * side, h - top - bottom];
  const r = w * 0.032;
  const lip = w * 0.06;
  const baseH = w * 0.024;
  return (
    <g>
      <ellipse cx={x + w / 2} cy={y + h + baseH + 4} rx={w / 2 + lip} ry={w * 0.025} fill={url(id("floor"))} />
      {/* Lid: aluminium rim, black bezel, screen */}
      <path d={`M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`} fill="#b9bdc3" />
      <path
        d={`M${x + 1.6} ${y + h}V${y + r}Q${x + 1.6} ${y + 1.6} ${x + r} ${y + 1.6}H${x + w - r}Q${x + w - 1.6} ${y + 1.6} ${x + w - 1.6} ${y + r}V${y + h}Z`}
        fill="#0d0d0f"
      />
      <clipPath id={id(name)}>
        <rect x={sx} y={sy} width={sw} height={sh} rx={w * 0.008} />
      </clipPath>
      <g clipPath={url(id(name))}>
        <rect x={sx} y={sy} width={sw} height={sh} fill="#fff" />
        <g transform={`translate(${sx} ${sy})`}>{children}</g>
      </g>
      {/* Camera notch */}
      <path d={`M${x + w / 2 - w * 0.05} ${sy}h${w * 0.1}v${w * 0.012}q0 ${w * 0.008} -${w * 0.008} ${w * 0.008}h-${w * 0.084}q-${w * 0.008} 0 -${w * 0.008} -${w * 0.008}Z`} fill="#0d0d0f" />
      <circle cx={x + w / 2} cy={sy + w * 0.009} r={w * 0.0035} fill="#1f2a3a" />
      {/* Base with its thumb scoop */}
      <path
        d={`M${x - lip} ${y + h}H${x + w + lip}V${y + h + baseH * 0.55}Q${x + w + lip} ${y + h + baseH} ${x + w + lip - baseH * 2} ${y + h + baseH}H${x - lip + baseH * 2}Q${x - lip} ${y + h + baseH} ${x - lip} ${y + h + baseH * 0.55}Z`}
        fill={url(id("alu"))}
      />
      <rect x={x + w / 2 - w * 0.075} y={y + h} width={w * 0.15} height={baseH * 0.32} rx={baseH * 0.16} fill="#9da1a8" opacity=".7" />
      <path d={`M${x - lip} ${y + h + 0.6}H${x + w + lip}`} stroke="#ffffff" strokeOpacity=".7" strokeWidth="1" />
    </g>
  );
}

/** A browser bar across the top of a laptop screen (the address sits left of the camera notch). */
function ScreenBar({ w, address }: { w: number; address: string }) {
  return (
    <g>
      <rect width={w} height="24" fill="#f5f6f8" />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={12 + k * 10} cy="12" r="3" fill={tint(0.7)} />
      ))}
      <rect x="52" y="5" width="128" height="14" rx="7" fill="#fff" />
      <text x="116" y="15" fontSize="8.5" fill={MUTED} textAnchor="middle">
        {address}
      </text>
      <path d={`M0 24H${w}`} stroke={EDGE} strokeWidth="1" />
    </g>
  );
}

/* ------------------------------------------------------------------ Company Profile (740 × 480): laptop */

/** Searched → found → opened: the search results, the cursor clicks the clinic's result, the site loads. */
const COMPANY_STEPS = [1500, 900, 600, 2800];
/** The laptop, and the top left of its screen (where the screen content's 0, 0 sits on the canvas). */
const LAPTOP = { x: 110, y: 46, w: 560 };
const SCREEN = { x: LAPTOP.x + LAPTOP.w * 0.022, y: LAPTOP.y + LAPTOP.w * 0.03, w: LAPTOP.w * 0.956 };
/** Cursor per step, in screen coordinates. */
const COMPANY_CURSOR: [number, number][] = [
  [430, 262],
  [196, 158],
  [196, 158],
  [462, 150],
];

export function CompanyProfileArt(props: StoryProps) {
  const id = useIds();
  const [stage, step] = useStory(COMPANY_STEPS, 3, props);
  const opened = step >= 3;
  const [lx, ly] = COMPANY_CURSOR[step];
  const sw = SCREEN.w;
  const results: [string, string, string, string[], boolean][] = [
    ["Klinik Senyum", "kliniksenyum.co.id", "Klinik Senyum · Dokter Gigi Keluarga di Bekasi", ["Perawatan gigi untuk anak sampai lansia. Buat", "janji online, buka setiap hari."], true],
    ["Info Sehat", "infosehat.id", "Daftar Klinik Gigi di Bekasi dan Sekitarnya", ["Kumpulan klinik gigi beserta alamat dan jam", "praktik terbaru."], false],
  ];
  return (
    <Art width={740} height={480} stage={stage} cursor={{ x: SCREEN.x + lx, y: SCREEN.y + ly, tap: step === 2 ? step : undefined }}>
      <Defs id={id} />
      <Laptop id={id} name="laptop" {...LAPTOP}>
        {/* Search results */}
        <g style={{ opacity: opened ? 0 : 1, transition: "opacity 0.4s ease" }}>
          <ScreenBar w={sw} address="klinik gigi bekasi" />
          <rect x="24" y="40" width="330" height="34" rx="17" fill="#fff" stroke={tint(0.8)} strokeWidth="1.2" />
          <Icon cx={44} cy={57} size={13}>
            <g {...stroke(MUTED, 2.4)}>{glyph.search}</g>
          </Icon>
          <text x="60" y="61" fontSize="12" fill={INK}>
            klinik gigi bekasi
          </text>
          {["Semua", "Gambar", "Peta", "Berita"].map((tab, i) => (
            <text key={tab} x={28 + i * 58} y="96" fontSize="10" fontWeight={i === 0 ? 600 : 400} fill={i === 0 ? INK : SUBTLE}>
              {tab}
            </text>
          ))}
          <rect x="24" y="101" width="34" height="2" rx="1" fill={INK} />
          <path d={`M0 104H${sw}`} stroke={EDGE} strokeWidth="1" />
          {/* The clinic's result is the one being hovered */}
          <rect x="14" y="112" width="380" height="94" rx="10" fill={SOFT} style={{ opacity: step >= 1 ? 1 : 0, transition: "opacity 0.3s" }} />
          {results.map(([site, domain, title, desc, ours], i) => {
            const y = 124 + i * 96;
            return (
              <g key={site}>
                <rect x="26" y={y} width="20" height="20" rx="6" fill={ours ? url(id("blue")) : tint(0.75)} />
                <text x="54" y={y + 9} fontSize="10.5" fontWeight={600} fill={INK}>
                  {site}
                </text>
                <text x="54" y={y + 21} fontSize="9" fill={SUBTLE}>
                  {domain}
                </text>
                <text x="26" y={y + 44} fontSize="14" fontWeight={500} fill={ours ? BLUE : NAVY} textDecoration={ours && step >= 1 ? "underline" : undefined}>
                  {title}
                </text>
                {desc.map((line, k) => (
                  <text key={line} x="26" y={y + 61 + k * 14} fontSize="10.5" fill={MUTED}>
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </g>

        {/* The clinic's site, opening */}
        <g style={{ opacity: opened ? 1 : 0, transform: opened ? "none" : "translateY(14px)", transition: "opacity 0.5s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)" }}>
          <rect width={sw} height="330" fill="#fff" />
          <ScreenBar w={sw} address="kliniksenyum.co.id" />
          <rect x="18" y="34" width="16" height="16" rx="5" fill={url(id("blue"))} />
          <text x="40" y="46.5" fontSize="12" fontWeight={600} fill={INK}>
            Klinik Senyum
          </text>
          {["Layanan", "Dokter", "Kontak"].map((label, i) => (
            <text key={label} x={300 + i * 50} y="46" fontSize="10" fill={MUTED}>
              {label}
            </text>
          ))}
          <rect x="446" y="32" width="72" height="22" rx="11" fill="none" stroke={BLUE} strokeWidth="1.2" />
          <text x="482" y="46.5" fontSize="9.5" fontWeight={600} fill={BLUE} textAnchor="middle">
            Buat janji
          </text>
          <Photo id={id} name="clinic" src="/images/stock/klinik.jpg" x={16} y={64} w={sw - 32} h={180} r={12} width={720} position="xMidYMax slice" />
          <rect x="16" y="64" width={sw - 32} height="180" rx="12" fill={url(id("fade"))} />
          <text x="36" y="128" fontSize="22" fontWeight={600} fill="#fff" letterSpacing="-0.4">
            Senyum sehat untuk
          </text>
          <text x="36" y="155" fontSize="22" fontWeight={600} fill="#fff" letterSpacing="-0.4">
            seluruh keluarga.
          </text>
          <text x="36" y="177" fontSize="10.5" fill="#fff" opacity=".85">
            Dokter gigi berpengalaman, buka setiap hari.
          </text>
          <rect x="36" y="192" width="92" height="28" rx="14" fill="#fff" />
          <text x="82" y="210" fontSize="10.5" fontWeight={600} fill={INK} textAnchor="middle">
            Buat janji
          </text>
          {[
            ["Pemeriksaan", "Rutin tiap 6 bulan"],
            ["Pembersihan", "Karang dan noda gigi"],
            ["Kawat gigi", "Konsultasi dulu"],
          ].map(([name, sub], i) => (
            <g key={name}>
              <rect x={16 + i * 170} y="256" width="160" height="54" rx="10" fill={SOFT} />
              <circle cx={38 + i * 170} cy="283" r="10" fill={tint(0.55)} />
              <Icon cx={38 + i * 170} cy={283} size={10}>
                <g {...stroke("#fff", 3)}>{glyph.check}</g>
              </Icon>
              <text x={56 + i * 170} y="279" fontSize="10.5" fontWeight={600} fill={INK}>
                {name}
              </text>
              <text x={56 + i * 170} y="293" fontSize="9" fill={MUTED}>
                {sub}
              </text>
            </g>
          ))}
        </g>
      </Laptop>

      <Pop on={step >= 2}>
        <Chip id={id} x={500} y={12} label="Ditemukan di Google" icon="search" fs={15} />
      </Pop>
    </Art>
  );
}

/* ------------------------------------------------------------------ Landing Page (560 × 310) */

/** Rest → "Pesan sekarang" is pressed and the order counter ticks up → hold. */
const LANDING_STEPS = [1600, 900, 2500];
/** Promo countdown start: 14 h 36 m 52 s. */
const PROMO_SECONDS = 14 * 3600 + 36 * 60 + 52;
const ORDER_BARS = [26, 34, 30, 42, 38, 50, 58];

export function LandingPageArt(props: StoryProps) {
  const id = useIds();
  const [stage, step, live] = useStory(LANDING_STEPS, 2, props);
  const ordered = step >= 1;
  // The promo really counts down while the card plays
  const [left, setLeft] = useState(PROMO_SECONDS);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : PROMO_SECONDS)), 1000);
    return () => clearInterval(t);
  }, [live]);
  const clock = [Math.floor(left / 3600), Math.floor((left % 3600) / 60), left % 60].map((n) => String(n).padStart(2, "0")).join(":");
  return (
    <Art width={560} height={310} stage={stage}>
      <Defs id={id} />

      {/* The promo page */}
      <Card id={id} x={28} y={20} w={300} h={330} />
      <rect x="46" y="38" width="15" height="15" rx="5" fill={url(id("blue"))} />
      <text x="67" y="50" fontSize="11.5" fontWeight={600} fill={INK}>
        Senja
      </text>
      <path d="M294 42h14M294 48h14" {...stroke(INK, 1.6)} />
      <Photo id={id} name="lilin" src="/images/stock/lilin.jpg" x={44} y={64} w={268} h={110} r={12} width={540} />
      <rect x="56" y="74" width="44" height="20" rx="10" fill="#fff" />
      <text x="78" y="88" fontSize="10.5" fontWeight={700} fill={BLUE} textAnchor="middle">
        -20%
      </text>
      <text x="44" y="198" fontSize="16" fontWeight={700} fill={INK} letterSpacing="-0.3">
        Lilin aromaterapi
      </text>
      <text x="44" y="220" fontSize="14" fontWeight={700} fill={BLUE}>
        Rp119.000
      </text>
      <text x="124" y="220" fontSize="11" fill={SUBTLE}>
        Rp149.000
      </text>
      <path d="M123 216.5h52" stroke={SUBTLE} strokeWidth="1" />
      <Icon cx={50} cy={238} size={11}>
        <g {...stroke(MUTED, 2.4)}>{glyph.clock}</g>
      </Icon>
      <text x="60" y="241.5" fontSize="10" fill={MUTED} style={{ fontVariantNumeric: "tabular-nums" }}>
        Promo berakhir {clock}
      </text>
      <Tap on={step === 1} cx={178} cy={270}>
        <PillButton id={id} x={44} y={252} w={268} h={36} label="Pesan sekarang" fs={13} />
      </Tap>

      {/* What the page brings in: the order counter ticks up */}
      <Card id={id} x={306} y={82} w={226} h={152} />
      <text x="326" y="110" fontSize="11.5" fill={MUTED}>
        Pesanan dari promo
      </text>
      <g key={ordered ? "13" : "12"} className={ordered ? "art-tap" : undefined} style={{ transformBox: "fill-box", transformOrigin: "left center" }}>
        <text x="326" y="148" fontSize="32" fontWeight={700} fill={INK} letterSpacing="-0.8" style={{ fontVariantNumeric: "tabular-nums" }}>
          {ordered ? 13 : 12}
        </text>
      </g>
      <text x="370" y="146" fontSize="11" fontWeight={600} fill={BLUE} style={{ opacity: ordered ? 1 : 0, transition: "opacity 0.3s" }}>
        +1 baru saja
      </text>
      {ORDER_BARS.map((h, i) => {
        const last = i === ORDER_BARS.length - 1;
        const bh = last && ordered ? h + 10 : h;
        return <rect key={i} x={326 + i * 27} y={218 - bh} width="18" height={bh} rx="4" fill={last ? BLUE : tint(0.72)} style={{ transition: "y 0.5s, height 0.5s" }} />;
      })}
    </Art>
  );
}

/* ------------------------------------------------------------------ Web App (560 × 310) */

/** The month's bars grow while routine jobs tick themselves off, one by one. */
const WEBAPP_STEPS = [1000, 800, 800, 2600];
const MONTH_BARS = [44, 60, 52, 74, 66, 88, 80, 104];
const JOBS: [string, string][] = [
  ["Invoice terkirim", "08.00"],
  ["Stok diperbarui", "12.00"],
  ["Laporan dibuat", "17.00"],
];

export function WebAppArt(props: StoryProps) {
  const id = useIds();
  const [stage, step] = useStory(WEBAPP_STEPS, 3, props);
  const grown = step >= 1;
  return (
    <Art width={560} height={310} stage={stage}>
      <Defs id={id} />

      {/* Dashboard */}
      <Card id={id} x={24} y={20} w={330} h={330} />
      <text x="44" y="52" fontSize="14" fontWeight={600} fill={INK}>
        Ringkasan
      </text>
      <rect x="262" y="36" width="72" height="22" rx="11" fill="none" stroke={tint(0.7)} strokeWidth="1.2" />
      <text x="298" y="51" fontSize="10" fill={MUTED} textAnchor="middle">
        Bulan ini
      </text>
      {[
        ["Pendapatan", "Rp12,4 jt"],
        ["Pesanan", "128"],
      ].map(([label, value], i) => (
        <g key={label}>
          <rect x={44 + i * 150} y="70" width="140" height="56" rx="12" fill={SOFT} />
          <text x={58 + i * 150} y="91" fontSize="10" fill={MUTED}>
            {label}
          </text>
          <text x={58 + i * 150} y="114" fontSize="17" fontWeight={700} fill={INK} letterSpacing="-0.3">
            {value}
          </text>
        </g>
      ))}
      {MONTH_BARS.map((h, i) => (
        <rect
          key={i}
          x={48 + i * 36}
          y={290 - h}
          width="24"
          height={h}
          rx="5"
          fill={i === MONTH_BARS.length - 1 ? BLUE : tint(0.72)}
          style={{ transform: grown ? "none" : "scaleY(0.35)", transformBox: "fill-box", transformOrigin: "bottom", transition: `transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.05}s` }}
        />
      ))}

      {/* Routine jobs, running by themselves */}
      <Card id={id} x={302} y={96} w={234} h={172} />
      <circle cx="328" cy="124" r="12" fill={SOFT} />
      <Icon cx={328} cy={124} size={13}>
        <g {...stroke(BLUE, 2.2)}>{glyph.bolt}</g>
      </Icon>
      <text x="348" y="128.5" fontSize="12.5" fontWeight={600} fill={INK}>
        Berjalan otomatis
      </text>
      {JOBS.map(([job, time], i) => {
        const done = step >= i + 1;
        const y = 146 + i * 38;
        return (
          <g key={job}>
            <rect x="316" y={y} width="206" height="30" rx="9" fill={done ? tint(0.92) : "#fff"} stroke={EDGE} strokeWidth="1" style={{ transition: "fill 0.3s" }} />
            <circle cx="333" cy={y + 15} r="7.5" fill={done ? tint(0.55) : "#fff"} stroke={done ? "none" : tint(0.7)} strokeWidth="1.4" style={{ transition: "fill 0.3s" }} />
            <g style={{ opacity: done ? 1 : 0, transition: "opacity 0.3s" }}>
              <Icon cx={333} cy={y + 15} size={9}>
                <g {...stroke("#fff", 3.2)}>{glyph.check}</g>
              </Icon>
            </g>
            <text x="348" y={y + 19} fontSize="11" fill={done ? INK : MUTED}>
              {job}
            </text>
            <text x="508" y={y + 19} fontSize="9.5" fill={SUBTLE} textAnchor="end">
              {time}
            </text>
          </g>
        );
      })}
    </Art>
  );
}

/* ------------------------------------------------------------------ Online Store (740 × 480): three phones */

/**
 * Pick → add → order on WhatsApp, across three phones: the kaos is tapped in the catalog, added to the cart
 * on its page, appears in the cart, and the order goes out on WhatsApp (the one WhatsApp in the section).
 */
const STORE_STEPS = [1300, 900, 1100, 900, 800, 2400];
const BACK_W = 212;
const FRONT_W = 232;
const screenW = (w: number) => w - 2 * w * 0.036;
const CATALOG: [string, string, string][] = [
  ["kaos", "Kaos Katun", "Rp99.000"],
  ["cangkir", "Cangkir Putih", "Rp45.000"],
  ["lilin", "Lilin Aroma", "Rp119.000"],
  ["tanaman", "Tanaman Hias", "Rp85.000"],
];

export function OnlineStoreArt(props: StoryProps) {
  const id = useIds();
  const [stage, step] = useStory(STORE_STEPS, 5, props);
  const added = step >= 2;
  const inCart = step >= 3;
  const sent = step >= 5;
  const [sb, sf] = [screenW(BACK_W), screenW(FRONT_W)];
  const [tb, tf] = [phoneTop(sb), phoneTop(sf)];
  const tile = (sb - 30) / 2;
  return (
    <Art width={740} height={480} stage={stage}>
      <Defs id={id} />

      {/* Back left: the catalog */}
      <g transform="rotate(-8 166 320)">
        <Phone id={id} name="catalog" x={60} y={86} w={BACK_W} h={430}>
          <text x="12" y={tb + 16} fontSize="13" fontWeight={600} fill={INK}>
            Katalog
          </text>
          <rect x="12" y={tb + 26} width={sb - 24} height="22" rx="11" fill={SOFT} />
          <Icon cx={26} cy={tb + 37} size={10}>
            <g {...stroke(MUTED, 2.6)}>{glyph.search}</g>
          </Icon>
          <text x="36" y={tb + 40.5} fontSize="9" fill={SUBTLE}>
            Cari produk
          </text>
          {CATALOG.map(([img, name, price], i) => {
            const x = 12 + (i % 2) * (tile + 6);
            const y = tb + 58 + Math.floor(i / 2) * 120;
            const picked = i === 0 && step === 1;
            return (
              <g key={img}>
                <Tap on={picked} cx={x + tile / 2} cy={y + 40}>
                  <Photo id={id} name={`cat-${img}`} src={`/images/stock/${img}.jpg`} x={x} y={y} w={tile} h={80} r={10} width={200} />
                </Tap>
                {i === 0 && <rect x={x - 1.5} y={y - 1.5} width={tile + 3} height="83" rx="11.5" fill="none" stroke={BLUE} strokeWidth="2" style={{ opacity: step >= 1 && step <= 2 ? 1 : 0, transition: "opacity 0.3s" }} />}
                <text x={x + 2} y={y + 96} fontSize="9.5" fontWeight={600} fill={INK}>
                  {name}
                </text>
                <text x={x + 2} y={y + 109} fontSize="9" fontWeight={600} fill={BLUE}>
                  {price}
                </text>
              </g>
            );
          })}
        </Phone>
      </g>

      {/* Back right: the cart, ordered on WhatsApp */}
      <g transform="rotate(8 576 320)">
        <Phone id={id} name="cart" x={470} y={86} w={BACK_W} h={430}>
          <text x="12" y={tb + 16} fontSize="13" fontWeight={600} fill={INK}>
            Keranjang
          </text>
          <Pop on={inCart} from={-12}>
            <Photo id={id} name="cart-kaos" src="/images/stock/kaos.jpg" x={12} y={tb + 30} w={44} h={44} r={10} width={96} />
            <text x="64" y={tb + 47} fontSize="10" fontWeight={600} fill={INK}>
              Kaos Katun
            </text>
            <text x="64" y={tb + 62} fontSize="9.5" fill={MUTED}>
              Rp99.000 · M
            </text>
          </Pop>
          <g style={{ transform: inCart ? "translateY(56px)" : "none", transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)" }}>
            <Photo id={id} name="cart-cangkir" src="/images/stock/cangkir.jpg" x={12} y={tb + 30} w={44} h={44} r={10} width={96} />
            <text x="64" y={tb + 47} fontSize="10" fontWeight={600} fill={INK}>
              Cangkir Putih
            </text>
            <text x="64" y={tb + 62} fontSize="9.5" fill={MUTED}>
              Rp45.000
            </text>
            <path d={`M12 ${tb + 88}H${sb - 12}`} stroke={EDGE} strokeWidth="1" />
            <text x="12" y={tb + 108} fontSize="10" fill={MUTED}>
              Total
            </text>
            <text x={sb - 12} y={tb + 108} fontSize="12" fontWeight={700} fill={INK} textAnchor="end">
              {inCart ? "Rp144.000" : "Rp45.000"}
            </text>
            <Tap on={step === 4} cx={sb / 2} cy={tb + 139}>
              <PillButton id={id} x={12} y={tb + 122} w={sb - 24} h={34} label={sent ? "Terkirim ✓" : "Pesan via WhatsApp"} fs={11} whatsapp={!sent} />
            </Tap>
            <text x={sb / 2} y={tb + 176} fontSize="8.5" fill={SUBTLE} textAnchor="middle" style={{ opacity: sent ? 1 : 0, transition: "opacity 0.3s" }}>
              Pesanan masuk ke WhatsApp toko
            </text>
          </g>
        </Phone>
      </g>

      {/* Front: the product page */}
      <Phone id={id} name="product" x={254} y={40} w={FRONT_W} h={470}>
        <path d={`M18 ${tf + 6}l-6 6 6 6`} {...stroke(INK, 1.8)} />
        <text x={sf / 2} y={tf + 16} fontSize="11" fontWeight={600} fill={INK} textAnchor="middle">
          Detail produk
        </text>
        <Icon cx={sf - 22} cy={tf + 12} size={16}>
          <g {...stroke(INK, 2)}>{glyph.bag}</g>
        </Icon>
        <g style={{ opacity: added ? 1 : 0, transition: "opacity 0.3s" }}>
          <circle cx={sf - 14} cy={tf + 5} r="6.5" fill={BLUE} stroke="#fff" strokeWidth="1.5" />
          <text x={sf - 14} y={tf + 8} fontSize="8" fontWeight={700} fill="#fff" textAnchor="middle">
            1
          </text>
        </g>
        <Photo id={id} name="product-kaos" src="/images/stock/kaos.jpg" x={10} y={tf + 30} w={sf - 20} h={170} r={14} width={460} />
        <text x="12" y={tf + 226} fontSize="14" fontWeight={600} fill={INK}>
          Kaos Katun Premium
        </text>
        <text x="12" y={tf + 245} fontSize="13" fontWeight={700} fill={BLUE}>
          Rp99.000
        </text>
        {["S", "M", "L", "XL"].map((size, i) => (
          <g key={size}>
            <rect x={12 + i * 36} y={tf + 258} width="30" height="24" rx="8" fill={i === 1 ? tint(0.9) : "#fff"} stroke={i === 1 ? BLUE : tint(0.78)} strokeWidth="1.2" />
            <text x={27 + i * 36} y={tf + 274} fontSize="10" fontWeight={600} fill={i === 1 ? BLUE : MUTED} textAnchor="middle">
              {size}
            </text>
          </g>
        ))}
        <Tap on={step === 2} cx={sf / 2} cy={tf + 312}>
          <rect x="12" y={tf + 294} width={sf - 24} height="36" rx="18" fill={SOFT} stroke={tint(0.75)} strokeWidth="1.2" />
          <text x={sf / 2} y={tf + 316.5} fontSize="12" fontWeight={600} fill={BLUE} textAnchor="middle">
            {added ? "✓ Ditambahkan" : "Tambah ke keranjang"}
          </text>
        </Tap>
      </Phone>
    </Art>
  );
}

/* ------------------------------------------------------------------ Previews for "Butuhnya bukan website baru?" */

/** A browser screen filling a 360 × 240 canvas (the card rounds and tilts it). */
function Screen({ address, children }: { address: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 360 240" aria-hidden className="block h-auto w-full">
      <rect width="360" height="240" fill="#fff" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={20 + i * 12} cy="18" r="3.5" fill={tint(0.7)} />
      ))}
      <rect x="120" y="9" width="120" height="18" rx="9" fill={SOFT} />
      <text x="180" y="22" fontSize="10" fill={MUTED} textAnchor="middle">
        {address}
      </text>
      <path d="M0 36H360" stroke={EDGE} strokeWidth="1.2" />
      {children}
    </svg>
  );
}

/** One site, its old layout (grey) left of the divider and its new one (brand) right of it. */
export function RedesignPreview() {
  const id = useIds();
  const split = 172;
  return (
    <Screen address="bisnismu.id">
      <Defs id={id} />
      <clipPath id={id("old")}>
        <rect x="0" y="36" width={split} height="204" />
      </clipPath>
      <clipPath id={id("new")}>
        <rect x={split} y="36" width={360 - split} height="204" />
      </clipPath>
      {/* Before: a dated grey layout */}
      <g clipPath={url(id("old"))}>
        <rect x="16" y="50" width="328" height="96" rx="6" fill="#e3e5e8" />
        <Bar x={32} y={72} w={120} h={10} fill="#c4c8ce" />
        <Bar x={32} y={90} w={88} h={10} fill="#c4c8ce" />
        <rect x="32" y="110" width="58" height="18" rx="3" fill="#b4b9c0" />
        {[16, 128, 240].map((x) => (
          <g key={x}>
            <rect x={x} y="156" width="104" height="70" rx="4" fill="#eceef1" />
            <Bar x={x + 12} y={172} w={62} h={6} fill="#d3d6db" />
            <Bar x={x + 12} y={184} w={44} h={6} fill="#d3d6db" />
          </g>
        ))}
      </g>
      {/* After: the brand refresh */}
      <g clipPath={url(id("new"))}>
        <rect x="16" y="50" width="328" height="96" rx="12" fill={url(id("blue"))} />
        <Bar x={32} y={70} w={130} h={11} fill="#fff" />
        <Bar x={32} y={88} w={96} h={11} fill="#fff" />
        <rect x="32" y="108" width="76" height="20" rx="10" fill="#fff" />
        <circle cx="290" cy="98" r="30" fill="#fff" fillOpacity=".22" />
        <circle cx="290" cy="98" r="16" fill="#fff" fillOpacity=".5" />
        {[16, 128, 240].map((x) => (
          <g key={x}>
            <rect x={x} y="156" width="104" height="70" rx="12" fill={SOFT} stroke={EDGE} strokeWidth="1.2" />
            <circle cx={x + 20} cy="176" r="8" fill={tint(0.55)} />
            <Bar x={x + 12} y={194} w={66} h={6} />
          </g>
        ))}
      </g>
      {/* Divider with its handle, and the two labels */}
      <path d={`M${split} 36V240`} stroke="#fff" strokeWidth="3" />
      <circle cx={split} cy="152" r="17" fill={NAVY} fillOpacity=".12" />
      <circle cx={split} cy="150" r="15" fill="#fff" />
      <path d={`M${split - 4} 145l-5 5 5 5M${split + 4} 145l5 5-5 5`} {...stroke(BLUE, 2.2)} />
      <rect x="24" y="200" width="46" height="20" rx="10" fill="#fff" />
      <text x="47" y="214" fontSize="11" fontWeight={600} fill={MUTED} textAnchor="middle">
        Lama
      </text>
      <rect x="290" y="200" width="46" height="20" rx="10" fill={BLUE} />
      <text x="313" y="214" fontSize="11" fontWeight={600} fill="#fff" textAnchor="middle">
        Baru
      </text>
    </Screen>
  );
}

/** This month's care, ticked off: content, backup, monitoring. */
export function CarePreview() {
  const id = useIds();
  const tasks: [string, string][] = [
    ["Konten diperbarui", "Selesai"],
    ["Backup bulanan", "Selesai"],
    ["Pemantauan website", "Aktif"],
  ];
  return (
    <Screen address="bisnismu.id/admin">
      <Defs id={id} />
      <text x="18" y="64" fontSize="15" fontWeight={600} fill={INK}>
        Perawatan bulanan
      </text>
      <rect x="276" y="48" width="66" height="22" rx="11" fill={SOFT} />
      <Icon cx={290} cy={59} size={11}>
        <g {...stroke(BLUE, 2.6)}>{glyph.calendar}</g>
      </Icon>
      <text x="318" y="63" fontSize="10.5" fontWeight={600} fill={BLUE} textAnchor="middle">
        Oktober
      </text>
      {tasks.map(([task, status], i) => {
        const y = 82 + i * 50;
        const live = status === "Aktif";
        return (
          <g key={task}>
            <rect x="16" y={y} width="328" height="40" rx="11" fill={SOFT} stroke={EDGE} strokeWidth="1.2" />
            <circle cx="38" cy={y + 20} r="10" fill={url(id("blue"))} />
            <Icon cx={38} cy={y + 20} size={11}>
              <g {...stroke("#fff", 3.2)}>{live ? glyph.shield : glyph.check}</g>
            </Icon>
            <text x="56" y={y + 24.5} fontSize="12.5" fill={INK}>
              {task}
            </text>
            <rect x="268" y={y + 10} width="62" height="20" rx="10" fill={live ? BLUE : "#fff"} />
            <text x="299" y={y + 24} fontSize="10.5" fontWeight={600} fill={live ? "#fff" : BLUE} textAnchor="middle">
              {status}
            </text>
          </g>
        );
      })}
    </Screen>
  );
}
