"use client";

import { useEffect, useRef } from "react";

/*
 * Random dither dots (after cipher.tv): a grid of small white dots, each lit or dark by a flowing,
 * domain-warped noise field; every dot has its own random threshold, so the shapes' edges scatter
 * like a dither. One WebGL draw, 30fps, and the noise is only computed for pixels inside a dot.
 * Nothing is created until it first turns on, and it stops while off or off screen.
 */

/** Grid spacing and dot radius in CSS px; dot opacity. */
const SPACING = 10;
const RADIUS = 1.1;
const ALPHA = 0.5;
/** Keep drawing this long after switching off, while the ambient's reveal mask closes. */
const LINGER_MS = 1300;

const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
const FS = `precision mediump float;
uniform float T;uniform float S;uniform float D;uniform float RAD;uniform float A;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){return vn(p)*.55+vn(p*2.07+3.1)*.3+vn(p*4.13-7.7)*.15;}
void main(){
  vec2 fc=gl_FragCoord.xy;
  vec2 cell=floor(fc/S);
  vec2 c=(cell+.5)*S;
  float d=length(fc-c)/D;                      // distance to the dot centre, CSS px
  if(d>RAD+.6) discard;                         // most pixels: no noise work at all
  vec2 p=c/(S*36.);                             // shapes ~36 cells across
  vec2 w=vec2(fbm(p+vec2(0.,T*.12)),fbm(p+vec2(5.2,-T*.1)));
  float n=fbm(p*1.3+w*1.7+vec2(T*.06,-T*.05));
  float on=step(.5+(h(cell)-.5)*.16,n);         // per-dot random threshold: dithered edges
  float a=on*(1.-smoothstep(RAD-.4,RAD+.6,d))*A;
  gl_FragColor=vec4(a,a,a,a);                   // premultiplied white
}`;

type Engine = { setActive(on: boolean): void; destroy(): void };

function createDither(canvas: HTMLCanvasElement): Engine | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) return null;
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Dither shader:", gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uT = u("T"), uS = u("S"), uD = u("D"), uRad = u("RAD"), uA = u("A");
  gl.uniform1f(uRad, RADIUS);
  gl.uniform1f(uA, ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let active = false;
  let onScreen = false;
  let lingerUntil = 0;
  let raf = 0;
  let last = 0;
  let T = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uS, SPACING * dpr);
    gl.uniform1f(uD, dpr);
  };
  const draw = () => {
    gl.uniform1f(uT, T);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const running = () => onScreen && (active || performance.now() < lingerUntil);
  const frame = (now: number) => {
    raf = 0;
    if (!running()) return;
    if (reduce.matches) return draw(); // one still frame
    if (now - last >= 1000 / 30 - 2) {
      T += last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      draw();
    }
    raf = requestAnimationFrame(frame);
  };
  const schedule = () => {
    if (!raf && running()) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };

  resize();
  const ro = new ResizeObserver(() => {
    resize();
    if (active) draw();
  });
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    schedule();
  });
  io.observe(canvas);

  return {
    setActive(on) {
      active = on;
      if (!on) lingerUntil = performance.now() + LINGER_MS;
      schedule();
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/** Fills its positioned parent. Created on the first `on`; idle (no drawing) whenever off. */
export function DitherDots({ on }: { on: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const tried = useRef(false);

  useEffect(() => {
    const el = host.current;
    if (on && !tried.current && el) {
      tried.current = true;
      // A fresh canvas: a reused one would hand back a context lost by an earlier cleanup.
      const canvas = document.createElement("canvas");
      canvas.className = "absolute inset-0 block size-full";
      el.appendChild(canvas);
      engine.current = createDither(canvas);
    }
    engine.current?.setActive(on);
  }, [on]);

  useEffect(() => {
    const el = host.current;
    return () => {
      engine.current?.destroy();
      engine.current = null;
      tried.current = false;
      el?.replaceChildren();
    };
  }, []);

  return <div ref={host} aria-hidden className="absolute inset-0" />;
}
