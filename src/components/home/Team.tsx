"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { team, teamSocials } from "@/content/home";
import { Reveal, easeFramer } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { SlideButton } from "../SlideButton";

type Layout = { step: number; positions: number };
const layouts: Record<"phone" | "tablet" | "desktop", Layout> = {
  phone: { step: 348, positions: 7 },
  tablet: { step: 380, positions: 6 },
  desktop: { step: 380, positions: 5 },
};

function useLayout() {
  const [layout, setLayout] = useState<Layout>(layouts.desktop);
  useEffect(() => {
    const tablet = window.matchMedia("(min-width: 800px)");
    const desktop = window.matchMedia("(min-width: 1200px)");
    const update = () => setLayout(desktop.matches ? layouts.desktop : tablet.matches ? layouts.tablet : layouts.phone);
    update();
    tablet.addEventListener("change", update);
    desktop.addEventListener("change", update);
    return () => {
      tablet.removeEventListener("change", update);
      desktop.removeEventListener("change", update);
    };
  }, []);
  return layout;
}

const ease = "duration-[400ms] ease-[cubic-bezier(0.44,0,0.56,1)]";

function TeamCard({ name, role, image }: (typeof team)[number]) {
  return (
    <div className="group flex h-full w-full flex-col gap-[23px]">
      <div className="relative w-full flex-1 overflow-hidden rounded-2xl">
        <Image src={image} alt="" fill sizes="380px" className="z-[1] object-cover" />
        <div className={`absolute inset-0 z-[2] rounded-2xl shadow-[inset_0_1px_40px_0_#fff] transition-opacity lg:opacity-0 lg:group-hover:opacity-100 ${ease}`} />
        <div className={`absolute inset-x-0 bottom-0 z-[3] flex justify-center gap-1 px-6 pt-4 pb-6 transition-transform lg:translate-y-[88px] lg:group-hover:translate-y-0 ${ease}`}>
          {teamSocials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${name} di ${s.label}`}
              className="flex w-12 justify-center rounded-full bg-white-04 py-3 shadow-[inset_0_0_12px_0_#fff] transition-colors duration-300 hover:bg-white-03"
            >
              <Image src={s.icon} alt="" width={24} height={24} className="size-6" />
            </a>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1 text-center">
        <p className="t-title-l text-grey-01">{name}</p>
        <p className="t-body-l text-grey-03">{role}</p>
      </div>
    </div>
  );
}

function TeamSlider() {
  const { step, positions } = useLayout();
  const [index, setIndex] = useState(0);
  const current = Math.min(index, positions - 1);
  const go = (d: number) => setIndex((i) => (Math.min(i, positions - 1) + d + positions) % positions);

  return (
    <div className="flex w-full justify-center px-5 md:px-10 lg:px-20">
      <div className="flex w-full max-w-[1280px] flex-col gap-8">
        <div className="relative h-[560px] w-full md:w-[380px] lg:h-[600px]">
          <motion.div
            className="absolute top-0 left-0 flex h-full gap-2 md:gap-0"
            animate={{ x: -current * step }}
            transition={{ duration: 0.4, ease: easeFramer }}
          >
            {team.map((m) => (
              <div key={m.name} className="h-full w-[340px] shrink-0 md:w-[380px] md:pr-2">
                <TeamCard {...m} />
              </div>
            ))}
          </motion.div>
        </div>
        <div className="flex w-full items-center gap-10 bg-white">
          <div className="h-0.5 flex-1 rounded-full bg-grey-07">
            <motion.div
              className="-mt-px h-1 rounded-full"
              style={{ backgroundImage: "var(--holo-gradient)" }}
              animate={{ width: `${((current + 1) / positions) * 100}%` }}
              transition={{ duration: 0.4, ease: easeFramer }}
            />
          </div>
          <div className="flex gap-2">
            <SlideButton direction="left" onClick={() => go(-1)} />
            <SlideButton direction="right" onClick={() => go(1)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Team() {
  return (
    <section id="team" className="flex flex-col items-center gap-12 overflow-clip py-16 md:gap-16 md:py-20 lg:gap-20 lg:py-[100px]">
      <div className="w-full max-w-[1280px] px-5 md:px-[60px] lg:px-20">
        <SectionHeader number="009" name="komitmen kami" title="Yang selalu kamu dapat" />
      </div>
      <Reveal y={50} amount={0.2} className="w-full">
        <TeamSlider />
      </Reveal>
    </section>
  );
}
