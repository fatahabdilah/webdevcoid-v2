import "./emblem.css";

/**
 * The webdev emblem (Figma 1241:2 "Mockup / Emblem Ring", from the Brand Hub), drawn in code: the outer hairline ring
 * and the holo ring (conic gradients, sampled from the design's ring renders), the dark disc, and the mark in "chrome"
 * (per-bar SVG gradients after the design's Chromatic-metal render: a dark band with a brand-blue fringe, white
 * highlights, a thin inner bevel, and a slow sheen across it). Layer boxes are the design's, in its 716.85-unit square
 * (the outer ring), as percentages. Single instance per page (the SVG ids are fixed).
 */
const U = 716.846;
const box = (left: number, top: number, w: number, h = w) => ({
  left: `${(left / U) * 100}%`,
  top: `${(top / U) * 100}%`,
  width: `${(w / U) * 100}%`,
  height: `${(h / U) * 100}%`,
});

/** Round the ring clockwise from the top: deep blue, brightening to white just right of centre, back to blue. */
const RING =
  "conic-gradient(#0c51de 0deg, #064ad9 30deg, #0448d7 40deg, #1251d8 50deg, #4174e0 60deg, #7297e8 70deg, #a2bbf0 80deg, #d0ddf7 90deg, #fff 100deg, #f0f5ff 110deg, #c7dafc 135deg, #7da9f7 180deg, #357af4 225deg, #1d66ed 270deg, #155de7 315deg, #0c51de 360deg)";
/** Annulus masks: the holo ring's hole is the disc (79.7% of its radius); the outer ring is a hairline. */
const annulus = (inner: number) => `radial-gradient(closest-side, transparent ${inner - 0.4}%, #000 ${inner}%)`;

/** The mark's four parts (the design's vector, 327.152 × 381.734), each with its own chrome. */
const PARTS = [
  "M0 94.4148V287.262L35.5849 307.809V73.8674L0 94.4148Z",
  "M63.9954 57.5098V324.224L99.5803 344.772V36.9624L63.9954 57.5098Z",
  "M127.991 20.5474V361.187L163.576 381.734V0L127.991 20.5474Z",
  "M191.986 16.415V57.5098L291.567 114.962V266.715L191.986 324.224V365.319L327.152 287.262V94.4148L191.986 16.415Z",
];
const DARK = "#2a2e35";
/** Top-to-bottom stops per part: [offset, colour]. */
const CHROME: [number, string][][] = [
  [[0, "#fff"], [0.08, "#b9d0fb"], [0.15, "#236ef3"], [0.22, DARK], [0.44, DARK], [0.5, "#0346d6"], [0.58, "#c9dafb"], [0.68, "#fff"], [1, "#eef1f5"]],
  [[0, "#596170"], [0.05, "#236ef3"], [0.16, "#7ea6f5"], [0.34, "#fff"], [0.8, "#fff"], [1, "#d9dee6"]],
  [[0, "#fff"], [0.4, "#f3f5f8"], [0.68, "#b9c1cc"], [0.86, "#e7ebf0"], [1, "#fff"]],
  [[0, "#fff"], [0.05, "#b9d0fb"], [0.1, "#236ef3"], [0.16, DARK], [0.54, DARK], [0.6, "#0346d6"], [0.66, "#9ec0ff"], [0.73, "#fff"], [0.88, "#e3e8ef"], [1, "#7d8796"]],
];

function Mark() {
  return (
    <svg viewBox="-4 -4 335.152 389.734" className="size-full overflow-visible">
      <defs>
        {CHROME.map((stops, i) => (
          <linearGradient key={i} id={`emb-chrome-${i}`} x1="0" y1="0" x2="0.12" y2="1">
            {stops.map(([o, c]) => (
              <stop key={o} offset={o} stopColor={c} />
            ))}
          </linearGradient>
        ))}
        {/* across each bar: a touch darker at the edges, so it reads as rounded metal */}
        <linearGradient id="emb-roll" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="emb-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="emb-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <clipPath id="emb-clip">
          {PARTS.map((d) => (
            <path key={d} d={d} stroke="#000" strokeWidth="5" strokeLinejoin="round" />
          ))}
        </clipPath>
      </defs>
      {PARTS.map((d, i) => (
        <g key={d}>
          {/* the stroke in the same paint rounds the corners, like the design's softened render */}
          <path d={d} fill={`url(#emb-chrome-${i})`} stroke={`url(#emb-chrome-${i})`} strokeWidth="5" strokeLinejoin="round" />
          {i < 3 && <path d={d} fill="url(#emb-roll)" />}
        </g>
      ))}
      <g clipPath="url(#emb-clip)">
        {/* soft dark edges inside each part, so the metal reads as rounded, like the design's blurred render */}
        {PARTS.map((d) => (
          <path key={d} d={d} fill="none" stroke="#0b0d12" strokeOpacity="0.55" strokeWidth="9" strokeLinejoin="round" filter="url(#emb-soft)" />
        ))}
        {/* the bevel: a fine light edge just inside each part */}
        {PARTS.map((d) => (
          <path key={d} d={d} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" strokeLinejoin="round" transform="translate(0.6 0.6)" />
        ))}
        {/* a soft sheen passing over the metal now and then */}
        <rect className="emblem-sheen" x="-120" y="-40" width="110" height="480" fill="url(#emb-sheen)" transform="rotate(18)" />
      </g>
    </svg>
  );
}

export function Emblem({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`relative aspect-square ${className}`}>
      {/* outer hairline ring (mirrored, as in the design) */}
      <div className="absolute -scale-x-100 rounded-full" style={{ ...box(0, 0, U), background: RING, mask: annulus(96) }} />
      {/* the holo ring */}
      <div className="absolute rounded-full" style={{ ...box(18.634, 18.634, 679.579), background: RING, mask: annulus(79.7) }} />
      {/* the dark disc */}
      <div className="absolute rounded-full bg-[linear-gradient(180deg,#000_37%,#303030)]" style={box(83.362, 82.93, 549.023)} />
      {/* the mark, in chrome */}
      <div className="absolute" style={box(195.56, 166.06, 327.152, 381.734)}>
        <Mark />
      </div>
    </div>
  );
}
