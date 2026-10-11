import gsap from "gsap";
import { CUSTOM_CURSOR_QUERY, cursorPath } from "@/lib/cursorShape";
import { LOGO_MARK_D, LOGO_WORDMARK_D } from "@/lib/logoPaths";

/**
 * The intro film:
 * the logo is written on straight away over a drifting dither field while a camera chases the pen →
 * a scripted cursor (styled like the site cursor) clicks the logo → the logo becomes a window cut into
 * the dark veil and the camera zooms through it onto the page.
 */

type Pt = [number, number];

export type IntroElements = {
  root: HTMLElement;
  stage: HTMLElement;
  defs: SVGDefsElement;
  cam: SVGGElement;
  ink: SVGGElement;
  solid: SVGGElement;
  hole: SVGGElement;
  dither: HTMLCanvasElement;
  vignette: HTMLElement;
  cover: HTMLElement;
  cursor: HTMLElement;
  cursorShape: SVGPathElement;
  rings: HTMLElement[];
};

export type IntroCallbacks = {
  /** The window starts opening: the page may play its entrance. `handoff` is where the scripted cursor stopped. */
  onEnter: (handoff: { x: number; y: number } | null) => void;
  /** Fully done: the overlay can be removed. */
  onDone: () => void;
};

const CFG = {
  cell: 6, // dither grid spacing (CSS px)
  dot: 1, // dot size (CSS px)
  opacity: 0.3, // max dot opacity
};

/** Size of the finished logo (wide framing) relative to the stage; the write-on close-ups are unaffected. */
const WIDE_SCALE = 0.86;

const NS = "http://www.w3.org/2000/svg";
const lerp = (x: number, y: number, t: number) => x + (y - x) * t;
const lerpLog = (x: number, y: number, t: number) => Math.exp(lerp(Math.log(x), Math.log(y), t));
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function mk<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  parent?.appendChild(e);
  return e;
}

const PARTS = LOGO_MARK_D.match(/M[^M]+/g) ?? [];
const TEXT_D = LOGO_WORDMARK_D;

type Stroke = { el: SVGPathElement; len: number; p: number; set: () => void };
type Glyph = {
  key: string;
  d: string;
  parallel: boolean;
  strokes: Stroke[];
  len: number;
  el: SVGPathElement;
  t0: number;
  t1: number;
  hide: () => void;
  start: () => void;
  done: () => void;
};

