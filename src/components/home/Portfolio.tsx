"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimate, useInView, type PanInfo } from "motion/react";
import { projects } from "@/content/portfolio";
import { STACKED_QUERY, useMedia } from "@/lib/useMedia";
import { ProjectCard } from "../ProjectCard";
import { Reveal, easeFramer } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { SlideButton } from "../SlideButton";

const tween = { duration: 0.5, ease: easeFramer };

/** A swipe counts once it travels this far, or is flicked this fast. */
const SWIPE_PX = 60;
const SWIPE_VELOCITY = 400;

function ProjectSlider() {
  const [index, setIndex] = useState(0);
  const count = projects.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  // Phones and tablets: swipe, arrows on the image and a one-time nudge that shows the card moves
  const stacked = useMedia(STACKED_QUERY);
  const [nudge, animateNudge] = useAnimate<HTMLDivElement>();
  const inView = useInView(nudge, { once: true, amount: 0.6 });
  const nudged = useRef(false);

  useEffect(() => {
    if (!stacked || !inView || nudged.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    nudged.current = true;
    animateNudge(nudge.current, { x: [0, -36, 0] }, { duration: 1, ease: easeFramer, delay: 0.5 });
  }, [stacked, inView, animateNudge, nudge]);

  const onDragEnd = (_: PointerEvent, { offset, velocity }: PanInfo) => {
    if (offset.x < -SWIPE_PX || velocity.x < -SWIPE_VELOCITY) go(1);
    else if (offset.x > SWIPE_PX || velocity.x > SWIPE_VELOCITY) go(-1);
  };

  return (
    <div className="relative flex w-full flex-col items-center gap-5">
      {/* Padded (and pulled back with a negative margin) so the tilted image has room inside the clip */}
      <div className="-m-6 self-stretch overflow-hidden p-6">
        <motion.div ref={nudge}>
          {/* Follows the finger (springing back) and changes slide on release; vertical scrolling still works */}
          <motion.div
            drag={stacked ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            dragMomentum={false}
            onDragEnd={onDragEnd}
            className={stacked ? "cursor-grab active:cursor-grabbing" : undefined}
          >
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
          </motion.div>
        </motion.div>
      </div>

      {/* Phones and tablets: arrows either side of the image, centred on it */}
      <div className="pointer-events-none absolute inset-x-4 top-[168px] z-[5] flex -translate-y-1/2 justify-between md:top-[208px] lg:hidden">
        <SlideButton direction="left" small onClick={() => go(-1)} className="pointer-events-auto" />
        <SlideButton direction="right" small onClick={() => go(1)} className="pointer-events-auto" />
      </div>
      {/* Desktop: arrows outside the card; only the buttons take the pointer, so the image keeps its hover */}
      <div className="pointer-events-none absolute inset-x-[-64px] top-1/2 z-[5] hidden -translate-y-1/2 justify-between lg:flex">
        <SlideButton direction="left" onClick={() => go(-1)} className="pointer-events-auto" />
        <SlideButton direction="right" onClick={() => go(1)} className="pointer-events-auto" />
      </div>

      {/* Position dots (also buttons) */}
      <div className="flex items-center gap-1.5">
        {projects.map((project, i) => (
          <button
            key={project.slug}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Karya ${i + 1} dari ${count}`}
            aria-current={i === index}
            className="flex h-6 cursor-pointer items-center px-0.5"
          >
            <span className={`block h-2 rounded-full transition-[width,background-color] duration-500 ease-framer ${i === index ? "w-6 bg-grey-01" : "w-2 bg-grey-06"}`} />
          </button>
        ))}
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
