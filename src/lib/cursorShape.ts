/**
 * Cursor outline that morphs between the arrow (t = 0) and a circle (t = 1).
 *
 * Both shapes are the same closed path of 8 cubic segments, so the morph is a straight per-point blend.
 * The circle's segment ends sit at the same angles (around the artboard centre) as the arrow's corners,
 * so every point travels radially and the outline never folds over itself mid-morph.
 */

type Pt = [number, number];

/** Devices that get the custom cursor (precise hovering pointer, wide enough, motion allowed). */
export const CUSTOM_CURSOR_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)";

/** Cursor size in px. */
export const CURSOR_SIZE = 26;

/** Artboard (shared with the original arrow icon) and its centre, which sits on the pointer. */
export const VIEW_W = 50;
export const VIEW_H = 54;
const CENTER: Pt = [VIEW_W / 2, VIEW_H / 2];
/** Circle radius in artboard units. */
const RADIUS = 14;

/** Arrow outline: start point, then 8 segments as [control 1, control 2, end]. Straight edges become cubics on the line. */
const line = (a: Pt, b: Pt): Pt[] => [
  [a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3],
  [a[0] + ((b[0] - a[0]) * 2) / 3, a[1] + ((b[1] - a[1]) * 2) / 3],
  b,
];
const START: Pt = [42.6817, 41.1495];
const ARROW: Pt[] = (() => {
  const pts: Pt[] = [START];
  const last = () => pts[pts.length - 1];
  pts.push(...line(last(), [27.5103, 6.79925])); // right edge, up to the tip
  pts.push([26.7269, 5.02557], [24.2082, 5.02558], [23.3927, 6.79925]); // rounded tip
  pts.push(...line(last(), [7.59814, 41.1495])); // left edge
  pts.push([6.75833, 42.9759], [8.52712, 44.8902], [10.4125, 44.1954]); // left wing
  pts.push(...line(last(), [24.3757, 39.0496])); // lower left edge, into the notch
  pts.push([24.8829, 38.8627], [25.4385, 38.8627], [25.9422, 39.0496]); // notch
  pts.push(...line(last(), [39.8121, 44.1954])); // lower right edge
  pts.push([41.6849, 44.8902], [43.4884, 42.9759], START); // right wing, back to start
  return pts;
})();

/** Circle with the same structure: each arc ends at the angle of the matching arrow point. */
const CIRCLE: Pt[] = (() => {
  const angleOf = ([x, y]: Pt) => Math.atan2(y - CENTER[1], x - CENTER[0]);
  const at = (a: number): Pt => [CENTER[0] + RADIUS * Math.cos(a), CENTER[1] + RADIUS * Math.sin(a)];
  // Segment end angles, unwrapped so they keep turning the same way as the arrow outline
  const ends = [0, 3, 6, 9, 12, 15, 18, 21, 24].map((i) => angleOf(ARROW[i]));
  for (let i = 1; i < ends.length; i++) {
    while (ends[i] > ends[i - 1]) ends[i] -= 2 * Math.PI;
  }
  ends[ends.length - 1] = ends[0] - 2 * Math.PI;
  const pts: Pt[] = [at(ends[0])];
  for (let i = 0; i < 8; i++) {
    const a0 = ends[i];
    const a1 = ends[i + 1];
    const k = (4 / 3) * Math.tan((a1 - a0) / 4) * RADIUS; // signed handle length for this arc
    const p0 = at(a0);
    const p1 = at(a1);
    pts.push([p0[0] - k * Math.sin(a0), p0[1] + k * Math.cos(a0)], [p1[0] + k * Math.sin(a1), p1[1] - k * Math.cos(a1)], p1);
  }
  return pts;
})();

const fmt = (n: number) => n.toFixed(3);

/** SVG path for the shape at morph progress (0 = arrow, 1 = circle; clamped). */
export function cursorPath(progress: number): string {
  const t = Math.min(1, Math.max(0, progress));
  const p = ARROW.map(([x, y], i): Pt => [x + (CIRCLE[i][0] - x) * t, y + (CIRCLE[i][1] - y) * t]);
  let d = `M${fmt(p[0][0])} ${fmt(p[0][1])}`;
  for (let i = 1; i < p.length; i += 3) {
    d += `C${fmt(p[i][0])} ${fmt(p[i][1])} ${fmt(p[i + 1][0])} ${fmt(p[i + 1][1])} ${fmt(p[i + 2][0])} ${fmt(p[i + 2][1])}`;
  }
  return d + "Z";
}
