"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { projects } from "@/content/portfolio";
import { ProjectCard } from "../ProjectCard";
import { Reveal, easeFramer } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { SlideButton } from "../SlideButton";

const tween = { duration: 0.5, ease: easeFramer };

function ProjectSlider() {
  const [index, setIndex] = useState(0);
  const count = projects.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  return (
    <div className="relative flex w-full flex-col items-center gap-4">
      {/* Padded (and pulled back with a negative margin) so the tilted image has room inside the clip */}
      <div className="-m-6 self-stretch overflow-hidden p-6">
        <motion.div className="flex" initial={false} animate={{ x: `${-index * 100}%` }} transition={tween}>
          {projects.map((project, i) => (
            <motion.div
              key={project.slug}
              className="w-full shrink-0"
              animate={i === index ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={tween}
              aria-hidden={i !== index}
              inert={i !== index}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      </div>
      {/* On desktop this row spans the card; only the buttons take the pointer, so the image keeps its hover */}
      <div className="z-[5] flex items-center justify-center gap-2.5 lg:pointer-events-none lg:absolute lg:inset-x-[-64px] lg:top-1/2 lg:-translate-y-1/2 lg:justify-between">
        <SlideButton direction="left" onClick={() => go(-1)} className="pointer-events-auto" />
        <SlideButton direction="right" onClick={() => go(1)} className="pointer-events-auto" />
      </div>
    </div>
  );
}

export function Portfolio() {
  return (
    <section id="portfolio" className="flex justify-center px-5 py-16 md:px-10 md:py-20 lg:px-20 lg:py-[100px]">
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-12 md:gap-16 lg:gap-20">
        <SectionHeader number="005" name="portfolio" title="Karya yang sudah tayang" />
        <Reveal y={50} amount={0.2} className="w-full max-w-[640px] lg:max-w-[1040px] lg:px-16">
          <ProjectSlider />
        </Reveal>
      </div>
    </section>
  );
}
