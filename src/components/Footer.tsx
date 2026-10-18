import type { ReactNode } from "react";
import { contact, waLink } from "@/content/site";
import { Instagram, LogoMark, LogoWordmark, Mail, WhatsAppLine } from "./icons";
import { LazyVideo } from "./LazyVideo";
import { Reveal } from "./motion";

const contacts = [
  { label: "Instagram", value: `@${contact.instagram}`, href: contact.instagramUrl, Icon: Instagram, external: true },
  { label: "Email", value: contact.email, href: `mailto:${contact.email}`, Icon: Mail, external: false },
  { label: "WhatsApp", value: contact.whatsappDisplay, href: waLink(), Icon: WhatsAppLine, external: true },
];

/** The three contacts as plain icon + address links in one row (stacked below md), right under the closing line. */
function Contacts() {
  return (
    <div className="flex flex-col items-center gap-1 md:flex-row md:justify-center md:gap-10">
      {contacts.map(({ label, value, href, Icon, external }) => (
        <a
          key={label}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          aria-label={`${label} ${value}`}
          className="t-body-l flex h-11 items-center gap-2.5 whitespace-nowrap text-white-02 transition-colors duration-300 hover:text-white"
        >
          <Icon width={18} height={18} className="shrink-0" />
          {value}
        </a>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <div className="flex w-full flex-col gap-28 pb-6 md:gap-32 md:pb-12 lg:gap-36 lg:pb-6">
      <Reveal y={50}>
        <Contacts />
      </Reveal>

      {/* Sign-off: a hairline, then © · logo · tagline (stacked and centred on phones) */}
      <div className="border-t border-white-06 pt-8 md:pt-10">
        <div className="relative flex w-full flex-col items-center gap-3 text-center md:h-20 md:flex-row md:justify-between md:gap-0 md:text-left">
        {/* Official lockup proportions: wordmark is ~44% of the icon height, with a ~30% gap */}
          <div className="mb-2 flex h-20 items-center text-white md:absolute md:bottom-0 md:left-1/2 md:mb-0 md:-translate-x-1/2">
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
      {/* Its own GPU layer: when the content above changes height (FAQ answers opening), the footer just
          moves instead of re-rasterising the video, blend and masks every frame */}
      <div aria-hidden className="absolute inset-0 will-change-transform">
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
 * margin, matched by extra padding), so the blue rises into the FAQ. #contact anchors the closing
 * line and the contacts.
 */
export function SiteFooter() {
  return (
    <FooterSection className="-mt-110 md:-mt-130 lg:-mt-170" fadeClassName="[--fade:300px] md:[--fade:380px] lg:[--fade:520px]">
      <div className="pt-156 md:pt-176 lg:pt-216">
        <div id="contact" className="scroll-mt-24">
          {/* Closing call to action, right above the contacts */}
          <Reveal y={40} className="mb-4 flex justify-center text-center md:mb-5">
            <h2 className="t-h2 max-w-[12em] text-balance text-white">Siap bawa bisnismu online?</h2>
          </Reveal>
          <Footer />
        </div>
      </div>
    </FooterSection>
  );
}
