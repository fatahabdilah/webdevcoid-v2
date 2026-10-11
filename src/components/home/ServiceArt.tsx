import { useId, type ReactNode } from "react";
import { brand, mix } from "@/lib/brand";

/*
 * Vector illustrations for the service bentos (Services.tsx), one per service, each showing what the
 * service actually is: a multi-page company site, a one-page promo, a phone catalogue, a dashboard and a
 * monthly maintenance checklist. Brand blues only; small UI copy in Indonesian. The canvas sizes are fixed
 * per bento, so the card layouts don't move.
 */

const BLUE = brand.blue;
const LIGHT = brand.light;
const NAVY = brand.navy;
/** Light blue on its way to white: the brand gradient's lightest stretch, for tints. */
const tint = (t: number) => mix(LIGHT, brand.white, t);
const PALE = tint(0.84);
const LINE = tint(0.62);
const EDGE = tint(0.86);
const SOFT = tint(0.94);
const INK = "#1a1a1a"; // grey-01
const MUTED = "#525252"; // grey-03

/** webdev.co.id mark (see LogoMark in icons.tsx), 107 × 124.852 units. */
const LOGO =
  "M0 30.8798V93.9535L11.6386 100.674V24.1595L0 30.8798ZM20.9307 18.8095V106.043L32.5693 112.763V12.0891L20.9307 18.8095ZM41.8614 6.72035V118.132L53.5 124.852V0L41.8614 6.72035ZM62.7921 5.36877V18.8095L95.3614 37.6002V87.2332L62.7921 106.043V119.483L107 93.9535V30.8798L62.7921 5.36877Z";

/** Ids unique to this instance, so gradients and filters never collide (some bentos render twice). */
function useIds() {
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (name: string) => `${base}-${name}`;
}
type Ids = ReturnType<typeof useIds>;
const url = (id: string) => `url(#${id})`;

function Art({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-hidden className="block h-auto w-full shrink-0 overflow-visible" fontWeight={400}>
      {children}
    </svg>
  );
}

