import { RiArrowRightUpLine } from "@remixicon/react";
import { waLink } from "@/content/site";
import { LiquidMetal } from "./LiquidMetal";

type ArrowButtonProps = {
  children: React.ReactNode;
  /** Where it goes; a WhatsApp chat by default. Always opens in a new tab. */
  href?: string;
  /** "dark": the liquid metal pill, for the blue cards. "light": the navbar's pale pill. "outline": the small
   *  outline pill on light cards (the portfolio's "Kunjungi Situs"). */
  tone?: "dark" | "light" | "outline";
  /** "nav": the small button size (48px tall, 20px sides, 16px semibold, as the outline button), with tighter
   *  padding on phones; below 390px only the circle shows (the label doesn't fit). */
  size?: "default" | "nav";
  className?: string;
  label?: string;
};

/** A soft spring: a small overshoot, like the Framer original's bounce 0.2. */
const spring = "duration-[450ms] ease-[cubic-bezier(0.34,1.36,0.64,1)]";
const arrowIn = "transition-[opacity,transform] duration-300 group-hover:scale-100 group-hover:opacity-100 group-hover:delay-100 group-focus-visible:scale-100 group-focus-visible:opacity-100";

/**
 * The hover circle. Its slot in the row only grows in width (at a fixed height), and the circle itself floats in the
 * slot's centre, so the spring's overshoot never changes the row's height and nothing around it bobs up and down.
 * `slot` sizes the slot when open, `open` the circle.
 */
function Circle({ slot, open, className = "", children }: { slot: string; open: string; className?: string; children: React.ReactNode }) {
  return (
    <span aria-hidden className={`relative -ml-1 w-1 shrink-0 transition-[width,margin] group-hover:ml-1 group-focus-visible:ml-1 ${spring} ${slot}`}>
      <span
        className={`absolute top-1/2 left-1/2 grid size-1 -translate-1/2 place-items-center rounded-full opacity-0 transition-[width,height,opacity] group-hover:opacity-100 group-focus-visible:opacity-100 ${spring} ${className} ${open}`}
      >
        {children}
      </span>
    </span>
  );
}

/**
 * The pill button with the hover of the Framer "Button Hover Effect": a circle with an arrow that springs out beside it.
 * Used for "Konsultasi Gratis" (a WhatsApp chat, the default link) and the portfolio's "Kunjungi Situs".
 * - dark (the blue cards): the liquid metal pill and a liquid metal circle, lit together; on hover the pill
 *   tightens and the circle springs out of its right end; the pill itself doesn't move.
 * - light (the navbar): the pale pill; the circle grows in the row while the pill tightens, so the navbar barely
 *   changes width; below 390px only the circle shows (the label doesn't fit).
 * - outline (the portfolio cards): the small outline pill, which fills dark on hover as the dark circle comes out.
 */
export function ArrowButton({ children, href, tone = "dark", size = "default", className = "", label }: ArrowButtonProps) {
  const link = { href: href ?? waLink(), target: "_blank", rel: "noreferrer", "aria-label": label };

  if (tone === "outline") {
    return (
      <a {...link} className={`group inline-flex shrink-0 items-center rounded-full outline-none ${className}`}>
        {/* 48px with 20px sides, border included: the small size, as in the navbar */}
        <span
          className={`t-button flex h-12 items-center rounded-full border border-grey-01/20 px-[19px] whitespace-nowrap text-grey-01 transition-[padding,background-color,border-color,color] group-hover:border-grey-01 group-hover:bg-grey-01 group-hover:px-3.5 group-hover:text-white group-focus-visible:border-grey-01 group-focus-visible:bg-grey-01 group-focus-visible:px-3.5 group-focus-visible:text-white ${spring}`}
        >
          {children}
        </span>
        <Circle className="bg-grey-01 text-white" open="group-hover:size-12 group-focus-visible:size-12" slot="h-12 group-hover:w-12 group-focus-visible:w-12">
          <RiArrowRightUpLine className={`size-4.5 shrink-0 scale-50 opacity-0 ${arrowIn}`} />
        </Circle>
      </a>
    );
  }

  if (tone === "dark") {
    return (
      // the button grows 37px when open (the circle and its gap, less the 2 × 10px the pill gives up); the same
      // negative right margin keeps its footprint, so the pill stays put even when centred (Pricing)
      <a
        {...link}
        className={`group inline-flex shrink-0 items-center rounded-full outline-none transition-[margin] hover:-mr-[37px] focus-visible:-mr-[37px] ${spring} ${className}`}
      >
        {/* the liquid metal pill, at its usual size; it tightens a little as the circle comes out */}
        <span className={`relative flex rounded-full px-[26px] py-4 transition-[padding] group-hover:px-4 group-focus-visible:px-4 ${spring}`}>
          <LiquidMetal litByLink />
          <span className="t-button relative z-[1] flex h-[21px] items-center whitespace-nowrap text-white">{children}</span>
        </span>
        {/* the circle, liquid metal too: a dot tucked into the pill's end that springs out with the arrow */}
        <Circle open="group-hover:size-13.25 group-focus-visible:size-13.25" slot="h-13.25 group-hover:w-13.25 group-focus-visible:w-13.25">
          <LiquidMetal litByLink />
          <RiArrowRightUpLine className={`relative z-[1] size-5 scale-50 text-white opacity-0 ${arrowIn}`} />
        </Circle>
      </a>
    );
  }

  const nav = size === "nav";
  return (
    <a {...link} className={`group inline-flex shrink-0 items-center rounded-full outline-none ${className}`}>
      <span
        className={`flex items-center justify-center rounded-full border border-white bg-white-02 whitespace-nowrap text-grey-01 transition-[padding,background-color] group-hover:bg-white ${spring} ${
          nav
            ? "t-button h-12 px-4 group-hover:px-3 group-focus-visible:px-3 max-[389px]:hidden sm:px-5 sm:group-hover:px-3.5 sm:group-focus-visible:px-3.5"
            : "t-button h-13.25 px-13.5 group-hover:px-8 group-focus-visible:px-8"
        }`}
      >
        {/* one inline box, so a label split across elements ("Konsultasi" + " Gratis") keeps its space */}
        <span>{children}</span>
      </span>
      {/* the dot: tucked into the pill's end, then a circle with the arrow */}
      <Circle
        className="overflow-hidden bg-white text-grey-01"
        open={nav ? "group-hover:size-12 group-focus-visible:size-12 max-[389px]:!size-12 max-[389px]:!opacity-100" : "group-hover:size-13.25 group-focus-visible:size-13.25"}
        slot={nav ? "h-12 group-hover:w-12 group-focus-visible:w-12 max-[389px]:!ml-0 max-[389px]:!w-12" : "h-13.25 group-hover:w-13.25 group-focus-visible:w-13.25"}
      >
        <RiArrowRightUpLine className={`shrink-0 scale-50 opacity-0 ${arrowIn} ${nav ? "size-4.5 max-[389px]:scale-100 max-[389px]:opacity-100" : "size-5"}`} />
      </Circle>
    </a>
  );
}
