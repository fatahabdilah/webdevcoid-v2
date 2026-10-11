import { useId, type ReactNode } from "react";
import { brand } from "@/lib/brand";

/*
 * Icons for "Sudah termasuk di setiap harga" (Services.tsx), after the Figma "included" icons: a frosted
 * outer shape, a blue inner shape and a glowing white glyph, in a 92-unit box. Each item gets its own
 * outline (circle, shield, rounded square, arch) and a glyph that says what it is.
 */

/** Outer and inner outlines (with their offsets in the 92-unit box) and where the glyph centres. */
type Shape = { outer: string; inner: string; outerAt?: string; innerAt?: string; center: [number, number] };

const SHIELD_OUTER =
  "M0.254 17.475C0.499 13.907 3.322 11.183 6.856 10.631C11.133 9.963 16.886 8.921 21.281 7.591C26.591 5.981 33.888 2.751 38.164 0.775C40.391 -0.258 42.984 -0.258 45.211 0.775C49.487 2.751 56.783 5.982 62.094 7.59C66.489 8.92 72.242 9.963 76.519 10.631C80.053 11.183 82.876 13.907 83.121 17.475C84.228 33.603 83.427 77.508 43.913 90.428C42.466 90.894 40.909 90.894 39.462 90.428C-0.052 77.508 -0.853 33.603 0.254 17.475Z";
const SHIELD_INNER =
  "M0.184 13.067C0.361 10.387 2.472 8.332 5.122 7.901C8.202 7.399 12.282 6.627 15.41 5.645C19.186 4.461 24.348 2.104 27.465 0.615C29.181 -0.205 31.193 -0.205 32.91 0.615C36.027 2.104 41.189 4.461 44.965 5.645C48.093 6.627 52.173 7.399 55.253 7.901C57.903 8.332 60.014 10.388 60.191 13.067C60.991 25.154 60.407 58.003 31.908 67.737C30.792 68.113 29.583 68.113 28.467 67.737C-0.033 58.003 -0.617 25.154 0.184 13.067Z";

const shapes: Record<"circle" | "shield" | "square" | "arch", Shape> = {
  circle: {
    outer: "M46 0a46 46 0 1 1 0 92a46 46 0 1 1 0-92Z",
    inner: "M46 12a34 34 0 1 1 0 68a34 34 0 1 1 0-68Z",
    center: [46, 46],
  },
  shield: {
    outer: SHIELD_OUTER,
    inner: SHIELD_INNER,
    outerAt: "translate(4.3 0.6)",
    innerAt: "translate(15.8 12)",
    center: [46, 41],
  },
  square: {
    outer: "M28 1H64A27 27 0 0 1 91 28V64A27 27 0 0 1 64 91H28A27 27 0 0 1 1 64V28A27 27 0 0 1 28 1Z",
    inner: "M32 14H60A18 18 0 0 1 78 32V60A18 18 0 0 1 60 78H32A18 18 0 0 1 14 60V32A18 18 0 0 1 32 14Z",
    center: [46, 46],
  },
  arch: {
    outer: "M46 1A45 45 0 0 1 91 46V71A20 20 0 0 1 71 91H21A20 20 0 0 1 1 71V46A45 45 0 0 1 46 1Z",
    inner: "M46 14A32 32 0 0 1 78 46V65A13 13 0 0 1 65 78H27A13 13 0 0 1 14 65V46A32 32 0 0 1 46 14Z",
    center: [46, 49],
  },
};

const glyphStroke = { fill: "none", stroke: "#fff", strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** 30-unit glyphs, drawn in white. */
const glyphs: Record<string, ReactNode> = {
  // Domain & hosting: the web
  globe: (
    <g {...glyphStroke} strokeWidth="2.4">
      <circle cx="15" cy="15" r="12" />
      <ellipse cx="15" cy="15" rx="5" ry="12" />
      <path d="M3.5 11h23M3.5 19h23" />
    </g>
  ),
  // SSL: a lock
  lock: (
    <g>
      <path d="M10 13.5V10a5 5 0 0 1 10 0v3.5" {...glyphStroke} strokeWidth="2.8" />
      <rect x="5.5" y="13" width="19" height="14" rx="3.5" fill="#fff" />
      <circle cx="15" cy="20" r="2.2" fill={brand.blue} />
    </g>
  ),
  // Responsive: laptop and phone
  devices: (
    <g {...glyphStroke} strokeWidth="2.3">
      <rect x="2" y="6" width="17" height="12" rx="2" />
      <path d="M0.5 22.5H19" />
      <rect x="21.5" y="10" width="8" height="15" rx="2.2" fill="#fff" />
    </g>
  ),
  // SEO: found in search, climbing
  search: (
    <g {...glyphStroke}>
      <circle cx="13" cy="13" r="9.5" strokeWidth="2.6" />
      <path d="M20.2 20.2 27 27" strokeWidth="3.2" />
      <path d="M8.5 16l3-3 2 2 3.5-3.5" strokeWidth="2" />
    </g>
  ),
};

const items = {
  domain: { shape: "circle", glyph: "globe" },
  ssl: { shape: "shield", glyph: "lock" },
  responsive: { shape: "square", glyph: "devices" },
  seo: { shape: "arch", glyph: "search" },
} as const;

export type IncludedIconName = keyof typeof items;

export function IncludedIcon({ name }: { name: IncludedIconName }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n: string) => `${uid}-${n}`;
  const { shape, glyph } = items[name];
  const s = shapes[shape];
  const [cx, cy] = s.center;

  return (
    <svg viewBox="0 0 92 92" aria-hidden className="size-[92px] shrink-0 overflow-visible">
      <defs>
        <linearGradient id={id("outer")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#8ec0fa" />
        </linearGradient>
        <linearGradient id={id("inner")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cce3fd" />
          <stop offset="1" stopColor={brand.blue} />
        </linearGradient>
        {/* Frosted rim: a navy shade along the top inside edge and a white one along the bottom */}
        <filter id={id("rim")} x="-10%" y="-10%" width="120%" height="125%" colorInterpolationFilters="sRGB">
          <feOffset in="SourceAlpha" dy="-2" result="up" />
          <feGaussianBlur in="up" stdDeviation=".6" result="upBlur" />
          <feComposite in="upBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="upEdge" />
          <feFlood floodColor={brand.navy} floodOpacity=".5" />
          <feComposite in2="upEdge" operator="in" result="navyRim" />
          <feOffset in="SourceAlpha" dy="1.2" result="down" />
          <feGaussianBlur in="down" stdDeviation=".6" result="downBlur" />
          <feComposite in="downBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="downEdge" />
          <feFlood floodColor="#fff" />
          <feComposite in2="downEdge" operator="in" result="whiteRim" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="navyRim" />
            <feMergeNode in="whiteRim" />
          </feMerge>
        </filter>
        <filter id={id("drop")} x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="0" dy="1" stdDeviation="0" floodColor="#000" floodOpacity=".15" />
        </filter>
        <filter id={id("glow")} x="-100%" y="-100%" width="300%" height="300%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#fff" floodOpacity=".45" />
        </filter>
      </defs>

      <path d={s.outer} transform={s.outerAt} fill={url(id("outer"))} filter={url(id("rim"))} />
      <path d={s.inner} transform={s.innerAt} fill={url(id("inner"))} filter={url(id("drop"))} />
      <g transform={`translate(${cx - 15} ${cy - 15})`} filter={url(id("glow"))}>
        {glyphs[glyph]}
      </g>
    </svg>
  );
}

function url(id: string) {
  return `url(#${id})`;
}
