"use client";

import { useEffect, useRef } from "react";

/*
 * Cursor-driven particle typography, from the @componentry shadcn registry
 * (npx shadcn@latest add @componentry/cursor-driven-particle-typography), adapted for this site:
 * - multi-line text ("\n") with **emphasised** runs in a second weight, shrunk to fit the container width
 * - uses the container's font (Geist) and waits for web fonts before sampling the glyphs
 * - performance: particle state lives in typed arrays and every dot is drawn in one WebGL call
 *   (with an anti-aliased round point shader; canvas 2D as a fallback); the glyphs are sampled on a
 *   separate canvas; the loop sleeps once every particle has settled (no resting jitter) and wakes
 *   on pointer movement or resize; nothing runs while the canvas is off screen
 * - no `touch-none`, so swiping over the text still scrolls the page
 * - no `cn` / @/lib/utils dependency
 * The canvas is decorative: render the real text elsewhere for screen readers and SEO.
 */

interface ParticleTextProps {
  /** Additional CSS classes. Give the component a height here. */
  className?: string;
  /** The text to render. Use "\n" for line breaks and **double asterisks** for emphasised words. */
  text: string;
  /** Maximum font size in pixels; shrinks so the widest line fits the container. */
  fontSize?: number;
  /** Font family. Defaults to the container's computed font. */
  fontFamily?: string;
  fontWeight?: number | string;
  /** Weight of the **emphasised** words. */
  emphasisWeight?: number | string;
  /** Line height as a multiple of the font size. */
  lineHeight?: number;
  /** Radius of each particle */
  particleSize?: number;
  /** Spacing between particles in px (lower number = more particles, minimum 1) */
  particleDensity?: number;
  /** How strongly the cursor pushes particles away */
  dispersionStrength?: number;
  /** Distance in px from the cursor within which particles get pushed */
  interactionRadius?: number;
  /** Speed at which particles return to origin */
  returnSpeed?: number;
  /** Particle color. Defaults to the container's text color. */
  color?: string;
}

/** Below this speed (px per frame, squared) a particle counts as settled. */
const REST_SPEED_SQ = 0.0004;

type Dots = {
  /** Size the drawing surface (CSS px) and set the dot radius (CSS px) and colour. */
  setup(width: number, height: number, dpr: number, radius: number, color: string): void;
  /** Draw `count` dots from interleaved CSS-px positions [x0, y0, x1, y1, …]. */
  draw(pos: Float32Array, count: number): void;
  destroy(): void;
};

const DOT_VS = `attribute vec2 a;uniform vec2 R;uniform float S;
void main(){vec2 c=a/R*2.-1.;gl_Position=vec4(c.x,-c.y,0.,1.);gl_PointSize=S;}`;
// Coverage of a disc of radius RAD (device px), the same anti-aliasing as a canvas arc. The point
// size gets its own uniform here (PS): a uniform shared with the vertex shader would need matching
// precision, and a mismatch fails the link.
const DOT_FS = `precision mediump float;uniform vec3 C;uniform float RAD;uniform float PS;
void main(){float a=clamp(RAD-length(gl_PointCoord-.5)*PS+.5,0.,1.);gl_FragColor=vec4(C*a,a);}`;

/** Any CSS colour -> [r, g, b] in 0..1. */
function toRgb(color: string): [number, number, number] {
  const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  c.canvas.width = c.canvas.height = 1;
  c.fillStyle = color;
  c.fillRect(0, 0, 1, 1);
  const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

/** All dots as one WebGL point draw. Null when WebGL is unavailable. */
function glDots(canvas: HTMLCanvasElement): Dots | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  if (!gl) return null;
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, DOT_VS));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, DOT_FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Particle text shader:", gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uR = u("R"), uS = u("S"), uPS = u("PS"), uRad = u("RAD"), uC = u("C");
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  let capacity = 0;

  return {
    setup(width, height, dpr, radius, color) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uR, width, height);
      const size = Math.ceil((radius * 2 + 2) * dpr);
      gl.uniform1f(uS, size);
      gl.uniform1f(uPS, size);
      gl.uniform1f(uRad, radius * dpr);
      gl.uniform3f(uC, ...toRgb(color));
    },
    draw(pos, count) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!count) return;
      if (pos.length > capacity) {
        gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
        capacity = pos.length;
      } else {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos.subarray(0, count * 2));
      }
      gl.drawArrays(gl.POINTS, 0, count);
    },
    destroy() {
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}

/** Fallback: every dot as an arc in one canvas 2D path. */
function canvasDots(canvas: HTMLCanvasElement): Dots | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  let r = 1;
  return {
    setup(_w, _h, dpr, radius, color) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = color;
      r = radius;
    },
    draw(pos, count) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        ctx.moveTo(pos[i * 2] + r, pos[i * 2 + 1]);
        ctx.arc(pos[i * 2], pos[i * 2 + 1], r, 0, Math.PI * 2);
      }
      ctx.fill();
    },
    destroy() {},
  };
}

