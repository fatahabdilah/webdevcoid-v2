import Image from "next/image";
import Link from "next/link";
import { LineIcon } from "./LineIcon";
import { LiquidMetal } from "./LiquidMetal";

type ButtonProps = {
  href: string;
  children: string;
  variant?: "primary" | "secondary" | "tertiary";
  className?: string;
  /** Stretch to the parent width (pricing buttons). */
  block?: boolean;
  /** An arrow after the label. */
  arrow?: boolean;
  /** A plus before the label (as on threeui's "Sign up" pill). */
  plus?: boolean;
  /** Tertiary button on a dark background: white text. */
  light?: boolean;
  /** Grey, low-emphasis primary button (pricing cards that aren't highlighted). Primary buttons
   *  that are neither muted nor inverted get the liquid metal effect. */
  muted?: boolean;
  /** White primary button in a brand-gradient ring, for blue surfaces (the highlighted pricing card). */
  inverted?: boolean;
};

/** Paint-only: padding/size must never animate, or swapping between variants (pricing hover) makes the button grow for a moment. */
const transition = "transition-[color,background-color,box-shadow,opacity] duration-[350ms] ease-[cubic-bezier(0.44,0,0.56,1)]";

/** Button text, in a fixed 21px line box so every variant keeps its height. */
function Label({ children, dark, className = "" }: { children: string; dark?: boolean; className?: string }) {
  return (
    <span className={`t-button flex h-[21px] items-center whitespace-nowrap ${transition} ${dark ? "text-grey-01" : "text-white"} ${className}`}>
      {children}
    </span>
  );
}

function Avatars() {
  return (
    <span className="relative block h-7 w-12 shrink-0">
      {["n8zXCidbrBUAQChuau8L7G7DhQ", "xeCVP2BCTEN80S79boVREIjGMB0"].map((id, i) => (
        <Image
          key={id}
          src={`/framer/${id}.png`}
          alt=""
          width={28}
          height={28}
          className={`absolute top-0 size-7 rounded-full border border-white-05 object-cover ${i === 0 ? "left-0" : "right-0"}`}
        />
      ))}
    </span>
  );
}

export function Button({ href, children, variant = "primary", className = "", block, arrow, plus, muted, light, inverted }: ButtonProps) {
  const icon = arrow || plus;
  const external = /^https?:/.test(href) || href.startsWith("mailto:");
  const liquid = variant === "primary" && !muted && !inverted;
  const inner = liquid ? (
    // Same 53px height as the muted pill (2px ring + 49px body), so pricing buttons line up.
    <span className={`relative z-[1] flex items-center justify-center px-[26px] py-4 ${icon ? "gap-1.75" : "gap-2"} ${block ? "w-full" : ""}`}>
      {plus && <LineIcon name="plus" size={9} className="text-white" />}
      <Label>{children}</Label>
      {arrow && <LineIcon name="arrow-right" size={9} className="text-white" />}
    </span>
  ) : variant === "primary" ? (
    <span
      className={`flex items-center justify-center rounded-full px-6 py-3.5 ${icon ? "gap-1.75" : "gap-2"} ${transition} ${
        inverted
          ? "bg-white shadow-[inset_0_0_16px_0_rgba(4,80,240,0.5)] group-hover:shadow-[inset_0_0_20px_0_rgba(4,80,240,0.65)]"
          : "bg-grey-06 shadow-[inset_0_0_16px_0_rgba(255,255,255,0.5)] group-hover:shadow-[inset_0_0_20px_0_rgba(255,255,255,0.6)]"
      } ${block ? "w-full" : ""}`}
    >
      {plus && <LineIcon name="plus" size={9} className="text-grey-01" />}
      <Label dark>{children}</Label>
      {arrow && <LineIcon name="arrow-right" size={9} className="text-grey-01" />}
    </span>
  ) : variant === "secondary" ? (
    <span
      className={`flex items-center justify-center gap-2 rounded-full bg-white-04 px-6 py-3.5 shadow-[inset_0_0_16px_0_#fff] backdrop-blur-sm ${transition} group-hover:shadow-[inset_0_0_24px_0_#fff]`}
    >
      <Avatars />
      <Label>{children}</Label>
    </span>
  ) : (
    // Outline pill so it reads as clickable; fills on hover
    <span
      className={`flex items-center rounded-full border px-5 py-2.5 ${transition} ${
        light ? "border-white/40 group-hover:border-white group-hover:bg-white" : "border-grey-01/20 group-hover:border-grey-01 group-hover:bg-grey-01"
      }`}
    >
      <Label dark={!light} className={light ? "group-hover:text-grey-01" : "group-hover:text-white"}>
        {children}
      </Label>
    </span>
  );

  const outer = `group relative inline-flex rounded-full ${variant === "primary" && !liquid ? "p-0.5" : ""} ${inverted ? "bg-[image:var(--holo-gradient)]" : ""} ${block ? "w-full" : ""} ${className}`;
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
