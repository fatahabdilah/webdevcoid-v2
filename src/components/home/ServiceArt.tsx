import { getImageProps } from "next/image";
import { useId, type ReactNode } from "react";
import { brand, mix } from "@/lib/brand";

/*
 * Vector illustrations for the service bentos (Services.tsx). Compositions after Hostinger's product art
 * (a site or app mock-up with white UI cards and chips floating over it, a cursor on the call to action),
 * drawn in webdev.co.id's own style: a pale brand-blue glass panel, white cards with soft shadows, brand
 * gradient buttons, Geist, and the site's cursor. Photos are the studio's own (next/image optimised).
 * Canvas sizes are fixed per bento.
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

function Art({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-hidden className="block h-auto w-full shrink-0" fontWeight={400}>
      {children}
    </svg>
  );
}

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
  shirt: (
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
  ),
  cup: <path d="M10 2v2M14 2v2M6 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />,
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
  refresh: <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5" />,
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

/** The pale brand-blue glass panel every illustration sits on. */
function Panel({ id, w, h }: { id: Ids; w: number; h: number }) {
  return (
    <>
      <rect width={w} height={h} rx="26" fill={url(id("panel"))} />
      <rect width={w} height={h} rx="26" fill={url(id("sheen"))} />
      <rect x="1" y="1" width={w - 2} height={h - 2} rx="25" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="2" />
    </>
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

/** Browser chrome inside a card: three dots and an address pill. */
function BrowserBar({ x, y, w, address }: { x: number; y: number; w: number; address: string }) {
  const pill = Math.min(220, w * 0.42);
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 22 + i * 16} cy={y + 22} r="5" fill={tint(0.7)} />
      ))}
      <rect x={x + w / 2 - pill / 2} y={y + 10} width={pill} height={24} rx={12} fill={SOFT} />
      <Icon cx={x + w / 2 - pill / 2 + 16} cy={y + 22} size={11}>
        <g {...stroke(SUBTLE, 2.4)}>{glyph.lock}</g>
      </Icon>
      <text x={x + w / 2 + 6} y={y + 27} fontSize="13" fill={MUTED} textAnchor="middle">
        {address}
      </text>
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

/** The site cursor's arrow (black with a white rim), tip at (x, y). */
function Pointer({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <path
      d="M0 0V21.5L5.6 16.4L9.4 25L13 23.4L9.3 15H16.6Z"
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill={INK}
      stroke="#fff"
      strokeWidth={1.8}
      strokeLinejoin="round"
      style={{ filter: "drop-shadow(0 3px 4px rgb(0 0 0 / 0.25))" }}
    />
  );
}

