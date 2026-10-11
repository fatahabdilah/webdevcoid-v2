/**
 * webdev.co.id brand colours, in gradient order: black, then the brand "Linear" gradient
 * (#011F6C → #0346D6 → #236EF3, the 2026-10 update), then white. The same values are the
 * --color-holo-* tokens in globals.css; this copy is for canvas, WebGL and SVG code.
 */
export const brand = {
  black: "#000000", // 0%
  navy: "#011F6C", // 25%
  blue: "#0346D6", // 50%
  light: "#236EF3", // 75%
  white: "#FFFFFF", // 100%
} as const;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (c: number[]) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

/** `a` mixed toward `b` by t (0..1). */
export function mix(a: string, b: string, t: number) {
  const [x, y] = [rgb(a), rgb(b)];
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
}
