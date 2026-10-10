import Link from "next/link";
import { LineIcon } from "./LineIcon";
import { LiquidMetal } from "./LiquidMetal";

type ButtonProps = {
  href: string;
  children: string;
  /** "primary": filled pill (liquid metal by default). "tertiary": outline pill for secondary links. */
  variant?: "primary" | "tertiary";
  className?: string;
  /** Stretch to the parent width (pricing buttons). */
  block?: boolean;
  /** An arrow after the label. */
  arrow?: boolean;
  /** Grey, low-emphasis primary button (pricing cards that aren't highlighted). Primary buttons
   *  that are neither muted nor inverted get the liquid metal effect. */
  muted?: boolean;
  /** White primary button in a brand-gradient ring, for blue surfaces (the highlighted pricing card). */
  inverted?: boolean;
};

/** Paint-only: padding/size must never animate, or swapping between variants (pricing hover) makes the button grow for a moment. */
const transition = "transition-[color,background-color,border-color,box-shadow,opacity] duration-[350ms] ease-framer";

/** Button text, in a fixed 21px line box so every variant keeps its height. */
function Label({ children, dark, className = "" }: { children: string; dark?: boolean; className?: string }) {
  return (
    <span className={`t-button flex h-[21px] items-center whitespace-nowrap ${transition} ${dark ? "text-grey-01" : "text-white"} ${className}`}>
      {children}
    </span>
  );
}

export function Button({ href, children, variant = "primary", className = "", block, arrow, muted, inverted }: ButtonProps) {
  const external = /^https?:/.test(href) || href.startsWith("mailto:");
  const liquid = variant === "primary" && !muted && !inverted;
  const width = block ? "w-full" : "";

  const inner = liquid ? (
    // Same 53px height as the muted pill (2px ring + 49px body), so pricing buttons line up.
    <span className={`relative z-[1] flex items-center justify-center px-[26px] py-4 ${arrow ? "gap-1.75" : "gap-2"} ${width}`}>
      <Label>{children}</Label>
      {arrow && <LineIcon name="arrow-right" size={9} className="text-white" />}
    </span>
  ) : variant === "primary" ? (
    <span
      className={`flex items-center justify-center rounded-full px-6 py-3.5 ${arrow ? "gap-1.75" : "gap-2"} ${transition} ${
        inverted
          ? "bg-white shadow-[inset_0_0_16px_0_rgba(4,80,240,0.5)] group-hover:shadow-[inset_0_0_20px_0_rgba(4,80,240,0.65)]"
          : "bg-grey-06 shadow-[inset_0_0_16px_0_rgba(255,255,255,0.5)] group-hover:shadow-[inset_0_0_20px_0_rgba(255,255,255,0.6)]"
      } ${width}`}
    >
      <Label dark>{children}</Label>
      {arrow && <LineIcon name="arrow-right" size={9} className="text-grey-01" />}
    </span>
  ) : (
    // Outline pill so it reads as clickable; fills on hover
    <span className={`flex items-center rounded-full border border-grey-01/20 px-5 py-2.5 ${transition} group-hover:border-grey-01 group-hover:bg-grey-01`}>
      <Label dark className="group-hover:text-white">
        {children}
      </Label>
    </span>
  );

  const outer = `group relative inline-flex rounded-full ${variant === "primary" && !liquid ? "p-0.5" : ""} ${inverted ? "bg-[image:var(--holo-gradient)]" : ""} ${width} ${className}`;
  const content = (
    <>
      {liquid && <LiquidMetal />}
      {inner}
    </>
  );

  if (external) {
    return (
      <a href={href} className={outer} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={outer}>
      {content}
    </Link>
  );
}