/** A rounded "text line" placeholder. */
function Bar({ x, y, w, h = 8, fill = tint(0.72) }: { x: number; y: number; w: number; h?: number; fill?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />;
}

/* ------------------------------------------------------------------ Company Profile (750 × 780) */

export function CompanyProfileArt() {
  const id = useIds();
  return (
    <Art width={750} height={780}>
      <Defs id={id} />
      <clipPath id={id("hero")}>
        <rect x="80" y="166" width="590" height="250" rx="14" />
      </clipPath>
      <Panel id={id} w={750} h={780} />

      {/* The company's site */}
      <Card id={id} x={56} y={64} w={638} h={478} r={22} />
      <BrowserBar x={56} y={70} w={638} address="bisnismu.co.id" />
      <path d="M56 112H694" stroke={EDGE} strokeWidth="1.5" />
      <rect x="80" y="128" width="22" height="22" rx="6" fill={url(id("blue"))} />
      <text x="110" y="145" fontSize="16" fontWeight={600} fill={INK}>
        Bisnismu
      </text>
      {[
        ["Tentang", 438],
        ["Layanan", 512],
        ["Kontak", 590],
      ].map(([label, x]) => (
        <text key={label} x={x} y="144" fontSize="13" fill={MUTED}>
          {label}
        </text>
      ))}
      <image href={photo("/images/about.png", 640)} x="80" y="166" width="590" height="250" preserveAspectRatio="xMidYMid slice" clipPath={url(id("hero"))} />
      <rect x="80" y="166" width="590" height="250" rx="14" fill={url(id("fade"))} />
      <text x="104" y="296" fontSize="32" fontWeight={600} fill="#fff" letterSpacing="-0.6">
        Mitra tepercaya
      </text>
      <text x="104" y="334" fontSize="32" fontWeight={600} fill="#fff" letterSpacing="-0.6">
        untuk bisnismu.
      </text>
      <rect x="104" y="356" width="140" height="34" rx="17" fill="#fff" />
      <text x="174" y="378" fontSize="14" fontWeight={600} fill={INK} textAnchor="middle">
        Hubungi kami
      </text>
      {[80, 280, 480].map((x) => (
        <g key={x}>
          <rect x={x} y="432" width="190" height="88" rx="12" fill={SOFT} />
          <circle cx={x + 28} cy="460" r="13" fill={tint(0.74)} />
          <Bar x={x + 18} y={486} w={130} />
          <Bar x={x + 18} y={502} w={96} />
        </g>
      ))}

      {/* Contact form that sends to WhatsApp */}
      <Card id={id} x={430} y={410} w={290} h={250} />
      <text x="454" y="448" fontSize="20" fontWeight={600} fill={INK}>
        Kontak
      </text>
      <text x="454" y="470" fontSize="13" fill={MUTED}>
        Dibalas cepat lewat WhatsApp
      </text>
      {[
        ["Nama", 486],
        ["Kebutuhan website", 536],
      ].map(([label, y]) => (
        <g key={label}>
          <rect x="454" y={y} width="242" height="40" rx="10" fill="#fff" stroke={tint(0.76)} strokeWidth="1.5" />
          <text x="468" y={Number(y) + 25} fontSize="14" fill={SUBTLE}>
            {label}
          </text>
        </g>
      ))}
      <PillButton id={id} x={454} y={592} w={242} h={46} label="Kirim via WhatsApp" fs={15} whatsapp />
      <Pointer x={640} y={620} scale={1.15} />

      {/* Its pages, as loose tags */}
      <Chip id={id} x={40} y={588} label="Tentang" icon="users" fs={18} rotate={-6} />
      <Chip id={id} x={196} y={622} label="Layanan" icon="grid" fs={18} rotate={5} />
      <Chip id={id} x={34} y={672} label="Portfolio" icon="image" fs={18} rotate={3} />
      <Chip id={id} x={168} y={716} label="Muncul di Google" icon="search" fs={18} rotate={-5} />
    </Art>
  );
}

/* ------------------------------------------------------------------ Landing Page (648 × 400) */

export function LandingPageArt() {
  const id = useIds();
  return (
    <Art width={648} height={400}>
      <Defs id={id} />
      <Panel id={id} w={648} h={400} />

      {/* The one page, on a phone */}
      <rect x="48" y="34" width="200" height="420" rx="32" fill="#fff" filter={url(id("card"))} />
      <rect x="48.75" y="34.75" width="198.5" height="418.5" rx="31.25" fill="none" stroke={EDGE} strokeWidth="1.5" />
      <rect x="118" y="46" width="60" height="10" rx="5" fill={INK} />
      <rect x="66" y="68" width="16" height="16" rx="5" fill={url(id("blue"))} />
      <text x="88" y="81" fontSize="12" fontWeight={600} fill={INK}>
        bisnismu
      </text>
      <rect x="62" y="96" width="172" height="130" rx="14" fill={url(id("deep"))} />
      <Icon cx={148} cy={162} size={64}>
        <g {...stroke("#fff", 1.6)}>{glyph.bag}</g>
      </Icon>
      <rect x="186" y="106" width="38" height="20" rx="10" fill="#fff" />
      <text x="205" y="120" fontSize="11" fontWeight={600} fill={BLUE} textAnchor="middle">
        Baru
      </text>
      <text x="66" y="252" fontSize="17" fontWeight={700} fill={INK} letterSpacing="-0.3">
        Produk andalan,
      </text>
      <text x="66" y="274" fontSize="17" fontWeight={700} fill={INK} letterSpacing="-0.3">
        siap dipesan.
      </text>
      <Bar x={66} y={286} w={150} h={7} />
      <PillButton id={id} x={66} y={304} w={164} h={36} label="Pesan sekarang" fs={14} />
      <Pointer x={196} y={326} />

      {/* Promo countdown */}
      <Card id={id} x={292} y={46} w={300} h={124} />
      <text x="314" y="80" fontSize="16" fontWeight={600} fill={INK}>
        Promo minggu ini
      </text>
      {[
        ["02", "hari"],
        ["14", "jam"],
        ["36", "menit"],
      ].map(([n, label], i) => (
        <g key={label}>
          <rect x={314 + i * 68} y="96" width="58" height="54" rx="12" fill={SOFT} />
          <text x={343 + i * 68} y="124" fontSize="21" fontWeight={600} fill={BLUE} textAnchor="middle">
            {n}
          </text>
          <text x={343 + i * 68} y="142" fontSize="11" fill={MUTED} textAnchor="middle">
            {label}
          </text>
        </g>
      ))}

      {/* What the page brings in */}
      <Chip id={id} x={320} y={198} label="Pesanan baru masuk" icon="bag" rotate={-3} />
      <Chip id={id} x={292} y={262} label="Ramai dari Instagram" icon="megaphone" rotate={4} />
      <Chip id={id} x={344} y={324} label="Langsung chat WhatsApp" icon="chat" rotate={-2} />
    </Art>
  );
}

/* ------------------------------------------------------------------ Online Store (580 × 400) */

export function OnlineStoreArt() {
  const id = useIds();
  const items: [string, string, GlyphName, number][] = [
    ["Kemeja Linen", "Rp189.000", "shirt", 0.6],
    ["Tumbler", "Rp95.000", "cup", 0.45],
  ];
  return (
    <Art width={580} height={400}>
      <Defs id={id} />
      <Panel id={id} w={580} h={400} />

      {/* Product */}
      <Card id={id} x={36} y={52} w={250} h={380} />
      <rect x="50" y="66" width="222" height="182" rx="14" fill={url(id("deep"))} />
      <Icon cx={161} cy={157} size={92}>
        <g {...stroke("#fff", 1.4)}>{glyph.shirt}</g>
      </Icon>
      <rect x="62" y="78" width="66" height="22" rx="11" fill="#fff" />
      <text x="95" y="93" fontSize="11" fontWeight={600} fill={BLUE} textAnchor="middle">
        Terlaris
      </text>
      <text x="52" y="280" fontSize="18" fontWeight={600} fill={INK}>
        Kemeja Linen
      </text>
      <text x="52" y="304" fontSize="16" fontWeight={600} fill={BLUE}>
        Rp189.000
      </text>
      {[NAVY, BLUE, tint(0.7)].map((c, i) => (
        <circle key={c} cx={60 + i * 22} cy="326" r="7" fill={c} stroke="#fff" strokeWidth="2" />
      ))}
      <rect x="52" y="344" width="218" height="40" rx="20" fill={SOFT} stroke={EDGE} strokeWidth="1.5" />
      <text x="161" y="369" fontSize="14" fontWeight={600} fill={BLUE} textAnchor="middle">
        Tambah ke keranjang
      </text>

      {/* Cart → WhatsApp */}
      <Card id={id} x={306} y={110} w={244} h={232} />
      <text x="326" y="142" fontSize="17" fontWeight={600} fill={INK}>
        Keranjang
      </text>
      <text x="530" y="142" fontSize="13" fill={MUTED} textAnchor="end">
        2 produk
      </text>
      {items.map(([name, price, icon, t], i) => {
        const y = 158 + i * 54;
        return (
          <g key={name}>
            <rect x="326" y={y} width="44" height="44" rx="10" fill={tint(t)} />
            <Icon cx={348} cy={y + 22} size={24}>
              <g {...stroke("#fff", 2)}>{glyph[icon]}</g>
            </Icon>
            <text x="382" y={y + 18} fontSize="13" fontWeight={600} fill={INK}>
              {name}
            </text>
            <text x="382" y={y + 36} fontSize="13" fill={MUTED}>
              {price}
            </text>
          </g>
        );
      })}
      <path d="M326 272H530" stroke={EDGE} strokeWidth="1.5" />
      <PillButton id={id} x={326} y={286} w={204} h={40} label="Pesan via WhatsApp" fs={13} whatsapp />
      <Pointer x={496} y={312} />

      <Chip id={id} x={318} y={44} label="Pesanan baru masuk" icon="bag" fs={15} rotate={-2} />
    </Art>
  );
}

/* ------------------------------------------------------------------ Web App (600 × 380) */

export function WebAppArt() {
  const id = useIds();
  const rows: [string, string, string, string, number][] = [
    ["Rina", "Kemeja Linen", "Rp189.000", "Diproses", 0],
    ["Dimas", "Tumbler", "Rp95.000", "Dikirim", 1],
    ["Sari", "Paket Hampers", "Rp250.000", "Selesai", 2],
    ["Budi", "Totebag", "Rp120.000", "Diproses", 0],
  ];
  const status = [
    { fill: tint(0.86), text: BLUE },
    { fill: tint(0.68), text: NAVY },
    { fill: BLUE, text: "#fff" },
  ];
  return (
    <Art width={600} height={380}>
      <Defs id={id} />
      <Panel id={id} w={600} h={380} />

      {/* Orders table */}
      <Card id={id} x={32} y={36} w={536} h={380} />
      <text x="54" y="74" fontSize="18" fontWeight={600} fill={INK}>
        Pesanan
      </text>
      {["Semua", "Diproses", "Selesai"].map((tab, i) => (
        <g key={tab}>
          {i === 0 && <rect x="372" y="56" width="58" height="26" rx="13" fill={SOFT} />}
          <text x={401 + i * 66} y="74" fontSize="12" fontWeight={i === 0 ? 600 : 400} fill={i === 0 ? BLUE : MUTED} textAnchor="middle">
            {tab}
          </text>
        </g>
      ))}
      {[
        ["Pelanggan", 54],
        ["Produk", 200],
        ["Total", 340],
        ["Status", 452],
      ].map(([h, x]) => (
        <text key={h} x={x} y="108" fontSize="12" fill={SUBTLE}>
          {h}
        </text>
      ))}
      <path d="M48 118H552" stroke={EDGE} strokeWidth="1.5" />
      {rows.map(([name, product, total, label, s], i) => {
        const y = 122 + i * 48;
        return (
          <g key={name}>
            {i === 1 && <rect x="44" y={y} width="512" height="44" rx="10" fill={SOFT} />}
            <circle cx="66" cy={y + 22} r="12" fill={tint(0.4 + i * 0.12)} />
            <text x="66" y={y + 26} fontSize="11" fontWeight={600} fill="#fff" textAnchor="middle">
              {name[0]}
            </text>
            <text x="86" y={y + 27} fontSize="14" fill={INK}>
              {name}
            </text>
            <text x="200" y={y + 27} fontSize="13" fill={MUTED}>
              {product}
            </text>
            <text x="340" y={y + 27} fontSize="13" fill={INK}>
              {total}
            </text>
            <rect x="452" y={y + 9} width="78" height="26" rx="13" fill={status[s].fill} />
            <text x="491" y={y + 26} fontSize="12" fontWeight={600} fill={status[s].text} textAnchor="middle">
              {label}
            </text>
          </g>
        );
      })}
      <Pointer x={514} y={186} />

      {/* Sales trend */}
      <Card id={id} x={420} y={262} w={156} h={108} r={18} />
      <text x="436" y="290" fontSize="13" fill={MUTED}>
        Penjualan
      </text>
      <rect x="518" y="274" width="46" height="22" rx="11" fill={SOFT} />
      <text x="541" y="289" fontSize="12" fontWeight={600} fill={BLUE} textAnchor="middle">
        Naik
      </text>
      <path d="M436 352C448 349 454 342 466 343S482 334 494 333 514 324 524 320 548 312 560 310V358H436Z" fill={url(id("area"))} />
      <path d="M436 352C448 349 454 342 466 343S482 334 494 333 514 324 524 320 548 312 560 310" {...stroke(BLUE, 3)} />
    </Art>
  );
}

/* ------------------------------------------------------------------ Maintenance (600 × 400) */

export function MaintenanceArt() {
  const id = useIds();
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <Art width={600} height={400}>
      <Defs id={id} />
      <clipPath id={id("site")}>
        <rect x="48" y="84" width="356" height="236" rx="10" />
      </clipPath>
      <Panel id={id} w={600} h={400} />

      {/* The client's live site */}
      <Card id={id} x={36} y={40} w={380} h={292} r={18} />
      <BrowserBar x={36} y={40} w={380} address="bisnismu.id" />
      <image href={photo("/images/portfolio/arifsyauqi.jpg", 480)} x="48" y="84" width="356" height="236" preserveAspectRatio="xMidYMin slice" clipPath={url(id("site"))} />

      {/* This month's maintenance */}
      <Card id={id} x={300} y={150} w={270} h={110} />
      <circle cx="352" cy="205" r={r} fill="none" stroke={SOFT} strokeWidth="8" />
      <circle cx="352" cy="205" r={r} fill="none" stroke={BLUE} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${c * 0.72} ${c}`} transform="rotate(-90 352 205)" />
      <Icon cx={352} cy={205} size={22}>
        <g {...stroke(BLUE, 2.4)}>{glyph.refresh}</g>
      </Icon>
      <text x="398" y="198" fontSize="16" fontWeight={600} fill={INK}>
        Backup bulanan
      </text>
      <text x="398" y="220" fontSize="13" fill={MUTED}>
        Sedang berjalan…
      </text>

      <Chip id={id} x={432} y={70} label="Tiap bulan" icon="calendar" fs={15} rotate={4} />
      <Chip id={id} x={40} y={300} label="Tampilan diperbarui" icon="check" rotate={-3} />
      <Chip id={id} x={96} y={352} label="Error diperbaiki" icon="check" rotate={3} />
      <Chip id={id} x={330} y={296} label="Keamanan dicek" icon="shield" rotate={-4} />
    </Art>
  );
}
