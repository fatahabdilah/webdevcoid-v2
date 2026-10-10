import { getImageProps } from "next/image";
import { useId, type ReactNode } from "react";
import { brand, mix } from "@/lib/brand";

/*
 * Vector illustrations for the service bentos (Services.tsx), redrawn from the template's grey PNGs
 * in the brand blues. Same canvas sizes as the PNGs they replace, so the card layouts don't move.
 * People's photos stay photos (optimised through next/image); everything else is SVG.
 */

const BLUE = brand.blue;
const LIGHT = brand.light;
const NAVY = brand.navy;
/** Light blue on its way to white: the brand gradient's lightest stretch, for tints. */
const tint = (t: number) => mix(LIGHT, brand.white, t);
const PALE = tint(0.84);
const LINE = tint(0.62);
const INK = "#1a1a1a"; // grey-01
const MUTED = "#525252"; // grey-03

/** webdev.co.id mark (see LogoMark in icons.tsx), 107 × 124.852 units. */
const LOGO =
  "M0 30.8798V93.9535L11.6386 100.674V24.1595L0 30.8798ZM20.9307 18.8095V106.043L32.5693 112.763V12.0891L20.9307 18.8095ZM41.8614 6.72035V118.132L53.5 124.852V0L41.8614 6.72035ZM62.7921 5.36877V18.8095L95.3614 37.6002V87.2332L62.7921 106.043V119.483L107 93.9535V30.8798L62.7921 5.36877Z";

/** Optimised URL for a photo placed inside an SVG. */
const photo = (src: string, size: number) => getImageProps({ src, alt: "", width: size, height: size }).props.src;

/** Ids unique to this instance, so gradients and filters never collide (some bentos render twice). */
function useIds() {
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (name: string) => `${base}-${name}`;
}

function Art({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-hidden className="block h-auto w-full shrink-0 overflow-visible" fontWeight={400}>
      {children}
    </svg>
  );
}

/** The mark, centred on (cx, cy) at the given height. */
function Logo({ cx, cy, h, fill }: { cx: number; cy: number; h: number; fill: string }) {
  const s = h / 124.852;
  return <path d={LOGO} fill={fill} transform={`translate(${cx - (107 * s) / 2} ${cy - h / 2}) scale(${s})`} />;
}

