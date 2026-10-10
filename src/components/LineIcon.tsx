/**
 * Button icons in the style of the threeui liquid metal pill's "+": round-capped, round-joined
 * strokes 17 units thick in a 115-unit box, so the stroke stays ~15% of the icon at any size.
 * Sizes follow the pill: ~0.56× the label size next to text (9px for 16px labels), and ~28% of
 * a round icon-only button (14px in 48px).
 */
const paths = {
  plus: ["M57.5 8.5V106.5", "M8.5 57.5H106.5"],
  "arrow-right": ["M8.5 57.5H106.5", "M64 15L106.5 57.5L64 100"],
  "arrow-left": ["M106.5 57.5H8.5", "M51 15L8.5 57.5L51 100"],
};

type LineIconName = keyof typeof paths;

export function LineIcon({ name, size, className = "" }: { name: LineIconName; size: number; className?: string }) {
  return (
    <svg viewBox="0 0 115 115" width={size} height={size} aria-hidden className={`shrink-0 overflow-visible ${className}`}>
      <g fill="none" stroke="currentColor" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round">
        {paths[name].map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
