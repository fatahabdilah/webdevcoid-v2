"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { waLink } from "@/content/site";
import { useIntroEntered } from "@/lib/intro";
import { ANIMATIONS_ENABLED, easeFramer } from "./motion";
import { LogoMark, LogoWordmark, PhoneCalling } from "./icons";

const links = [
  { title: "Tentang", href: "/#about" },
  { title: "Portfolio", href: "/#portfolio" },
  { title: "Harga", href: "/#pricing" },
];

export function Navbar() {
  // Slides in once the intro opens onto the page
  const entered = useIntroEntered();
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-8">
      <motion.nav
        className="pointer-events-auto relative z-10 flex items-center gap-1"
        initial={ANIMATIONS_ENABLED ? { opacity: 0, y: -40 } : false}
        animate={!ANIMATIONS_ENABLED || entered ? { opacity: 1, y: 0 } : { opacity: 0, y: -40 }}
        transition={{ duration: 0.8, delay: 0.4, ease: easeFramer }}
      >
        {/* "#top" lets Lenis smooth-scroll to the top on the home page, like the section links */}
        <Link
          href="/#top"
          aria-label="webdev.co.id beranda"
          className="group relative z-[2] flex h-14 shrink-0 items-center rounded-full bg-black/40 px-4 text-white backdrop-blur-[40px] max-[359px]:px-3"
        >
          <LogoMark width={24} height={28} className="shrink-0" />
          {/* Wordmark slides open on hover/focus: the grid column eases from 0fr to 1fr, so the width animates smoothly */}
          <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-500 ease-framer group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
            <span className="min-w-0 overflow-hidden">
              <LogoWordmark
                width={100.4}
                height={12.28}
                className="mr-1 ml-[8.58px] block opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-150 group-focus-visible:opacity-100"
              />
            </span>
          </span>
        </Link>

        <div className="relative z-[2] flex h-14 items-center gap-3 rounded-full bg-black/40 py-1 pr-1 pl-4 backdrop-blur-[20px] max-[359px]:pl-3 sm:gap-6 sm:pl-6">
          <ul className="flex items-center gap-3.5 max-[359px]:gap-2.5 sm:gap-6">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="t-body-s sm:t-body-m flex h-12 items-center text-white-02 transition-colors duration-300 hover:text-white"
                >
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
          {/* "Konsultasi Gratis" from 640px, "Konsultasi" on most phones, and a phone icon below 390px
              (logo, three links and a text button don't fit in narrower screens) */}
          <a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            aria-label="Konsultasi gratis via WhatsApp"
            className="flex h-12 shrink-0 items-center justify-center rounded-full border border-white bg-white-02 whitespace-nowrap text-grey-01 transition-colors duration-300 hover:bg-white max-[389px]:w-12 min-[390px]:px-4 sm:px-5"
          >
            <PhoneCalling width={22} height={22} className="min-[390px]:hidden" />
            <span className="t-body-s font-medium max-[389px]:hidden sm:t-body-m-medium">
              Konsultasi<span className="hidden sm:inline"> Gratis</span>
            </span>
          </a>
        </div>
      </motion.nav>
    </header>
  );
}
