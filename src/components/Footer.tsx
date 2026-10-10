import Link from "next/link";
import type { ReactNode } from "react";
import { contact, waLink } from "@/content/site";
import { LogoMark, LogoWordmark } from "./icons";
import { LazyVideo } from "./LazyVideo";
import { Reveal } from "./motion";

/** Glass pill matching the navbar: Instagram as a text link, WhatsApp as the light pill button. */
function ContactPill() {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[28px] bg-black/40 p-1 backdrop-blur-[20px] sm:h-14 sm:flex-row sm:gap-6 sm:rounded-full sm:py-1 sm:pr-1 sm:pl-6">
      <a
        href={contact.instagramUrl}
        target="_blank"
        rel="noreferrer"
        className="t-body-m flex items-center px-5 py-3 whitespace-nowrap text-white-02 transition-colors duration-300 hover:text-white sm:h-12 sm:p-0"
      >
        Instagram @{contact.instagram}
      </a>
      <a
        href={waLink()}
        target="_blank"
        rel="noreferrer"
        className="t-body-m-medium flex h-12 items-center rounded-full border border-white bg-white-02 px-5 whitespace-nowrap text-grey-01 transition-colors duration-300 hover:bg-white"
      >
        WhatsApp {contact.whatsappDisplay}
      </a>
    </div>
  );
}

const links = [
  { label: "Beranda", href: "/#top" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Harga", href: "/#pricing" },
  { label: "Kontak", href: "/#contact" },
];

export function Footer() {
  return (
    <div className="flex w-full flex-col gap-[112px] pb-6 md:pb-12 lg:pb-6">
      <div className="flex w-full flex-col">
        <div className="flex flex-col items-center gap-4 border-b border-white-06 pb-6 md:flex-row md:justify-center md:gap-16">
          <Reveal y={50}>
            <ContactPill />
          </Reveal>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-6 md:flex md:justify-between">
          {links.map((l) => (
            <Reveal key={l.label} y={50}>
              {/* Taller than the text (pulled back with a negative margin) for an easier tap target */}
              <Link href={l.href} className="t-body-m -my-2.5 inline-flex py-2.5 text-white transition-opacity hover:opacity-70">
                {l.label}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="relative flex w-full flex-col gap-6 md:h-20 md:flex-row md:items-center md:justify-between md:gap-0">
        {/* Official lockup proportions: wordmark is ~44% of the icon height, with a ~30% gap */}
        <div className="flex h-20 items-center text-white md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2">
          {/* The fade spans icon and wordmark together, so the lockup reads as one mark */}
          <div className="flex items-center gap-[17.16px] mask-[linear-gradient(180deg,#000_0%,rgba(0,0,0,0.4)_100%)]">
            <LogoMark width={48} height={56} className="shrink-0" />
            <LogoWordmark width={200.81} height={24.57} className="shrink-0" />
          </div>
        </div>
        <p className="t-body-s text-white-03">© 2026 webdev.co.id</p>
        <p className="t-body-s text-white-03">Studio web lokal, standar&nbsp;global.</p>
      </div>
    </div>
  );
}

/** The brand gradient the footer is tinted with, top to bottom (light blue → blue → navy → black). */
const tint =
  "bg-[linear-gradient(180deg,var(--color-holo-75)_0%,var(--color-holo-50)_40%,var(--color-holo-25)_75%,var(--color-holo-0)_100%)]";

/**
 * Footer band with the looping background video, shared by the page footer and the 404 page.
 * `fadeClassName` sets --fade, how far the white page above eases into the blue (see .footer-fade).
 */
export function FooterSection({
  children,
  className = "",
  fadeClassName = "[--fade:10rem] md:[--fade:12rem]",
}: {
  children: ReactNode;
  className?: string;
  fadeClassName?: string;
}) {
  return (
    <footer className={`relative isolate overflow-hidden bg-holo-25 px-5 md:px-10 lg:px-20 ${fadeClassName} ${className}`}>
      <div aria-hidden className="absolute inset-0">
        {/* Plain blue, the colour the tinted video would be if it were all white */}
        <div className={`absolute inset-0 ${tint}`} />
        {/* The greyscale video tinted in the same blues (multiply turns its whites blue and keeps its blacks),
            masked so it only eases in below the white fade */}
        <div className="footer-video absolute inset-0">
          <LazyVideo className="absolute inset-0 size-full object-cover" src="/videos/footer.mp4" />
          <div className={`absolute inset-0 ${tint} mix-blend-multiply`} />
        </div>
        <div className="footer-fade absolute inset-x-0 top-0" />
      </div>
      <div className="relative z-[3] mx-auto w-full max-w-[1280px]">{children}</div>
    </footer>
  );
}

/**
 * Footer at the bottom of the page. Its background is pulled up behind the FAQ section (negative
 * margin, matched by extra padding), so the blue rises into the FAQ. "Kontak" links to the
 * WhatsApp / Instagram row.
 */
export function SiteFooter() {
  return (
    <FooterSection className="-mt-110 md:-mt-130 lg:-mt-170" fadeClassName="[--fade:300px] md:[--fade:380px] lg:[--fade:520px]">
      <div className="pt-140 md:pt-160 lg:pt-200">
        <div id="contact" className="scroll-mt-24">
          <Footer />
        </div>
      </div>
    </FooterSection>
  );
}
