"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { brand } from "@/lib/brand";
import { introPhase, subscribeIntro } from "@/lib/intro";

/*
 * "Creative Playground" hero background.
 * Pass 1 renders a slow domain-warped noise field into a small texture; pass 2 samples it per
 * character cell and draws it as ASCII glyphs, with a ripple that follows the pointer.
 */

/** The field's six colour roles (shader C0–C5), from darkest to the brightest highlights. */
const DEFAULT_COLORS = {
  base: brand.black,
  deep: brand.navy,
  main: brand.blue,
  shade: brand.navy,
  highlight: brand.light,
  accent: brand.blue,
};

type AsciiColors = typeof DEFAULT_COLORS;

type Options = {
  colors?: Partial<AsciiColors>;
  /** Character cell size in CSS px. Defaults to 8×13 (7×11 under 600px wide). */
  cell?: [number, number];
  speed?: number;
  rippleRadius?: number;
  /** Grow the glyph layer out from the centre on load. */
  reveal?: boolean;
  /** Glyph ramp, darkest to brightest. */
  chars?: string;
};

const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

const FS1 = `precision highp float;
uniform vec2 R;uniform float T;
uniform vec3 C0;uniform vec3 C1;uniform vec3 C2;uniform vec3 C3;uniform vec3 C4;uniform vec3 C5;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
  vec2 uv=gl_FragCoord.xy/R;vec2 p=(uv-.5)*vec2(R.x/R.y,1.)*1.6;
  float t=T*.11;
  vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,-t*.8)));
  vec2 r=vec2(fbm(p+2.2*q+vec2(1.7,9.2)+t*.6),fbm(p+2.2*q+vec2(8.3,2.8)-t*.7));
  float f=fbm(p+2.4*r);
  vec3 c=C0;
  c=mix(c,C1,smoothstep(.25,.7,f));
  c=mix(c,C2,smoothstep(.42,.85,f)*smoothstep(.2,.7,r.x)*.9);
  c=mix(c,C3,smoothstep(.35,.75,q.y)*smoothstep(.3,.65,f)*.7);
  c=mix(c,C4,smoothstep(.55,.9,r.y)*smoothstep(.42,.8,f)*.75);
  c=mix(c,C5,smoothstep(.6,.9,q.x)*smoothstep(.4,.7,f)*.35);
  float v=length(uv-.5);c*=1.-smoothstep(.35,.85,v)*.55;
  gl_FragColor=vec4(c,1.);
}`;

const FS2 = `precision highp float;
uniform vec2 R;uniform float T;uniform vec2 M;uniform float MI;uniform float D;uniform float REV;uniform float RAD;
uniform vec2 CELL;uniform float NG;uniform sampler2D G;uniform sampler2D A;
float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
void main(){
  vec2 fc=gl_FragCoord.xy;
  vec2 cell=floor(fc/CELL);vec2 cc=(cell+.5)*CELL;vec2 lc=(fc-cell*CELL)/CELL;
  vec2 sp=cc;
  sp.x+=sin(cc.y/D*.018+T*1.38)*12.*D;
  vec2 dv=cc-M;float d=length(dv)/D;float f=clamp(1.-d/RAD,0.,1.)*MI;
  float w=sin(d*.06-T*7.5)*22.*f*f*D;
  sp-=dv/max(length(dv),1.)*w;
  vec3 gc=texture2D(G,clamp(sp/R,0.,1.)).rgb;
  float L=dot(gc,vec3(.2126,.7152,.0722));
  float l=clamp(pow(L*4.2,.8)+f*.55,0.,1.);
  float gi=floor(l*(NG-1.)+.5);
  float ga=texture2D(A,vec2((gi+clamp(lc.x,.02,.98))/NG,1.-lc.y)).a;
  vec3 base=texture2D(G,fc/R).rgb;
  vec3 col=base*.5;
  col+=(h(floor(fc/(1.6*D)))-.5)*.05;
  vec3 cc2=mix(gc*3.+.1,vec3(.95,.97,1.),clamp(f*.9+l*l*.35,0.,1.));
  float rr=length((cc/R-.5)*vec2(R.x/R.y,1.));
  float rv=smoothstep(REV*1.25,REV*1.25-.18,rr);
  col=mix(col,cc2,ga*(.5+.5*l)*rv);
  gl_FragColor=vec4(col,1.);
}`;

const hex = (h: string) => {
  const s = h.replace("#", "");
  const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255);
};

