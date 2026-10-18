import { RiAddLine, RiArrowLeftLine, RiArrowRightLine, RiArrowRightUpLine } from "@remixicon/react";

/**
 * Button icons (Remix Icon), bolder than stock to sit with the liquid metal pills: a 1-unit stroke in currentColor
 * thickens Remix's 2-unit lines to about 3, and the icon draws 1.27× larger than its box (Remix pads its glyphs)
 * with the overflow taken back by a negative margin, so `size` is still the glyph's footprint. Sizes follow the
 * pill: ~0.56× the label size next to text (9px for 16px labels), and ~28% of a round icon-only button (14px in 48px).
 */
const icons = {
  plus: RiAddLine,
  "arrow-right": RiArrowRightLine,
  "arrow-left": RiArrowLeftLine,
  "arrow-up-right": RiArrowRightUpLine,
};

type LineIconName = keyof typeof icons;

export function LineIcon({ name, size, className = "" }: { name: LineIconName; size: number; className?: string }) {
  const I = icons[name];
  const drawn = size * 1.27;
  return (
    <I
      size={drawn}
      aria-hidden
      stroke="currentColor"
      strokeWidth={1}
      strokeLinejoin="round"
      className={`shrink-0 overflow-visible ${className}`}
      style={{ margin: (size - drawn) / 2 }}
    />
  );
}
