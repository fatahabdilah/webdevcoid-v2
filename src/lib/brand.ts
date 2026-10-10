/**
 * webdev.co.id brand colours, in gradient order. Based on the Figma "Linear" colour style
 * (#000000 / #011085 / #0428F0 / #568EF7 / #FFFFFF), with the three blues turned ~7–10° toward blue
 * because the originals read too purple on screen. The same values are the --color-holo-* tokens
 * in globals.css; this copy is for canvas, WebGL and SVG code.
 */
export const brand = {
  black: "#000000", // 0%
  navy: "#012685", // 25%
  blue: "#0450F0", // 50%
  light: "#56A1F7", // 75%
  white: "#FFFFFF", // 100%
} as const;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (c: number[]) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

/** `a` mixed toward `b` by t (0..1). */
export function mix(a: string, b: string, t: number) {
  const [x, y] = [rgb(a), rgb(b)];
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
}