/** Starts the background on `canvas` and returns a cleanup function. */
function createAsciiBackground(
  canvas: HTMLCanvasElement,
  { colors, cell, speed = 1, rippleRadius = 170, reveal = true, chars = " .:-=+*#%@" }: Options = {},
) {
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
  if (!gl) return () => {}; // No WebGL: the CSS fallback background stays visible.

  const C = { ...DEFAULT_COLORS, ...colors };
  const NG = chars.length;
  const sh = (type: number, src: string) => {
    const o = gl.createShader(type)!;
    gl.shaderSource(o, src);
    gl.compileShader(o);
    return o;
  };
  const prog = (fs: string) => {
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  };
  const P1 = prog(FS1);
  const P2 = prog(FS2);
  if (!P1 || !P2) return () => {};

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const bind = (p: WebGLProgram) => {
    gl.useProgram(p);
    const l = gl.getAttribLocation(p, "a");
    gl.enableVertexAttribArray(l);
    gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
  };
  const u = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);

  gl.useProgram(P1);
  (["base", "deep", "main", "shade", "highlight", "accent"] as const).forEach((k, i) => gl.uniform3fv(u(P1, "C" + i), hex(C[k])));

  const tex = (filter: number) => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    return t;
  };
  const gTex = tex(gl.LINEAR);
  const aTex = tex(gl.NEAREST);
  const fbo = gl.createFramebuffer();

  let dpr = 1;
  let gw = 1;
  let gh = 1;
  let cw = 8;
  let chh = 13;
  const resize = () => {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    canvas.width = w;
    canvas.height = h;
    gw = Math.max(2, Math.ceil(w / 6));
    gh = Math.max(2, Math.ceil(h / 6));
    gl.bindTexture(gl.TEXTURE_2D, gTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gw, gh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, gTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // Glyph atlas: one row of white characters.
    const small = canvas.clientWidth < 600;
    const [cx, cy] = cell ?? (small ? [7, 11] : [8, 13]);
    cw = Math.round(cx * dpr);
    chh = Math.round(cy * dpr);
    const a = document.createElement("canvas");
    a.width = cw * NG;
    a.height = chh;
    const x = a.getContext("2d")!;
    x.fillStyle = "#fff";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = `500 ${Math.round(chh * 0.78)}px "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace`;
    for (let i = 0; i < NG; i++) x.fillText(chars[i], cw * (i + 0.5), chh * 0.55);
    gl.bindTexture(gl.TEXTURE_2D, aTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a);
  };

  // Pointer position is eased so the ripple stays smooth.
  const ptr = { x: -9999, y: -9999, on: false };
  const onMove = (e: PointerEvent) => {
    ptr.x = e.clientX;
    ptr.y = e.clientY;
    ptr.on = true;
  };
  const onLeave = () => {
    ptr.on = false;
  };
  const onUp = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") ptr.on = false;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onMove, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  document.addEventListener("pointerleave", onLeave);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const U1 = { R: u(P1, "R"), T: u(P1, "T") };
  const U2 = Object.fromEntries(
    ["G", "A", "R", "T", "M", "MI", "D", "REV", "RAD", "CELL", "NG"].map((n) => [n, u(P2, n)]),
  ) as Record<string, WebGLUniformLocation | null>;
  let mx = -9999;
  let my = -9999;
  let mi = 0;
  let T = 0;
  let last = 0;
  let raf = 0;
  const t0 = performance.now();

  const render = (now: number) => {
    const calm = reduce.matches;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (!calm) T += dt * speed;
    const rv = !reveal || calm ? 1 : Math.min(1, Math.max(0, (now - t0 - 250) / 1400));
    const rev = 1 - Math.pow(1 - rv, 3);

    // The ripple only needs the canvas position while the pointer is (or was just) over the page.
    mi += ((ptr.on ? 1 : 0) - mi) * 0.1;
    if (ptr.on || mi > 0.001) {
      const r = canvas.getBoundingClientRect();
      const tx = (ptr.x - r.left) * dpr;
      const ty = (r.height - (ptr.y - r.top)) * dpr;
      if (mx < -9000) {
        mx = tx;
        my = ty;
      }
      mx += (tx - mx) * 0.12;
      my += (ty - my) * 0.12;
    }

    bind(P1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, gw, gh);
    gl.uniform2f(U1.R, gw, gh);
    gl.uniform1f(U1.T, T);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    bind(P2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gTex);
    gl.uniform1i(U2.G, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, aTex);
    gl.uniform1i(U2.A, 1);
    gl.uniform2f(U2.R, canvas.width, canvas.height);
    gl.uniform1f(U2.T, T);
    gl.uniform2f(U2.M, mx, my);
    gl.uniform1f(U2.MI, mi);
    gl.uniform1f(U2.D, dpr);
    gl.uniform1f(U2.REV, rev);
    gl.uniform1f(U2.RAD, rippleRadius);
    gl.uniform2f(U2.CELL, cw, chh);
    gl.uniform1f(U2.NG, NG);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let lastDraw = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    // The field drifts slowly, so 30 fps is plenty; full rate only while the pointer's ripple is live (and never
    // while the loader zooms away, so it keeps its frames)
    const rippling = ptr.on || mi > 0.001;
    if ((!rippling || introPhase() === "zoom") && now - lastDraw < 1000 / 30 - 2) return;
    lastDraw = now;
    render(now);
  };

  // Render only while the canvas is on screen and the tab is visible, and the intro isn't covering it.
  let onScreen = false;
  const sync = () => {
    const run = onScreen && !document.hidden && introPhase() !== "off";
    if (run && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    sync();
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", sync);
  const unsubscribe = subscribeIntro(sync);
  // Draw one frame while the page is idle (under the intro), so the GPU compiles the shaders now and the
  // first visible frame, as the intro's window opens, doesn't hitch
  const whenIdle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
  const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
  const warmup = whenIdle(() => {
    if (!raf) render(performance.now());
  });

  return function destroy() {
    cancelIdle(warmup);
    unsubscribe();
    cancelAnimationFrame(raf);
    raf = 0;
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onMove);
    window.removeEventListener("pointerup", onUp);
    document.removeEventListener("pointerleave", onLeave);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}

/** Shown before WebGL draws, and instead of it when WebGL is unavailable. */
const fallback: CSSProperties = { background: `radial-gradient(120% 90% at 30% 20%, ${brand.navy}, ${brand.black} 70%)` };

export function AsciiBackground({ className = "", ...options }: Options & { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(options);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    // A fresh canvas per mount: cleanup loses the WebGL context, and a canvas hands back
    // that same dead context if it is reused (React re-runs effects in dev).
    const canvas = document.createElement("canvas");
    canvas.className = "block size-full";
    host.appendChild(canvas);
    const destroy = createAsciiBackground(canvas, JSON.parse(key));
    return () => {
      destroy();
      canvas.remove();
    };
  }, [key]);

  return <div ref={ref} aria-hidden className={`size-full ${className}`} style={fallback} />;
}