/** Gradients and shadows shared by every illustration. */
function SharedDefs({ id }: { id: Ids }) {
  return (
    <>
      <linearGradient id={id("blue")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={LIGHT} />
        <stop offset="1" stopColor={BLUE} />
      </linearGradient>
      <linearGradient id={id("deep")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={BLUE} />
        <stop offset="1" stopColor={NAVY} />
      </linearGradient>
      <linearGradient id={id("edge")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={LIGHT} />
        <stop offset=".5" stopColor={BLUE} />
        <stop offset="1" stopColor={NAVY} />
      </linearGradient>
      <filter id={id("card")} x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor={NAVY} floodOpacity=".1" />
      </filter>
      <filter id={id("lift")} x="-50%" y="-50%" width="200%" height="220%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor={BLUE} floodOpacity=".28" />
      </filter>
    </>
  );
}

/** A 24-unit icon (Lucide geometry), centred on (cx, cy) at the given size. */
function Icon({ cx, cy, size, children }: { cx: number; cy: number; size: number; children: ReactNode }) {
  const s = size / 24;
  return <g transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${s})`}>{children}</g>;
}

const stroke = (color: string, width = 2) =>
  ({ fill: "none", stroke: color, strokeWidth: width, strokeLinecap: "round", strokeLinejoin: "round" }) as const;

/** A rounded "text line" placeholder. */
function Bar({ x, y, w, h = 9, fill = LINE, opacity }: { x: number; y: number; w: number; h?: number; fill?: string; opacity?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} opacity={opacity} />;
}

/** Browser window: white card with the three dots and an address pill. Content is drawn by the caller. */
function Browser({ id, x, y, w, h, address, r = 22 }: { id: Ids; x: number; y: number; w: number; h: number; address: string; r?: number }) {
  const pillW = Math.min(240, w * 0.46);
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill="#fff" filter={url(id("card"))} />
      <rect x={x + 0.75} y={y + 0.75} width={w - 1.5} height={h - 1.5} rx={r - 0.75} fill="none" stroke={EDGE} strokeWidth="1.5" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 24 + i * 17} cy={y + 22} r="5" fill={tint(0.72)} />
      ))}
      <rect x={cx - pillW / 2} y={y + 11} width={pillW} height={22} rx={11} fill={SOFT} />
      <Icon cx={cx - pillW / 2 + 16} cy={y + 22} size={11}>
        <g {...stroke(MUTED, 2.4)}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </g>
      </Icon>
      <text x={cx + 6} y={y + 27} fontSize="13" fill={MUTED} textAnchor="middle">
        {address}
      </text>
      <path d={`M${x} ${y + 44}H${x + w}`} stroke={EDGE} strokeWidth="1.5" />
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
      strokeWidth="1.8"
      strokeLinejoin="round"
      style={{ filter: "drop-shadow(0 3px 4px rgb(0 0 0 / 0.25))" }}
    />
  );
}

/** Lucide glyphs used inside tiles (24-unit geometry, stroked). */
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
  chat: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
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
  box: (
    <>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12M3.3 7l7.7 4.73a2 2 0 0 0 2 0L20.7 7M7.5 4.27l9 5.15" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  trend: <path d="m22 7-8.5 8.5-5-5L2 17M16 7h6v6" />,
  building: (
    <>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4" />
    </>
  ),
};

/** Blue gradient tile with a white glyph (the illustrations' "app icon"). */
function GlyphTile({ id, cx, cy, size, icon, r }: { id: Ids; cx: number; cy: number; size: number; icon: keyof typeof glyph; r?: number }) {
  return (
    <g>
      <rect x={cx - size / 2} y={cy - size / 2} width={size} height={size} rx={r ?? size * 0.28} fill={url(id("blue"))} filter={url(id("lift"))} />
      <Icon cx={cx} cy={cy} size={size * 0.5}>
        <g {...stroke("#fff", 2)}>{glyph[icon]}</g>
      </Icon>
    </g>
  );
}

/* ------------------------------------------------------------------ Company Profile (750 × 780) */

/** A page of the company site in the sitemap: title, glyph tile and a wireframe of its content. */
function PageCard({ id, x, y, title, icon, children }: { id: Ids; x: number; y: number; title: string; icon: keyof typeof glyph; children: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width="210" height="190" rx="22" fill="#fff" filter={url(id("card"))} />
      <rect x={x + 0.75} y={y + 0.75} width="208.5" height="188.5" rx="21.25" fill="none" stroke={EDGE} strokeWidth="1.5" />
      <text x={x + 20} y={y + 37} fontSize="20" fontWeight={600} fill={INK}>
        {title}
      </text>
      <GlyphTile id={id} cx={x + 176} cy={y + 31} size={32} icon={icon} r={10} />
      {children}
    </g>
  );
}

export function CompanyProfileArt() {
  const id = useIds();
  const cols = [10, 270, 530];
  const mid = (x: number) => x + 105;
  return (
    <Art width={750} height={780}>
      <defs>
        <SharedDefs id={id} />
        <linearGradient id={id("hero")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={LIGHT} />
          <stop offset=".6" stopColor={BLUE} />
          <stop offset="1" stopColor={NAVY} />
        </linearGradient>
      </defs>

      {/* Sitemap lines: home → pages → more pages */}
      <g {...stroke(LINE, 3)}>
        <path d={`M375 262V300M${mid(cols[0])} 336V318Q${mid(cols[0])} 300 ${mid(cols[0]) + 18} 300H${mid(cols[2]) - 18}Q${mid(cols[2])} 300 ${mid(cols[2])} 318V336M375 300V336`} />
      </g>
      <g {...stroke(LINE, 3)} strokeDasharray="8 9">
        {cols.map((x) => (
          <path key={x} d={`M${mid(x)} 526V570`} />
        ))}
      </g>
      <g {...stroke(BLUE, 3.5)}>
        <path d="M200 300H232M518 300H550M375 312V326" />
      </g>

      {/* Home page */}
      <Browser id={id} x={135} y={4} w={480} h={258} address="bisnismu.co.id" />
      <rect x="157" y="60" width="22" height="22" rx="7" fill={url(id("blue"))} />
      <Bar x={187} y={66} w={64} h={10} fill={INK} opacity={0.8} />
      {[402, 446, 490].map((x) => (
        <Bar key={x} x={x} y={67} w={34} h={8} fill={tint(0.74)} />
      ))}
      <rect x="538" y="60" width="58" height="22" rx="11" fill={url(id("blue"))} />
      <rect x="155" y="94" width="440" height="104" rx="16" fill={url(id("hero"))} />
      <Bar x={177} y={118} w={190} h={14} fill="#fff" />
      <Bar x={177} y={140} w={140} h={14} fill="#fff" opacity={0.9} />
      <Bar x={177} y={166} w={160} h={8} fill="#fff" opacity={0.55} />
      <Icon cx={530} cy={146} size={70}>
        <g {...stroke("#fff", 1.6)} opacity=".95">
          {glyph.building}
        </g>
      </Icon>
      {[155, 305, 455].map((x) => (
        <g key={x}>
          <rect x={x} y="210" width="140" height="38" rx="10" fill={SOFT} />
          <circle cx={x + 20} cy="229" r="7" fill={LIGHT} />
          <Bar x={x + 36} y={225} w={84} h={8} fill={tint(0.7)} />
        </g>
      ))}

      {/* Pages */}
      <PageCard id={id} x={cols[0]} y={336} title="Tentang" icon="users">
        <rect x={cols[0] + 20} y="392" width="170" height="62" rx="12" fill={PALE} />
        <path d={`M${cols[0] + 40} 446l28-28 20 18 16-13 30 23Z`} fill={tint(0.55)} />
        <circle cx={cols[0] + 160} cy="410" r="8" fill="#fff" />
        <Bar x={cols[0] + 20} y={468} w={170} />
        <Bar x={cols[0] + 20} y={484} w={150} />
        <Bar x={cols[0] + 20} y={500} w={110} />
      </PageCard>
      <PageCard id={id} x={cols[1]} y={336} title="Layanan" icon="grid">
        {[0, 1].flatMap((r) =>
          [0, 1].map((c) => (
            <g key={`${r}-${c}`}>
              <rect x={cols[1] + 20 + c * 88} y={392 + r * 60} width="82" height="52" rx="12" fill={SOFT} stroke={EDGE} strokeWidth="1.5" />
              <circle cx={cols[1] + 38 + c * 88} cy={409 + r * 60} r="7" fill={r === c ? BLUE : LIGHT} />
              <Bar x={cols[1] + 32 + c * 88} y={424 + r * 60} w={52} h={7} fill={tint(0.68)} />
            </g>
          )),
        )}
      </PageCard>
      <PageCard id={id} x={cols[2]} y={336} title="Kontak" icon="chat">
        {[392, 426].map((y, i) => (
          <g key={y}>
            <rect x={cols[2] + 20} y={y} width="170" height="28" rx="9" fill="#fff" stroke={tint(0.78)} strokeWidth="1.5" />
            <Bar x={cols[2] + 32} y={y + 10} w={i ? 96 : 70} h={8} fill={tint(0.78)} />
          </g>
        ))}
        <rect x={cols[2] + 20} y="466" width="170" height="34" rx="17" fill={url(id("blue"))} filter={url(id("lift"))} />
        <text x={mid(cols[2])} y="488" fontSize="13" fontWeight={500} fill="#fff" textAnchor="middle">
          Kirim via WhatsApp
        </text>
      </PageCard>

      {/* More pages (up to six), still to be designed */}
      {[cols[0], cols[1]].map((x, i) => (
        <g key={x} opacity=".75">
          <rect x={x + 1} y="571" width="208" height="188" rx="21" fill="#fff" fillOpacity=".55" stroke={LINE} strokeWidth="2" strokeDasharray="9 8" />
          <text x={x + 20} y="609" fontSize="20" fontWeight={600} fill={MUTED}>
            {i ? "Galeri" : "Portfolio"}
          </text>
          <circle cx={x + 174} cy="602" r="17" fill={PALE} />
          <Icon cx={x + 174} cy={602} size={18}>
            <g {...stroke(BLUE, 2.4)}>{glyph.plus}</g>
          </Icon>
          <rect x={x + 20} y="630" width="80" height="58" rx="12" fill={SOFT} />
          <rect x={x + 110} y="630" width="80" height="58" rx="12" fill={SOFT} />
          <Bar x={x + 20} y={704} w={150} fill={tint(0.8)} />
          <Bar x={x + 20} y={722} w={110} fill={tint(0.8)} />
        </g>
      ))}

      {/* Found in search (SEO) */}
      <g>
        <rect x={cols[2]} y="570" width="210" height="190" rx="22" fill="#fff" filter={url(id("card"))} />
        <rect x={cols[2] + 0.75} y="570.75" width="208.5" height="188.5" rx="21.25" fill="none" stroke={EDGE} strokeWidth="1.5" />
        <rect x={cols[2] + 16} y="588" width="178" height="34" rx="17" fill={SOFT} stroke={EDGE} strokeWidth="1.5" />
        <Icon cx={cols[2] + 36} cy={605} size={16}>
          <g {...stroke(MUTED, 2.4)}>{glyph.search}</g>
        </Icon>
        <Bar x={cols[2] + 52} y={601} w={96} h={8} fill={tint(0.7)} />
        <rect x={cols[2] + 12} y="636" width="186" height="108" rx="14" fill={PALE} fillOpacity=".55" stroke={tint(0.75)} strokeWidth="1.5" />
        <circle cx={cols[2] + 32} cy="660" r="9" fill={url(id("blue"))} />
        <text x={cols[2] + 48} y="665" fontSize="13" fill={MUTED}>
          bisnismu.co.id
        </text>
        <Bar x={cols[2] + 24} y={682} w={150} h={11} fill={BLUE} />
        <Bar x={cols[2] + 24} y={704} w={160} h={7} fill={tint(0.7)} />
        <Bar x={cols[2] + 24} y={719} w={120} h={7} fill={tint(0.7)} />
      </g>
    </Art>
  );
}

/* ------------------------------------------------------------------ Landing Page (648 × 288) */

export function LandingPageArt() {
  const id = useIds();
  return (
    <Art width={648} height={288}>
      <defs>
        <SharedDefs id={id} />
        <radialGradient id={id("spot")} cx=".5" cy=".45" r=".6">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Browser id={id} x={4} y={4} w={640} h={280} address="bisnismu.id/promo" />

      {/* Navigation */}
      <rect x="28" y="60" width="20" height="20" rx="6" fill={url(id("blue"))} />
      <Bar x={56} y={65} w={56} h={10} fill={INK} opacity={0.8} />
      {[392, 438].map((x) => (
        <Bar key={x} x={x} y={66} w={34} h={8} fill={tint(0.74)} />
      ))}
      <rect x="486" y="59" width="110" height="22" rx="11" fill="none" stroke={tint(0.7)} strokeWidth="1.5" />
      <Bar x={510} y={66} w={62} h={8} fill={tint(0.7)} />

      {/* Offer: one message, one button */}
      <rect x="28" y="96" width="132" height="26" rx="13" fill={PALE} />
      <text x="94" y="114" fontSize="13" fontWeight={500} fill={BLUE} textAnchor="middle">
        Promo minggu ini
      </text>
      <text x="28" y="158" fontSize="30" fontWeight={600} fill={INK} letterSpacing="-0.6">
        Produk andalan,
      </text>
      <text x="28" y="194" fontSize="30" fontWeight={600} fill={INK} letterSpacing="-0.6">
        siap dipesan.
      </text>
      <Bar x={28} y={210} w={220} h={8} fill={tint(0.74)} />
      <rect x="28" y="232" width="158" height="36" rx="18" fill={url(id("blue"))} filter={url(id("lift"))} />
      <text x="107" y="255" fontSize="14" fontWeight={500} fill="#fff" textAnchor="middle">
        Pesan sekarang
      </text>
      <Pointer x={164} y={250} />

      {/* Product */}
      <rect x="330" y="96" width="282" height="174" rx="18" fill={url(id("blue"))} />
      <circle cx="471" cy="183" r="88" fill={url(id("spot"))} />
      <Icon cx={471} cy={182} size={92}>
        <g {...stroke("#fff", 1.5)}>{glyph.bag}</g>
      </Icon>
      <g>
        <circle cx="574" cy="132" r="26" fill="#fff" filter={url(id("card"))} />
        <text x="574" y="137" fontSize="14" fontWeight={600} fill={BLUE} textAnchor="middle">
          Baru
        </text>
      </g>
      <path d="M370 126l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="#fff" opacity=".8" />

      {/* One long page: a scrollbar */}
      <rect x="628" y="96" width="6" height="174" rx="3" fill={SOFT} />
      <rect x="628" y="96" width="6" height="58" rx="3" fill={tint(0.66)} />
    </Art>
  );
}

/* ------------------------------------------------------------------ Online Store (580 × 367) */

const productTones = [
  [LIGHT, BLUE],
  [tint(0.55), LIGHT],
  [BLUE, NAVY],
  [tint(0.7), tint(0.35)],
] as const;
const products: (keyof typeof glyph)[] = ["bag", "shirt", "cup", "box"];

/** Product photo stand-in: a tinted tile with a white product glyph. */
function ProductImage({ id, x, y, w, h, i }: { id: Ids; x: number; y: number; w: number; h: number; i: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={Math.min(14, w * 0.16)} fill={url(id(`tone${i % 4}`))} />
      <Icon cx={x + w / 2} cy={y + h / 2} size={Math.min(w, h) * 0.52}>
        <g {...stroke("#fff", 1.8)}>{glyph[products[i % 4]]}</g>
      </Icon>
    </g>
  );
}

function SideProduct({ id, x, y, w, h, i, opacity }: { id: Ids; x: number; y: number; w: number; h: number; i: number; opacity: number }) {
  const pad = w * 0.08;
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx="24" fill="#fff" />
      <rect x={x + 0.75} y={y + 0.75} width={w - 1.5} height={h - 1.5} rx="23.25" fill="none" stroke={EDGE} strokeWidth="1.5" />
      <ProductImage id={id} x={x + pad} y={y + pad} w={w - pad * 2} h={h * 0.52} i={i} />
      <Bar x={x + pad} y={y + h * 0.52 + pad + 14} w={w * 0.56} h={9} fill={INK} opacity={0.7} />
      <Bar x={x + pad} y={y + h * 0.52 + pad + 32} w={w * 0.36} h={9} fill={BLUE} />
      <circle cx={x + w - pad - 13} cy={y + h * 0.52 + pad + 32} r="13" fill={url(id("blue"))} />
      <Icon cx={x + w - pad - 13} cy={y + h * 0.52 + pad + 32} size={14}>
        <g {...stroke("#fff", 3)}>{glyph.plus}</g>
      </Icon>
    </g>
  );
}

export function OnlineStoreArt() {
  const id = useIds();
  const tiles = [
    [210, 114],
    [294, 114],
    [210, 194],
    [294, 194],
  ] as const;
  return (
    <Art width={580} height={367}>
      <defs>
        <SharedDefs id={id} />
        {productTones.map(([a, b], i) => (
          <linearGradient key={i} id={id(`tone${i}`)} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
        ))}
      </defs>

      <SideProduct id={id} x={2} y={98} w={160} h={190} i={1} opacity={0.45} />
      <SideProduct id={id} x={418} y={98} w={160} h={190} i={3} opacity={0.45} />
      <SideProduct id={id} x={62} y={72} w={168} h={228} i={2} opacity={0.8} />
      <SideProduct id={id} x={350} y={72} w={168} h={228} i={0} opacity={0.8} />

      {/* Phone with the catalogue */}
      <rect x="186" y="6" width="208" height="355" rx="38" fill={url(id("edge"))} filter={url(id("lift"))} />
      <rect x="193" y="13" width="194" height="341" rx="32" fill="#fff" />
      <rect x="262" y="22" width="56" height="12" rx="6" fill={INK} />
      <text x="210" y="64" fontSize="17" fontWeight={600} fill={INK}>
        Katalog
      </text>
      <Icon cx={360} cy={58} size={20}>
        <g {...stroke(INK, 2)}>{glyph.bag}</g>
      </Icon>
      <circle cx="369" cy="49" r="6" fill={BLUE} stroke="#fff" strokeWidth="2" />
      <rect x="210" y="78" width="160" height="26" rx="13" fill={SOFT} />
      <Icon cx={225} cy={91} size={12}>
        <g {...stroke(MUTED, 2.6)}>{glyph.search}</g>
      </Icon>
      <Bar x={238} y={87} w={70} h={7} fill={tint(0.72)} />
      {tiles.map(([x, y], i) => (
        <g key={i}>
          <ProductImage id={id} x={x} y={y} w={76} h={50} i={i} />
          <Bar x={x + 2} y={y + 57} w={54} h={6} fill={INK} opacity={0.7} />
          <Bar x={x + 2} y={y + 68} w={34} h={6} fill={BLUE} />
        </g>
      ))}
      <rect x="210" y="276" width="160" height="28" rx="14" fill={url(id("blue"))} />
      <text x="290" y="294.5" fontSize="12" fontWeight={500} fill="#fff" textAnchor="middle">
        Pesan via WhatsApp
      </text>
    </Art>
  );
}

/* ------------------------------------------------------------------ Web App (600 × 257) */

/** Sales line, rising to the right (Catmull-Rom through the points, as cubic Béziers). */
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
const salesPts: [number, number][] = [
  [104, 226], [130, 218], [152, 222], [176, 210], [198, 214], [222, 200], [246, 205], [270, 192], [292, 196],
  [316, 182], [340, 188], [362, 176], [386, 180], [410, 166], [434, 170], [458, 158], [482, 162], [506, 150], [530, 152], [552, 142],
];
const salesLine = smooth(salesPts);
const [lastX, lastY] = salesPts[salesPts.length - 1];

export function WebAppArt() {
  const id = useIds();
  const kpis = ["Pesanan", "Pengunjung", "Pelanggan"];
  return (
    <Art width={600} height={257}>
      <defs>
        <SharedDefs id={id} />
        <linearGradient id={id("side")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BLUE} />
          <stop offset="1" stopColor={NAVY} />
        </linearGradient>
        <linearGradient id={id("area")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LIGHT} stopOpacity=".5" />
          <stop offset="1" stopColor={LIGHT} stopOpacity="0" />
        </linearGradient>
        <clipPath id={id("win")}>
          <rect x="2" y="2" width="596" height="253" rx="18" />
        </clipPath>
      </defs>

      <rect x="2" y="2" width="596" height="253" rx="18" fill="#fff" filter={url(id("card"))} />
      <g clipPath={url(id("win"))}>
        {/* Sidebar */}
        <rect x="2" y="2" width="66" height="253" fill={url(id("side"))} />
        <path d={LOGO} fill="#fff" transform={`translate(${35 - (107 * 0.16) / 2} 20) scale(0.16)`} />
        <rect x="15" y="62" width="40" height="30" rx="10" fill="#fff" fillOpacity=".18" />
        <Icon cx={35} cy={77} size={16}>
          <g {...stroke("#fff", 2.4)}>{glyph.grid}</g>
        </Icon>
        {[118, 156, 194].map((y, i) => (
          <Icon key={y} cx={35} cy={y} size={16}>
            <g {...stroke("#fff", 2.4)} opacity=".5">
              {[glyph.bag, glyph.users, glyph.calendar][i]}
            </g>
          </Icon>
        ))}
      </g>
      <rect x="2.75" y="2.75" width="594.5" height="251.5" rx="17.25" fill="none" stroke={EDGE} strokeWidth="1.5" />

      {/* Header */}
      <text x="86" y="34" fontSize="17" fontWeight={600} fill={INK}>
        Dashboard
      </text>
      <rect x="430" y="17" width="118" height="24" rx="12" fill={SOFT} />
      <Icon cx={445} cy={29} size={11}>
        <g {...stroke(MUTED, 2.6)}>{glyph.search}</g>
      </Icon>
      <Bar x={456} y={25.5} w={54} h={7} fill={tint(0.72)} />
      <circle cx="570" cy="29" r="12" fill={url(id("blue"))} />

      {/* Summary cards */}
      {kpis.map((label, i) => {
        const x = 86 + i * 168;
        return (
          <g key={label}>
            <rect x={x} y="52" width="156" height="56" rx="13" fill={SOFT} stroke={EDGE} strokeWidth="1.5" />
            <text x={x + 14} y="74" fontSize="12" fill={MUTED}>
              {label}
            </text>
            <Bar x={x + 14} y={84} w={i === 1 ? 72 : 58} h={12} fill={INK} opacity={0.85} />
            <rect x={x + 112} y="80" width="32" height="18" rx="9" fill={PALE} />
            <Icon cx={x + 128} cy={89} size={12}>
              <g {...stroke(BLUE, 2.6)}>{glyph.trend}</g>
            </Icon>
          </g>
        );
      })}

      {/* Sales chart */}
      <rect x="86" y="118" width="492" height="125" rx="13" fill="#fff" stroke={EDGE} strokeWidth="1.5" />
      <text x="100" y="140" fontSize="13" fontWeight={500} fill={INK}>
        Penjualan
      </text>
      <g {...stroke(SOFT, 1.5)}>
        {[160, 192, 224].map((y) => (
          <path key={y} d={`M100 ${y}H564`} />
        ))}
      </g>
      <path d={`${salesLine} V232 H104 Z`} fill={url(id("area"))} />
      <path d={salesLine} {...stroke(url(id("edge")), 3.5)} />
      <path d={`M${lastX} ${lastY}V232`} {...stroke(LINE, 1.5)} strokeDasharray="4 5" />
      <circle cx={lastX} cy={lastY} r="7.5" fill={BLUE} stroke="#fff" strokeWidth="3" />
      <rect x="436" y="128" width="94" height="24" rx="12" fill="#fff" stroke={EDGE} strokeWidth="1.5" filter={url(id("card"))} />
      <Icon cx={452} cy={140} size={12}>
        <g {...stroke(BLUE, 2.6)}>{glyph.trend}</g>
      </Icon>
      <text x="492" y="144.5" fontSize="12" fontWeight={500} fill={NAVY} textAnchor="middle">
        Naik terus
      </text>
    </Art>
  );
}

/* ------------------------------------------------------------------ Maintenance (600 × 327) */

export function MaintenanceArt() {
  const id = useIds();
  const tasks = ["Perbarui tampilan", "Perbaiki error", "Backup & keamanan"];
  return (
    <Art width={600} height={327}>
      <defs>
        <SharedDefs id={id} />
        <radialGradient id={id("glow")}>
          <stop offset="0" stopColor={LIGHT} stopOpacity=".4" />
          <stop offset="1" stopColor={LIGHT} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Monthly checklist */}
      <Browser id={id} x={2} y={6} w={372} h={319} address="bisnismu.id" />
      <text x="24" y="80" fontSize="18" fontWeight={600} fill={INK}>
        Perawatan bulanan
      </text>
      {tasks.map((task, i) => {
        const y = 94 + i * 54;
        return (
          <g key={task}>
            <rect x="20" y={y} width="336" height="46" rx="14" fill={SOFT} stroke={EDGE} strokeWidth="1.5" />
            <circle cx="44" cy={y + 23} r="11" fill={url(id("blue"))} />
            <Icon cx={44} cy={y + 23} size={12}>
              <g {...stroke("#fff", 3.4)}>{glyph.check}</g>
            </Icon>
            <text x="64" y={y + 28} fontSize="15" fill={INK}>
              {task}
            </text>
            <rect x="272" y={y + 11} width="70" height="24" rx="12" fill={PALE} />
            <text x="307" y={y + 27.5} fontSize="12" fontWeight={500} fill={BLUE} textAnchor="middle">
              Selesai
            </text>
          </g>
        );
      })}

      {/* Kept up to date, every month */}
      <circle cx="492" cy="110" r="100" fill={url(id("glow"))} />
      <Icon cx={492} cy={110} size={156}>
        <g {...stroke(url(id("edge")), 0.85)}>
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5" />
        </g>
      </Icon>
      <circle cx="492" cy="110" r="45" fill={url(id("blue"))} filter={url(id("lift"))} />
      <circle cx="492" cy="110" r="43.5" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
      <Icon cx={492} cy={110} size={42}>
        <g {...stroke("#fff", 2)}>{glyph.wrench}</g>
      </Icon>
      <rect x="430" y="200" width="124" height="38" rx="19" fill="#fff" filter={url(id("card"))} />
      <rect x="430.75" y="200.75" width="122.5" height="36.5" rx="18.25" fill="none" stroke={EDGE} strokeWidth="1.5" />
      <Icon cx={455} cy={219} size={18}>
        <g {...stroke(BLUE, 2.2)}>{glyph.calendar}</g>
      </Icon>
      <text x="501" y="224" fontSize="14" fontWeight={500} fill={INK} textAnchor="middle">
        Tiap bulan
      </text>
    </Art>
  );
}
