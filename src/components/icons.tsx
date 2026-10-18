// The webdev logo (from the official lockup), and every other icon on the site from Remix Icon (remixicon.com, free
// for use in a website's UI; not for logos, and brand glyphs only for their own brand). All draw in currentColor.
import type { SVGProps } from "react";
import {
  RiChat3Fill,
  RiChat3Line,
  RiCheckLine,
  RiEyeFill,
  RiEyeLine,
  RiInstagramLine,
  RiLayoutMasonryFill,
  RiMailLine,
  RiPenNibFill,
  RiPenNibLine,
  RiPlayLargeFill,
  RiRocketFill,
  RiRocketLine,
  RiVerifiedBadgeFill,
  RiWhatsappFill,
  RiWhatsappLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import { LOGO_MARK_D, LOGO_WORDMARK_D } from "@/lib/logoPaths";

type IconProps = SVGProps<SVGSVGElement>;

function make(width: number, height: number, inner: string) {
  return function Icon(props: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        fill="none"
        aria-hidden
        {...props}
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    );
  };
}

// Icon and wordmark use tight viewBoxes taken from the official lockup SVG; at icon height h the official lockup is
// wordmark height 0.4387h, wordmark width 3.586h, gap 0.3064h.
export const LogoMark = make(107, 124.852, `<path fill-rule="evenodd" clip-rule="evenodd" d="${LOGO_MARK_D}" fill="currentColor"></path>`);
export const LogoWordmark = make(447.7, 54.77, `<path transform="translate(-145.253 -35.4007)" d="${LOGO_WORDMARK_D}" fill="currentColor"></path>`);

/** A Remix icon with the props the call sites use: width (or height) is its size; without one, CSS (size-*) sizes it. */
function remix(I: RemixiconComponentType) {
  return function Icon({ width, height, className }: Pick<IconProps, "width" | "height" | "className">) {
    return <I size={width ?? height} className={className} aria-hidden />;
  };
}

export const Check = remix(RiCheckLine);
export const PlayLarge = remix(RiPlayLargeFill);
/** Every contact button opens a WhatsApp chat. */
export const WhatsApp = remix(RiWhatsappFill);
/** Line WhatsApp, for rows of line icons (the footer contacts). */
export const WhatsAppLine = remix(RiWhatsappLine);
export const Instagram = remix(RiInstagramLine);
export const Mail = remix(RiMailLine);
export const Badge = remix(RiVerifiedBadgeFill);
// Process step glyphs
export const ProcessChat = remix(RiChat3Fill);
export const ProcessPen = remix(RiPenNibFill);
export const ProcessEye = remix(RiEyeFill);
export const ProcessStructure = remix(RiLayoutMasonryFill);
export const ProcessRocket = remix(RiRocketFill);
/** Line versions of the Process glyphs, for icons beside text (the stage details); the filled ones sit in the glass illustrations. */
export const ProcessChatLine = remix(RiChat3Line);
export const ProcessPenLine = remix(RiPenNibLine);
export const ProcessEyeLine = remix(RiEyeLine);
export const ProcessRocketLine = remix(RiRocketLine);