/** A 24-unit icon (Lucide-style geometry), centred on (cx, cy) at the given size. */
function Icon({ cx, cy, size, children }: { cx: number; cy: number; size: number; children: ReactNode }) {
  const s = size / 24;
  return <g transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${s})`}>{children}</g>;
}

const stroke = (color: string, width = 2) =>
  ({ fill: "none", stroke: color, strokeWidth: width, strokeLinecap: "round", strokeLinejoin: "round" }) as const;

/** Smooth curve through the points (Catmull-Rom as cubic Béziers). */
function smooth(pts: [number, number][]) {
  const r = (n: number) => Math.round(n * 10) / 10;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const [p1, p2] = [pts[i], pts[i + 1]];
    const p3 = pts[i + 2] ?? p2;
    d += ` C${r(p1[0] + (p2[0] - p0[0]) / 6)} ${r(p1[1] + (p2[1] - p0[1]) / 6)} ${r(p2[0] - (p3[0] - p1[0]) / 6)} ${r(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/* ------------------------------------------------------------------ Company Profile (750 × 780) */

export function CompanyProfileArt() {
  const id = useIds();
  const tileX = [15, 311, 607];
  const mid = (x: number) => x + 64;
  return (
    <Art width={750} height={780}>
      <defs>
        <linearGradient id={id("tile")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LIGHT} />
          <stop offset="1" stopColor={BLUE} />
        </linearGradient>
        <linearGradient id={id("soft")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint(0.9)} />
          <stop offset="1" stopColor={tint(0.75)} />
        </linearGradient>
        <linearGradient id={id("gloss")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("ring")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={LIGHT} />
          <stop offset=".5" stopColor={BLUE} />
          <stop offset="1" stopColor={NAVY} />
        </linearGradient>
        <linearGradient id={id("mark")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LIGHT} />
          <stop offset="1" stopColor={BLUE} />
        </linearGradient>
        <filter id={id("lift")} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor={BLUE} floodOpacity=".28" />
        </filter>
        <filter id={id("float")} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor={NAVY} floodOpacity=".12" />
        </filter>
      </defs>

      {/* Connectors */}
      <g {...stroke(LINE, 2)} opacity=".7">
        <path d="M365 350H240Q225 350 225 365V685M143 685H311" />
        <path d="M385 350H510Q525 350 525 365V685M439 685H607" />
      </g>
      <g {...stroke(LINE, 3)}>
        <path d="M375 238V300Q375 320 355 320H100Q79 320 79 341V397" />
        <path d="M375 300Q375 320 395 320H650Q671 320 671 341V397" />
        <path d="M375 300V397" />
      </g>
      <g {...stroke(LINE, 3)} strokeDasharray="8 9">
        {tileX.map((x) => (
          <path key={x} d={`M${mid(x)} 525V622`} />
        ))}
      </g>
      {/* Data moving along the lines */}
      <g {...stroke(BLUE, 3.5)}>
        <path d="M190 320H222M528 320H560M375 352V378" />
      </g>
      {tileX.flatMap((x) => [397, 622].map((y) => <circle key={`${x}-${y}`} cx={mid(x)} cy={y} r="6" fill={LINE} />))}

      {/* Hub */}
      <circle cx="375" cy="136" r="126" fill="#fff" fillOpacity=".5" stroke="#fff" strokeWidth="2" />
      <circle cx="375" cy="136" r="102" fill="#fff" filter={`url(#${id("float")})`} />
      <circle cx="375" cy="136" r="84" fill="none" stroke={`url(#${id("ring")})`} strokeWidth="7" />
      <Logo cx={375} cy={136} h={84} fill={`url(#${id("mark")})`} />

      {/* Services */}
      {tileX.map((x) => (
        <g key={x} filter={`url(#${id("lift")})`}>
          <rect x={x} y="397" width="128" height="128" rx="30" fill={`url(#${id("tile")})`} />
          <rect x={x} y="397" width="128" height="128" rx="30" fill={`url(#${id("gloss")})`} />
          <rect x={x + 1.5} y="398.5" width="125" height="125" rx="28.5" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
        </g>
      ))}
      <Icon cx={79} cy={461} size={44}>
        <g fill="#fff">
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 8.6C4 10.3 7.6 11.6 12 11.6S20 10.3 20 8.6V11.2C20 12.9 16.4 14.2 12 14.2S4 12.9 4 11.2Z" />
          <path d="M4 14C4 15.7 7.6 17 12 17S20 15.7 20 14V16.6C20 18.3 16.4 19.6 12 19.6S4 18.3 4 16.6Z" />
        </g>
      </Icon>
      <Icon cx={375} cy={461} size={44}>
        <g fill="#fff">
          <circle cx="12" cy="7.5" r="4" />
          <path d="M4 19.6C4 15.9 7.6 13.6 12 13.6S20 15.9 20 19.6Q20 21 18.6 21H5.4Q4 21 4 19.6Z" />
        </g>
      </Icon>
      <Icon cx={671} cy={461} size={44}>
        <path
          fill="#fff"
          d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
        />
      </Icon>

      {/* Outcomes */}
      {tileX.map((x) => (
        <g key={x} filter={`url(#${id("float")})`}>
          <rect x={x} y="622" width="128" height="128" rx="30" fill={`url(#${id("soft")})`} />
          <rect x={x + 1.5} y="623.5" width="125" height="125" rx="28.5" fill="none" stroke="#fff" strokeWidth="2" />
        </g>
      ))}
      <Icon cx={79} cy={686} size={44}>
        <g {...stroke(LIGHT)}>
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
          <path d="m21.854 2.147-10.94 10.939" />
        </g>
      </Icon>
      <Icon cx={375} cy={686} size={44}>
        <g {...stroke(LIGHT)}>
          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <path d="m9 12 2 2 4-4" />
        </g>
      </Icon>
      <Icon cx={671} cy={686} size={44}>
        <g {...stroke(LIGHT)}>
          <circle cx="12" cy="12" r="10" />
          <path d="M14.83 14.83a4 4 0 1 1 0-5.66" />
        </g>
      </Icon>
    </Art>
  );
}

/* ------------------------------------------------------------------ Landing Page (648 × 288) */

function BotAvatar({ cx, cy, glow }: { cx: number; cy: number; glow: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="40" fill={`url(#${glow})`} />
      <circle cx={cx} cy={cy} r="23" fill="#fff" />
      <Logo cx={cx} cy={cy} h={24} fill={BLUE} />
    </g>
  );
}

export function LandingPageArt() {
  const id = useIds();
  return (
    <Art width={648} height={288}>
      <defs>
        <radialGradient id={id("glow")}>
          <stop offset=".5" stopColor={LIGHT} stopOpacity=".55" />
          <stop offset="1" stopColor={LIGHT} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("bubble")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={LIGHT} />
          <stop offset="1" stopColor={BLUE} />
        </linearGradient>
        <clipPath id={id("face")}>
          <circle cx="605" cy="144" r="40" />
        </clipPath>
        <filter id={id("lift")} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor={BLUE} floodOpacity=".25" />
        </filter>
        {/* White bubbles sit on a near-white card: a soft shadow keeps them distinct */}
        <filter id={id("bubble")} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={NAVY} floodOpacity=".08" />
        </filter>
      </defs>

      <BotAvatar cx={40} cy={40} glow={id("glow")} />
      <rect x="89" y="0" width="108" height="80" rx="24" fill="#fff" stroke={tint(0.85)} strokeWidth="1.5" filter={`url(#${id("bubble")})`} />
      <circle cx="118" cy="40" r="6.5" fill={LIGHT} />
      <circle cx="143" cy="40" r="6.5" fill={LIGHT} fillOpacity=".6" />
      <circle cx="168" cy="40" r="6.5" fill={LIGHT} fillOpacity=".3" />

      <rect x="85" y="104" width="472" height="80" rx="24" fill={`url(#${id("bubble")})`} filter={`url(#${id("lift")})`} />
      <text x="321" y="153" fontSize="25" fill="#fff" textAnchor="middle">
        Can you tell me more about pricing?
      </text>
      <image href={photo("/images/avatars/chat-customer.png", 80)} x="565" y="104" width="80" height="80" clipPath={`url(#${id("face")})`} preserveAspectRatio="xMidYMid slice" />

      <BotAvatar cx={40} cy={248} glow={id("glow")} />
      <rect x="89" y="208" width="422" height="80" rx="24" fill="#fff" stroke={tint(0.85)} strokeWidth="1.5" filter={`url(#${id("bubble")})`} />
      <text x="300" y="257" fontSize="25" fill={INK} textAnchor="middle">
        Good day John, how I can help?
      </text>
    </Art>
  );
}

/* ------------------------------------------------------------------ Online Store (580 × 367) */

function SideCard({ x, y, w, h, face, name, faceId, opacity }: { x: number; y: number; w: number; h: number; face: string; name: string; faceId: string; opacity: number }) {
  const cx = x + w / 2;
  const r = w * 0.18;
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx="28" fill="#fff" fillOpacity=".85" />
      <clipPath id={faceId}>
        <circle cx={cx} cy={y + h * 0.33} r={r} />
      </clipPath>
      <image href={photo(face, 64)} x={cx - r} y={y + h * 0.33 - r} width={r * 2} height={r * 2} clipPath={`url(#${faceId})`} preserveAspectRatio="xMidYMid slice" />
      <text x={cx} y={y + h * 0.66} fontSize={w * 0.11} fill={MUTED} textAnchor="middle">
        {name}
      </text>
      <rect x={cx - w * 0.28} y={y + h * 0.75} width={w * 0.56} height={h * 0.14} rx={h * 0.06} fill={PALE} />
    </g>
  );
}

export function OnlineStoreArt() {
  const id = useIds();
  return (
    <Art width={580} height={367}>
      <defs>
        <linearGradient id={id("edge")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={LIGHT} />
          <stop offset=".5" stopColor={BLUE} />
          <stop offset="1" stopColor={NAVY} />
        </linearGradient>
        <clipPath id={id("face")}>
          <circle cx="291" cy="100" r="51" />
        </clipPath>
        <filter id={id("lift")} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor={BLUE} floodOpacity=".22" />
        </filter>
      </defs>

      <SideCard x={2} y={95} w={170} h={177} face="/images/avatars/ethan.png" name="Ethan" faceId={id("f1")} opacity={0.5} />
      <SideCard x={408} y={95} w={170} h={177} face="/images/avatars/carter.png" name="Carter" faceId={id("f4")} opacity={0.5} />
      <SideCard x={75} y={72} w={176} h={222} face="/images/avatars/samara.png" name="Samara" faceId={id("f2")} opacity={0.8} />
      <SideCard x={329} y={72} w={176} h={222} face="/images/avatars/bennett.png" name="Bennett" faceId={id("f3")} opacity={0.8} />

      <rect x="160" y="20" width="262" height="325" rx="40" fill="#fff" filter={`url(#${id("lift")})`} />
      <rect x="162" y="22" width="258" height="321" rx="38" fill="none" stroke={`url(#${id("edge")})`} strokeWidth="4" />
      <image href={photo("/images/avatars/liam.png", 106)} x="240" y="49" width="102" height="102" clipPath={`url(#${id("face")})`} preserveAspectRatio="xMidYMid slice" />
      <text x="291" y="212" fontSize="32" fontWeight={500} fill={INK} textAnchor="middle">
        Liam Foster
      </text>
      <rect x="213" y="262" width="156" height="48" rx="16" fill={PALE} />
      <circle cx="237" cy="286" r="5" fill={BLUE} />
      <text x="300" y="295" fontSize="24" fill={BLUE} textAnchor="middle">
        Excellent
      </text>
    </Art>
  );
}

/* ------------------------------------------------------------------ Web App (600 × 257) */

const sales: [number, number][] = [
  [5, 125], [25, 103], [45, 123], [55, 120], [73, 133], [92, 102], [103, 110], [117, 101], [140, 103], [157, 93],
  [170, 76], [183, 90], [197, 86], [213, 107], [223, 103], [240, 150], [253, 165], [265, 155], [275, 145], [287, 151],
  [305, 143], [317, 157], [335, 148], [350, 151], [370, 122], [395, 148], [405, 141], [422, 161], [440, 151], [455, 175], [478, 184],
];
const salesLine = smooth(sales);

export function WebAppArt() {
  const id = useIds();
  return (
    <Art width={600} height={257}>
      <defs>
        <linearGradient id={id("area")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LIGHT} stopOpacity=".55" />
          <stop offset=".6" stopColor={BLUE} stopOpacity=".18" />
          <stop offset="1" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("line")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={LIGHT} />
          <stop offset=".5" stopColor={BLUE} />
          <stop offset="1" stopColor={NAVY} />
        </linearGradient>
        <filter id={id("tip")} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={NAVY} floodOpacity=".1" />
        </filter>
      </defs>

      <g {...stroke(LINE, 1.5)} strokeDasharray="6 6">
        {[5, 123, 241, 359, 595].map((x) => (
          <path key={x} d={`M${x} 5V252`} />
        ))}
      </g>
      <path d={`${salesLine} V252 H5 Z`} fill={`url(#${id("area")})`} />
      <path d={salesLine} {...stroke(`url(#${id("line")})`, 3.5)} />
      <path d="M478 184H600" {...stroke(LIGHT, 3)} strokeDasharray="6 7" opacity=".6" />

      <path d="M478 8V184" {...stroke(NAVY, 2)} />
      <circle cx="478" cy="8" r="4.5" fill={NAVY} />
      <circle cx="478" cy="184" r="10" fill={BLUE} stroke="#fff" strokeWidth="3" />

      <rect x="384" y="56" width="186" height="36" rx="18" fill="#fff" stroke={tint(0.78)} filter={`url(#${id("tip")})`} />
      <text x="477" y="80" fontSize="17" fill={MUTED} textAnchor="middle">
        Total Sales: <tspan fill={NAVY} fontWeight={600}>10K</tspan>
      </text>
    </Art>
  );
}

/* ------------------------------------------------------------------ Maintenance (600 × 327) */

/** Point on the orbit circle (centre 300, 342) at the given angle (degrees, 0 = right, 90 = up). */
const orbit = (r: number, deg: number) => [300 + r * Math.cos((deg * Math.PI) / 180), 342 - r * Math.sin((deg * Math.PI) / 180)] as const;
const arc = (r: number, from: number, to: number) => {
  const [x1, y1] = orbit(r, from);
  const [x2, y2] = orbit(r, to);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
};

export function MaintenanceArt() {
  const id = useIds();
  const badge = (cx: number, cy: number, r: number) => (
    <g filter={`url(#${id("lift")})`}>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id("ball")})`} />
      <circle cx={cx} cy={cy} r={r - 1.5} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
    </g>
  );
  return (
    <Art width={600} height={327}>
      <defs>
        <radialGradient id={id("glow")} cx=".5" cy="1" r=".6">
          <stop offset="0" stopColor={LIGHT} stopOpacity=".35" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("fade")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={LIGHT} stopOpacity=".15" />
          <stop offset=".45" stopColor={LIGHT} stopOpacity=".7" />
          <stop offset="1" stopColor={LIGHT} stopOpacity=".1" />
        </linearGradient>
        <linearGradient id={id("ball")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={LIGHT} />
          <stop offset="1" stopColor={BLUE} />
        </linearGradient>
        <filter id={id("lift")} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor={BLUE} floodOpacity=".3" />
        </filter>
      </defs>

      <ellipse cx="300" cy="360" rx="300" ry="210" fill={`url(#${id("glow")})`} />
      <g fill="none" stroke="#fff" strokeWidth="2">
        <circle cx="300" cy="380" r="215" strokeOpacity=".9" />
        <circle cx="300" cy="380" r="165" strokeOpacity=".9" />
      </g>
      <g {...stroke(`url(#${id("fade")})`, 2.5)}>
        <path d={arc(331, 145, 30)} />
        <path d={arc(280, 108, 18)} />
        <path d={arc(232, 150, 8)} />
      </g>

      <circle cx="60" cy="327" r="27" fill={PALE} />
      {badge(63, 98, 46)}
      {badge(422, 145, 27)}
      {badge(545, 207, 46)}

      <Icon cx={63} cy={98} size={40}>
        <rect x="2" y="4" width="20" height="16" rx="3.5" fill="#fff" />
        <path d="m22 7.5-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7.5" {...stroke(BLUE, 1.8)} />
      </Icon>
      <Icon cx={422} cy={145} size={26}>
        <g {...stroke("#fff", 2)}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
        </g>
      </Icon>
      <Icon cx={545} cy={207} size={40}>
        <g {...stroke("#fff", 2)}>
          <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
          <path d="m14 7 3 3M5 6v4M19 14v4M10 2v2M7 8H3M21 16h-4M11 3H9" />
        </g>
      </Icon>
    </Art>
  );
}