export function ParticleText({
  className = "",
  text,
  fontSize = 120,
  fontFamily,
  fontWeight = 700,
  emphasisWeight = 700,
  lineHeight = 1,
  particleSize = 1.5,
  particleDensity = 6,
  dispersionStrength = 15,
  interactionRadius = 120,
  returnSpeed = 0.08,
  color,
}: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    // Glyphs are sampled here, so the visible canvas never needs a read-back.
    const sampler = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    if (!sampler) return;

    let dots: Dots | null = null;
    let raf = 0;
    let cancelled = false;
    let onScreen = true;
    let mouseX = -1000;
    let mouseY = -1000;
    // Particle state: interleaved positions [x0, y0, x1, y1, …], their origins, and velocities
    let count = 0;
    let pos = new Float32Array(0);
    let origin = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);

    const init = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      count = 0;
      if (!width || !height) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Created on first real size, so a copy hidden by CSS never takes a WebGL context.
      dots ??= glDots(canvas) ?? canvasDots(canvas);
      if (!dots) return;

      const style = window.getComputedStyle(container);
      dots.setup(width, height, dpr, particleSize, color || style.color || "#000");

      const family = fontFamily || style.fontFamily;
      // Each line is a list of runs; odd chunks between "**" are emphasised.
      const lines = text.split("\n").map((line) =>
        line
          .split("**")
          .map((chunk, i) => ({ text: chunk, bold: i % 2 === 1 }))
          .filter((run) => run.text),
      );
      const font = (size: number, bold: boolean) => `${bold ? emphasisWeight : fontWeight} ${size}px ${family}`;
      const lineWidth = (runs: (typeof lines)[number], size: number) =>
        runs.reduce((w, run) => {
          sampler.font = font(size, run.bold);
          return w + sampler.measureText(run.text).width;
        }, 0);

      // Shrink the font until the widest line fits.
      const widest = Math.max(1, ...lines.map((runs) => lineWidth(runs, fontSize)));
      const textSize = Math.min(fontSize, (fontSize * width * 0.96) / widest);
      const lh = textSize * lineHeight;

      // Draw the text once (run by run, centred per line) and sample its pixels
      const sc = sampler.canvas;
      sc.width = canvas.width;
      sc.height = canvas.height;
      sampler.setTransform(dpr, 0, 0, dpr, 0, 0);
      sampler.fillStyle = "#000";
      sampler.textAlign = "left";
      sampler.textBaseline = "middle";
      const top = height / 2 - ((lines.length - 1) * lh) / 2;
      lines.forEach((runs, i) => {
        let x = width / 2 - lineWidth(runs, textSize) / 2;
        for (const run of runs) {
          sampler.font = font(textSize, run.bold);
          sampler.fillText(run.text, x, top + i * lh);
          x += sampler.measureText(run.text).width;
        }
      });

      const pixels = sampler.getImageData(0, 0, sc.width, sc.height);
      sc.width = sc.height = 0; // release the sampling buffer
      const step = Math.max(1, Math.floor(particleDensity * dpr));
      const points: number[] = [];
      for (let y = 0; y < pixels.height; y += step) {
        for (let x = 0; x < pixels.width; x += step) {
          if (pixels.data[(y * pixels.width + x) * 4 + 3] > 128) points.push(x / dpr, y / dpr);
        }
      }
      count = points.length / 2;
      origin = Float32Array.from(points);
      pos = new Float32Array(points.length);
      vx = new Float32Array(count);
      vy = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        // start with slight randomness, so the text settles into place
        pos[i * 2] = origin[i * 2] + (Math.random() - 0.5) * 10;
        pos[i * 2 + 1] = origin[i * 2 + 1] + (Math.random() - 0.5) * 10;
        vx[i] = (Math.random() - 0.5) * 5;
        vy[i] = (Math.random() - 0.5) * 5;
      }
      wake();
    };

    const animate = () => {
      raf = 0;
      const r2 = interactionRadius * interactionRadius;
      let maxSpeedSq = 0;
      for (let i = 0; i < count; i++) {
        const xi = i * 2;
        const yi = xi + 1;
        // Push away from the cursor
        const dx = mouseX - pos[xi];
        const dy = mouseY - pos[yi];
        const d2 = dx * dx + dy * dy;
        if (d2 > 0 && d2 < r2) {
          const distance = Math.sqrt(d2);
          const force = ((interactionRadius - distance) / interactionRadius) * dispersionStrength;
          vx[i] -= (dx / distance) * force;
          vy[i] -= (dy / distance) * force;
        }
        // Spring back to origin, with friction
        vx[i] = (vx[i] + (origin[xi] - pos[xi]) * returnSpeed) * 0.85;
        vy[i] = (vy[i] + (origin[yi] - pos[yi]) * returnSpeed) * 0.85;
        pos[xi] += vx[i];
        pos[yi] += vy[i];
        const sp = vx[i] * vx[i] + vy[i] * vy[i];
        if (sp > maxSpeedSq) maxSpeedSq = sp;
      }
      // Settled: snap home if nothing is pushing them, draw the final frame and sleep.
      const settled = maxSpeedSq < REST_SPEED_SQ;
      if (settled && mouseX === -1000) {
        pos.set(origin);
        vx.fill(0);
        vy.fill(0);
      }
      dots?.draw(pos, count);
      if (!settled) wake();
    };

    function wake() {
      if (!raf && onScreen && !cancelled && count) raf = requestAnimationFrame(animate);
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      wake();
    };
    const onLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      wake();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") onLeave();
    };

    // Sample the glyphs only once the web font is in, or they come out in the fallback font.
    let ready = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ready = true;
      init();
    });

    const resizeObserver = new ResizeObserver(() => {
      if (ready) init();
    });
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) wake();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    intersectionObserver.observe(container);

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onLeave);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onLeave);
      canvas.removeEventListener("pointerleave", onLeave);
      dots?.destroy();
    };
  }, [text, fontSize, fontFamily, fontWeight, emphasisWeight, lineHeight, particleSize, particleDensity, dispersionStrength, interactionRadius, returnSpeed, color]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
    </div>
  );
}