export function runIntro(el: IntroElements, cb: IntroCallbacks): () => void {
  const main = document.querySelector("main");
  const cleanups: (() => void)[] = [];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);

  if (reducedMotion) {
    cb.onEnter(null);
    cb.onDone();
    return () => {};
  }

  // Window cut into the veil (shown at the click)
  el.hole.innerHTML = "";
  [...PARTS, TEXT_D].forEach((d) => mk("path", { d }, el.hole));

  // ================================================================ DITHER FIELD
  // Ordered-dither dots over a slow, domain-warped value-noise field. Every dot eases toward on/off at
  // its own pace, so dots bloom in and out smoothly instead of popping.
  const Dither = (() => {
    const cv = el.dither;
    const ctx = cv.getContext("2d")!;
    const sm = document.createElement("canvas");
    const sctx = sm.getContext("2d")!;
    const COARSE = 3;
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const RATES = [2.2, 3.4, 4.8, 6.5]; // per-dot fade speeds (1/s)
    const st = { I: 0, fade: 1, clear: 0 };
    let W = 0, H = 0, dpr = 1, pc = 2, cols = 0, rows = 0, ccols = 0, crows = 0;
    let logoW = 0; // the logo's CSS width (.intro-stage svg), measured so the cleared area follows it
    let img: ImageData, data: Uint8ClampedArray, alpha: Float32Array, thr: Float32Array, bright: Float32Array, rk: Uint8Array, coarse: Float32Array;
    let pattern: CanvasPattern | null = null;

    // value noise
    const P = new Uint8Array(512);
    {
      const p = [...Array(256).keys()];
      let s = 90210;
      const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 255; i > 0; i--) {
        const j = (r() * (i + 1)) | 0;
        [p[i], p[j]] = [p[j], p[i]];
      }
      for (let i = 0; i < 512; i++) P[i] = p[i & 255];
    }
    const q = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    function vnoise(x: number, y: number, z: number) {
      const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
      const u = q(x - X), v = q(y - Y), w = q(z - Z), xi = X & 255, yi = Y & 255, zi = Z & 255;
      const A = P[xi] + yi, B = P[xi + 1] + yi;
      const AA = P[A] + zi, AB = P[A + 1] + zi, BA = P[B] + zi, BB = P[B + 1] + zi;
      const l1 = lerp(lerp(P[AA], P[BA], u), lerp(P[AB], P[BB], u), v);
      const l2 = lerp(lerp(P[AA + 1], P[BA + 1], u), lerp(P[AB + 1], P[BB + 1], u), v);
      return lerp(l1, l2, w) / 255;
    }

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth;
      H = innerHeight;
      logoW = el.stage.querySelector("svg")?.clientWidth || Math.min(W * 0.6, 520);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      pc = Math.max(2, Math.round(CFG.cell * dpr));
      const pd = Math.max(1, Math.round(CFG.dot * dpr)), off = (pc - pd) >> 1;
      cols = Math.ceil(cv.width / pc) + 1;
      rows = Math.ceil(cv.height / pc) + 1;
      ccols = Math.ceil(cols / COARSE) + 2;
      crows = Math.ceil(rows / COARSE) + 2;
      sm.width = cols;
      sm.height = rows;
      img = sctx.createImageData(cols, rows);
      data = img.data;
      const n = cols * rows;
      alpha = new Float32Array(n);
      thr = new Float32Array(n);
      bright = new Float32Array(n);
      rk = new Uint8Array(n);
      coarse = new Float32Array(ccols * crows);
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          data[k * 4] = 243;
          data[k * 4 + 1] = 238;
          data[k * 4 + 2] = 230;
          thr[k] = Math.min(0.97, Math.max(0.04, ((BAYER[(j & 3) * 4 + (i & 3)] + 0.5) / 16) * 0.86 + 0.07 + (Math.random() - 0.5) * 0.2));
          bright[k] = 0.5 + Math.random() * 0.5;
          rk[k] = (Math.random() * RATES.length) | 0;
        }
      const pcv = document.createElement("canvas");
      pcv.width = pcv.height = pc;
      const pctx = pcv.getContext("2d")!;
      pctx.fillStyle = "#fff";
      pctx.fillRect(off, off, pd, pd);
      pattern = ctx.createPattern(pcv, "repeat");
    }

    function frame(time: number, dt: number) {
      const k = 0.0021, tt = time * 0.045, step = (COARSE * pc) / dpr;
      const lo = 0.72 - 0.34 * st.I;
      const lw = logoW * WIDE_SCALE, rx = lw * 0.58, ry = lw * 0.2; // clear the dots around the logo
      for (let cj = 0; cj < crows; cj++)
        for (let ci = 0; ci < ccols; ci++) {
          const x = ci * step, y = cj * step;
          const wp = vnoise(x * k * 0.55, y * k * 0.55, tt * 0.7 + 7.3) - 0.5;
          const f = 0.62 * vnoise(x * k + wp * 1.7, y * k - wp * 1.3, tt) + 0.38 * vnoise(x * k * 2.3 + 3.1, y * k * 2.3, tt * 1.6 + 2);
          let c = clamp01((f - lo) / 0.14);
          if (st.clear) {
            const dx = (x - W / 2) / rx, dy = (y - H / 2) / ry;
            c *= 1 - st.clear * (1 - smooth(0.55, 1.3, Math.sqrt(dx * dx + dy * dy)));
          }
          coarse[cj * ccols + ci] = c;
        }
      const fac = RATES.map((r) => 1 - Math.exp(-dt * r));
      const K = CFG.opacity * 255 * st.fade;
      for (let j = 0; j < rows; j++) {
        const gy = j / COARSE, j0 = gy | 0, ty = gy - j0, r0 = j0 * ccols, r1 = r0 + ccols;
        for (let i = 0; i < cols; i++) {
          const gx = i / COARSE, i0 = gx | 0, tx = gx - i0;
          const a = coarse[r0 + i0], b = coarse[r0 + i0 + 1], c = coarse[r1 + i0], d = coarse[r1 + i0 + 1];
          const top = a + (b - a) * tx, v = top + (c + (d - c) * tx - top) * ty;
          const idx = j * cols + i;
          const al = alpha[idx] + ((v > thr[idx] ? 1 : 0) - alpha[idx]) * fac[rk[idx]];
          alpha[idx] = al;
          data[idx * 4 + 3] = al * bright[idx] * K;
        }
      }
      sctx.putImageData(img, 0, 0);
      ctx.globalCompositeOperation = "copy";
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sm, 0, 0, cols * pc, rows * pc);
      ctx.globalCompositeOperation = "destination-in";
      if (pattern) ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, cv.width, cv.height);
    }
    resize();
    return { st, frame, resize };
  })();

  // ================================================================ LOGO WRITE-ON
  el.defs.innerHTML = "";
  el.ink.innerHTML = "";
  el.solid.innerHTML = "";
  const tmpG = mk("g", {}, el.ink);
  const subs = (TEXT_D.match(/M[^M]+/g) ?? [])
    .map((d) => {
      const p = mk("path", { d }, tmpG);
      const b = p.getBBox();
      p.remove();
      return { d, x0: b.x, x1: b.x + b.width };
    })
    .sort((a, b) => a.x0 - b.x0);
  tmpG.remove();
  // Merge counters/dots into their letters: subpaths that overlap horizontally belong together
  const groups: { d: string; x0: number; x1: number }[] = [];
  for (const s of subs) {
    const g = groups.find((g) => Math.min(g.x1, s.x1) - Math.max(g.x0, s.x0) > 0.3 * Math.min(g.x1 - g.x0, s.x1 - s.x0));
    if (g) {
      g.d += s.d;
      g.x0 = Math.min(g.x0, s.x0);
      g.x1 = Math.max(g.x1, s.x1);
    } else groups.push({ ...s });
  }

  const BAR = 18, LT = 13, BW = 13.5, MID = 62.42;
  const SPECS: { key: string; d?: string; parallel?: boolean; strokes: [string, number][] }[] = [
    { key: "bar1", d: PARTS[0], parallel: true, strokes: [[`M5.82 ${MID}V21`, BAR], [`M5.82 ${MID}V103`, BAR]] },
    { key: "bar2", d: PARTS[1], parallel: true, strokes: [[`M26.75 ${MID}V9`, BAR], [`M26.75 ${MID}V116`, BAR]] },
    { key: "bar3", d: PARTS[2], parallel: true, strokes: [[`M47.68 ${MID}V-3`, BAR], [`M47.68 ${MID}V128`, BAR]] },
    { key: "bracket", d: PARTS[3], strokes: [["M60 10.5L101.18 34.24L101.18 90.6L60 114.4", BAR]] },
    { key: "w", strokes: [["M148.8 45L162 92L174.8 46L187.7 92L200.8 45", LT]] },
    { key: "e1", strokes: [["M217.8 68.5L240.4 69.2A14.7 17.4 0 1 0 239.02 76.55", BW]] },
    { key: "b", strokes: [["M256.31 33V91.5", LT], ["M255.6 69.2A14.7 17.4 0 1 1 285 69.2A14.7 17.4 0 1 1 255.6 69.2", BW]] },
    { key: "d1", strokes: [["M328.6 69.2A14.7 17.4 0 1 0 299.2 69.2A14.7 17.4 0 1 0 328.6 69.2", BW], ["M327.93 33V91.5", LT]] },
    { key: "e2", strokes: [["M350.67 68.5L373.27 69.2A14.7 17.4 0 1 0 371.89 76.55", BW]] },
    { key: "v", strokes: [["M384.2 45L399.4 92L414.6 45", LT]] },
    { key: "p1", strokes: [["M424.2 77V92", 12]] },
    { key: "c", strokes: [["M467.13 60.5A14.7 17.4 0 1 0 467.13 77.9", BW]] },
    { key: "o", strokes: [["M496.08 51.8A14.7 17.4 0 1 0 496.08 86.6A14.7 17.4 0 1 0 496.08 51.8", BW]] },
    { key: "p2", strokes: [["M526.24 77V92", 12]] },
    { key: "i", strokes: [["M543.9 47V92", 12.5], ["M543.9 33V45.5", 12.5]] },
    { key: "d2", strokes: [["M589.63 69.2A14.7 17.4 0 1 0 560.23 69.2A14.7 17.4 0 1 0 589.63 69.2", BW], ["M588.96 33V91.5", LT]] },
  ];
  if (groups.length !== SPECS.length - 4) console.warn(`[intro] expected ${SPECS.length - 4} wordmark glyphs, found ${groups.length}`);
  SPECS.slice(4).forEach((g, i) => (g.d = groups[i]?.d ?? ""));

  const G: Record<string, Glyph> = {};
  for (const spec of SPECS) {
    const id = "intro-m-" + spec.key;
    const m = mk("mask", { id, maskUnits: "userSpaceOnUse", x: -200, y: -200, width: 1000, height: 525 }, el.defs);
    const strokes = spec.strokes.map(([d, w]): Stroke => {
      const path = mk("path", { d, stroke: "#fff", "stroke-width": w, "stroke-linecap": "butt", "stroke-linejoin": "round", fill: "none" }, m);
      const len = path.getTotalLength();
      const s: Stroke = { el: path, len, p: 0, set: () => (path.style.strokeDashoffset = String(len * (1 - s.p))) };
      path.style.strokeDasharray = `${len} ${len + 2}`;
      return s;
    });
    const glyphEl = mk("path", { d: spec.d ?? "" }, el.ink);
    mk("path", { d: spec.d ?? "" }, el.solid);
    G[spec.key] = {
      key: spec.key,
      d: spec.d ?? "",
      parallel: !!spec.parallel,
      strokes,
      len: strokes.reduce((a, s) => a + s.len, 0),
      el: glyphEl,
      t0: 0,
      t1: 0,
      hide: () => {
        glyphEl.setAttribute("visibility", "hidden");
        glyphEl.removeAttribute("mask");
      },
      start: () => {
        glyphEl.setAttribute("mask", `url(#${id})`);
        glyphEl.removeAttribute("visibility");
      },
      done: () => glyphEl.removeAttribute("mask"),
    };
  }

  function write(tl: gsap.core.Timeline, g: Glyph, at: number, dur: number, ease = "sine.inOut") {
    g.t0 = at;
    g.t1 = at + dur;
    if (g.parallel) {
      tl.to(g.strokes, { p: 1, duration: dur, ease, onStart: g.start, onUpdate: () => g.strokes.forEach((s) => s.set()), onComplete: g.done }, at);
      return;
    }
    let t = at;
    g.strokes.forEach((s, i) => {
      const d = (dur * s.len) / g.len, first = i === 0, last = i === g.strokes.length - 1;
      tl.to(
        s,
        {
          p: 1,
          duration: d,
          onUpdate: s.set,
          ease: g.strokes.length === 1 ? ease : first ? "power1.in" : last ? "power1.out" : "none",
          onStart: first ? g.start : undefined,
          onComplete: last ? g.done : undefined,
        },
        t,
      );
      t += d;
    });
  }

  // ---- Camera rig: mark framing --a--> pen chase --b--> wide framing (+ hv: hover lift around the mark)
  const MARK: Pt = [53.5, 62.5], WIDE: Pt = [299.5, 62.5], FOCUS: Pt = [47.68, MID]; // FOCUS = centre of the tallest bar
  const CAM0 = { a: 0, b: 0, ms: 3.2, cs: 7.6, cr: -6, ws: WIDE_SCALE, hv: 0 };
  const CAM = { ...CAM0 };
  let track: Pt[] | null = null;
  const HZ = 120;
  const PEN = ["bracket", "w", "e1", "b", "d1", "e2", "v", "p1", "c", "o", "p2", "i", "d2"];
  function penTip(): Pt {
    let g = G[PEN[0]];
    for (const k of PEN) if (G[k].strokes[0].p > 0) g = G[k];
    let s = g.strokes[0];
    for (const st of g.strokes) if (st.p > 0) s = st;
    const pt = s.el.getPointAtLength(s.len * s.p);
    return [pt.x, pt.y];
  }
  function buildTrack(tl: gsap.core.Timeline) {
    const n = Math.ceil(tl.duration() * HZ) + 1, raw: Pt[] = [];
    for (let i = 0; i < n; i++) {
      tl.seek(i / HZ, true);
      raw.push(penTip());
    }
    tl.seek(0, true);
    const sig = 0.14 * HZ, R = Math.ceil(sig * 3), k: number[] = [];
    for (let j = -R; j <= R; j++) k.push(Math.exp(-(j * j) / (2 * sig * sig)));
    track = raw.map((_, i) => {
      let x = 0, y = 0, w = 0;
      for (let j = -R; j <= R; j++) {
        const q = raw[Math.min(Math.max(i + j, 0), n - 1)], kw = k[j + R];
        x += q[0] * kw;
        y += q[1] * kw;
        w += kw;
      }
      return [x / w, y / w];
    });
  }
  function trackAt(t: number): Pt {
    const tr = track!;
    const f = Math.min(Math.max(t * HZ, 0), tr.length - 1), i = Math.floor(f), u = f - i, A = tr[i], B = tr[Math.min(i + 1, tr.length - 1)];
    return [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u];
  }
  let lastT = "";
  function render() {
    if (!track) return;
    const [px, py] = trackAt(tl.time());
    let fx = lerp(MARK[0], px, CAM.a), fy = lerp(MARK[1], py, CAM.a);
    let s = lerpLog(CAM.ms, CAM.cs, CAM.a), r = lerp(0, CAM.cr, CAM.a);
    fx = lerp(fx, WIDE[0], CAM.b);
    fy = lerp(fy, WIDE[1], CAM.b);
    s = lerpLog(s, CAM.ws, CAM.b);
    r = lerp(r, 0, CAM.b);
    let t = `translate(299.5 62.5) rotate(${r.toFixed(3)}) scale(${s.toFixed(4)}) translate(${(-fx).toFixed(3)} ${(-fy).toFixed(3)})`;
    if (CAM.hv) t += ` translate(${FOCUS[0]} ${FOCUS[1]}) scale(${(1 + CAM.hv).toFixed(4)}) translate(${-FOCUS[0]} ${-FOCUS[1]})`;
    if (t !== lastT) {
      el.cam.setAttribute("transform", t);
      lastT = t;
    }
  }

  // ---- Shared state (declared before the timeline whose callbacks use it)
  let logoDone = false, revealed = false, ditherOn = true;
  let cursorTl: gsap.core.Timeline | null = null, revealTl: gsap.core.Timeline | null = null;
  let place: ((dt: number) => void) | null = null;

  // ---- The take
  const tl = gsap.timeline({ paused: true });
  tl.to(el.stage, { opacity: 1, duration: 0.7, ease: "power1.out" }, 0).to(CAM, { ms: 3.55, duration: 1.4, ease: "sine.inOut" }, 0);
  write(tl, G.bar1, 0.22, 0.6, "expo.out");
  write(tl, G.bar2, 0.36, 0.6, "expo.out");
  write(tl, G.bar3, 0.5, 0.6, "expo.out");
  write(tl, G.bracket, 0.95, 1.45);
  tl.to(CAM, { a: 1, duration: 1.1, ease: "power2.inOut" }, 0.9).to(CAM, { cs: 6.2, cr: -2, duration: 1.6, ease: "sine.inOut" }, 2.0);
  let at = 2.38;
  PEN.slice(1).forEach((k) => {
    const g = G[k], dur = 0.16 + g.len / 560;
    write(tl, g, at, dur, "power1.inOut");
    at += dur * 0.82;
  });
  tl.to(CAM, { b: 1, duration: 1.3, ease: "expo.inOut" }, 4.15)
    .to(CAM, { ws: WIDE_SCALE * 1.04, duration: 5, ease: "sine.out" }, 5.45)
    .to(el.solid, { opacity: 1, duration: 0.3, ease: "power1.inOut" }, G.d2.t1 + 0.1)
    .call(() => (logoDone = true), undefined, G.d2.t1 + 0.2)
    .call(() => cursorPhase(), undefined, G.d2.t1 + 0.7);

  buildTrack(tl);
  Object.values(G).forEach((g) => {
    g.strokes.forEach((s) => {
      s.p = 0;
      s.set();
    });
    g.hide();
  });
  Object.assign(CAM, CAM0);
  gsap.set(el.solid, { opacity: 0 });

  // ================================================================ START / TICK
  // No loading phase: the dither blooms in and the logo starts writing on immediately.
  gsap.to(Dither.st, { I: 0.78, clear: 0.7, duration: 2.4, ease: "sine.inOut" });
  tl.play(0);

  const tick = (time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs, 100) / 1000;
    if (ditherOn) Dither.frame(time, dt);
    if (!revealed) render();
    place?.(dt);
  };
  gsap.ticker.add(tick);
  cleanups.push(() => gsap.ticker.remove(tick));

  // ================================================================ SCRIPTED CURSOR
  // Same look and feel as the site cursor: black arrow with a white rim that turns to face its direction of
  // travel and squishes a touch while moving; over the logo (a clickable thing) it morphs into the circle,
  // presses down to 70% and springs back, with a double ripple.
  const cursorState = { x: 0, y: 0, heading: 0 };
  function cursorPhase() {
    if (revealed) return;
    // The same film on every device: on touch screens the arrow still travels to the logo and clicks it,
    // then fades away at the reveal (there is no site cursor to hand it to).
    const target = (): Pt => {
      const r = G.bar3.el.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    };
    const W = innerWidth, H = innerHeight;
    const [tx0, ty0] = target();
    const S: Pt = [Math.min(W - 40, tx0 + Math.max(170, W * 0.28)), Math.min(H - 48, ty0 + Math.max(140, H * 0.3))];
    const C = { p: 0, appear: 0, morph: 0, press: 1 };
    let last: Pt | null = null, squish = 1, drawnMorph = -1;
    cursorState.heading = (Math.atan2(ty0 - S[1], tx0 - S[0]) * 180) / Math.PI + 90;

    place = (dt: number) => {
      const T = target(), p = C.p, q = 1 - p;
      // Cubic Bézier like a hand on a trackpad: leaves up-left, bows under the straight line, and drifts onto
      // the bar from just above so the last few pixels read as a settle rather than a stop.
      const c1: Pt = [lerp(S[0], T[0], 0.2), lerp(S[1], T[1], 0.62)];
      const c2: Pt = [lerp(S[0], T[0], 0.8), lerp(S[1], T[1], 1.06)];
      const x = q * q * q * S[0] + 3 * q * q * p * c1[0] + 3 * q * p * p * c2[0] + p * p * p * T[0];
      const y = q * q * q * S[1] + 3 * q * q * p * c1[1] + 3 * q * p * p * c2[1] + p * p * p * T[1];

      // Face the direction of travel (same 0° = up convention as the site cursor), turning the short way round
      const dx = last ? x - last[0] : 0, dy = last ? y - last[1] : 0;
      const speed = dt > 0 ? Math.hypot(dx, dy) / dt : 0;
      if (speed > 30) {
        let diff = (Math.atan2(dy, dx) * 180) / Math.PI + 90 - cursorState.heading;
        diff = ((((diff + 180) % 360) + 360) % 360) - 180;
        cursorState.heading += diff * (1 - Math.exp(-dt * 14));
      }
      squish += (1 - Math.min(0.06, speed / 9000) - squish) * (1 - Math.exp(-dt * 18));
      last = [x, y];
      cursorState.x = x;
      cursorState.y = y;

      const scale = (0.6 + 0.4 * C.appear) * squish * C.press;
      el.cursor.style.opacity = String(C.appear);
      el.cursor.style.visibility = C.appear > 0 ? "visible" : "hidden";
      el.cursor.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${cursorState.heading.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      if (Math.abs(C.morph - drawnMorph) > 0.001) {
        el.cursorShape.setAttribute("d", cursorPath(C.morph));
        drawnMorph = C.morph;
      }
    };

    const arrive = 1.15;
    cursorTl = gsap.timeline();
    cursorTl
      .to(C, { appear: 1, duration: 0.5, ease: "power2.out" }, 0)
      .to(C, { p: 1, duration: 1.25, ease: "power3.inOut" }, 0.15)
      .to(C, { morph: 1, duration: 0.4, ease: "power2.out" }, arrive) // over something clickable: arrow → circle
      .to(CAM, { hv: 0.03, duration: 0.55, ease: "power2.out" }, arrive) // the logo leans in
      .to(C, { press: 0.7, duration: 0.1, ease: "power2.in" }, arrive + 0.6) // press, like the real cursor
      .to(CAM, { hv: 0.014, duration: 0.12, ease: "power2.in" }, "<")
      .call(() => ripple())
      .to(C, { press: 1, duration: 0.55, ease: "elastic.out(1, 0.5)" }) // release with a little spring
      .call(() => reveal(), undefined, "-=0.45");
  }
  function ripple() {
    el.rings.forEach((ring, i) => {
      gsap.set(ring, { x: cursorState.x, y: cursorState.y });
      gsap.fromTo(
        ring,
        { scale: 0.3, opacity: i ? 0.4 : 0.75 },
        { scale: i ? 2.1 : 1.45, opacity: 0, duration: i ? 0.95 : 0.7, delay: i * 0.08, ease: "power2.out" },
      );
    });
  }

  // ================================================================ REVEAL: zoom through the logo
  function reveal() {
    if (revealed) return;
    revealed = true;
    cursorTl?.kill();

    // Hand the cursor to the site cursor at the same spot (it continues as the circle and morphs back);
    // without a custom cursor (touch, small screens) the scripted one just fades away.
    const handedOff = place !== null && matchMedia(CUSTOM_CURSOR_QUERY).matches;
    place = null;
    if (handedOff) gsap.set(el.cursor, { autoAlpha: 0 });
    else gsap.to(el.cursor, { autoAlpha: 0, duration: 0.35, delay: 0.15 });
    cb.onEnter(handedOff ? { x: cursorState.x, y: cursorState.y } : null);

    // Freeze the logo exactly where it is and swap it for an identical window cut into the veil
    const m = el.cam.getScreenCTM()!;
    const s0 = Math.hypot(m.a, m.b), rot = (Math.atan2(m.b, m.a) * 180) / Math.PI;
    const F0: Pt = [m.a * FOCUS[0] + m.c * FOCUS[1] + m.e, m.b * FOCUS[0] + m.d * FOCUS[1] + m.f];
    const W = innerWidth, H = innerHeight;
    const S1 = Math.max(W / 11.64, H / 100) * 2.4; // tall bar well past the viewport edges
    tl.pause();
    const Z = { u: 0, c: 0 };
    const apply = () => {
      const s = lerpLog(s0, S1, Z.u);
      el.hole.setAttribute(
        "transform",
        `translate(${lerp(F0[0], W / 2, Z.c)} ${lerp(F0[1], H / 2, Z.c)}) rotate(${rot * (1 - Z.c)}) scale(${s}) translate(${-FOCUS[0]} ${-FOCUS[1]})`,
      );
    };
    apply();
    el.hole.setAttribute("visibility", "visible");
    el.stage.style.visibility = "hidden";

    // Zoom around the middle of what is on screen (innerHeight, not 50vh, which includes the area behind mobile toolbars)
    if (main) gsap.set(main, { scale: 1.22, transformOrigin: `50% ${innerHeight / 2}px` });
    revealTl = gsap.timeline({ onComplete: done });
    revealTl
      .to(Dither.st, { fade: 0, duration: 0.6, ease: "power1.out" }, 0)
      .to(el.vignette, { opacity: 0, duration: 0.9 }, 0)
      .to(Z, { u: 1, duration: 1.9, ease: "power3.inOut", onUpdate: apply }, 0)
      .to(Z, { c: 1, duration: 1.6, ease: "power2.inOut" }, 0)
      .to(el.cover, { opacity: 0, duration: 0.8, ease: "power1.inOut" }, 0.55);
    if (main) revealTl.to(main, { scale: 1, duration: 2.3, ease: "power3.out" }, 0.3);
  }
  function done() {
    ditherOn = false;
    if (main) gsap.set(main, { clearProps: "transform,transformOrigin" });
    cleanups.forEach((fn) => fn()); // stop the ticker and listeners; the overlay is about to unmount
    cleanups.length = 0;
    cb.onDone();
  }
  function skip() {
    if (revealed) return;
    revealed = true;
    tl.pause();
    cursorTl?.kill();
    cb.onEnter(null);
    done();
  }

  // ================================================================ INPUT / RESIZE
  const onClick = () => logoDone && !revealed && reveal();
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip(); // skip the whole intro
  let rz: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => {
    clearTimeout(rz);
    rz = setTimeout(() => ditherOn && Dither.resize(), 120);
  };
  el.root.addEventListener("click", onClick);
  addEventListener("keydown", onKey);
  addEventListener("resize", onResize);
  cleanups.push(() => {
    el.root.removeEventListener("click", onClick);
    removeEventListener("keydown", onKey);
    removeEventListener("resize", onResize);
    clearTimeout(rz);
  });

  return () => {
    cleanups.forEach((fn) => fn());
    tl.kill();
    cursorTl?.kill();
    revealTl?.kill();
    gsap.killTweensOf([Dither.st, CAM, el.cursor, el.cover, el.vignette, el.solid, el.stage, ...el.rings]);
    if (main) gsap.set(main, { clearProps: "transform,transformOrigin" });
    place = null;
    el.defs.innerHTML = "";
    el.ink.innerHTML = "";
    el.solid.innerHTML = "";
    el.hole.innerHTML = "";
  };
}
