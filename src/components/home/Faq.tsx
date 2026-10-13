"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { faqs } from "@/content/home";
import { LineIcon } from "../LineIcon";
import { Reveal, easeFramer } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { noOrphan } from "@/lib/text";

const tween = { duration: 0.4, ease: easeFramer };
const fade = "transition-opacity duration-[400ms] ease-framer";

function FaqItem({ index, q, a, open, onToggle }: { index: number; q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-grey-07 bg-grey-09/90 shadow-[var(--shadow-card)]">
      {/* Holographic outline that appears while open */}
      <div aria-hidden className={`absolute inset-0 rounded-2xl p-0.5 ${fade} ${open ? "opacity-100" : "opacity-0"}`} style={{ backgroundImage: "var(--holo-gradient)" }}>
        <div className="size-full rounded-[14px] bg-white" />
      </div>

      <div className="relative z-[1] p-5 md:p-6">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full cursor-pointer items-center gap-3 text-left md:gap-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border-[0.5px] border-grey-07 bg-grey-08 shadow-[inset_0_0_1px_2px_#fff,inset_0_-2px_1px_0_rgba(0,0,0,0.12)]">
            <span className="t-body-s text-grey-01">{index + 1}</span>
          </span>
          <span className="t-title-s flex-1 text-grey-01 max-md:text-[17px]">{noOrphan(q)}</span>
          <span className="relative flex size-10 shrink-0 md:size-12 items-center justify-center overflow-hidden rounded-full bg-grey-01 shadow-[inset_0_0_8px_0_#fff]">
            <span aria-hidden className={`absolute inset-0 rounded-full p-px ${fade} ${open ? "opacity-100" : "opacity-0"}`} style={{ backgroundImage: "var(--holo-gradient)" }}>
              <span className="block size-full rounded-full bg-white" />
            </span>
            <motion.span
              className="relative z-[2] flex"
              initial={false}
              animate={{ rotate: open ? -45 : 0, color: open ? "#1a1a1a" : "#ffffff" }}
              transition={tween}
            >
              <LineIcon name="plus" size={14} />
            </motion.span>
          </span>
        </button>
        {/* Answer: the grid row eases between 0fr and 1fr in CSS, so the browser animates the height
            itself instead of JavaScript measuring and writing it every frame */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-[400ms] ease-framer ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="min-h-0 overflow-hidden">
            {/* Indented under the question from md; full width on phones */}
            <div className="max-w-[640px] pt-3 md:pl-12">
              <p className="t-body-m text-grey-01">{noOrphan(a)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="flex justify-center px-5 py-16 md:px-10 md:py-20 lg:px-20 lg:py-[100px]"
    >
      <div className="flex w-full max-w-[1040px] flex-col items-center gap-12 md:gap-16 lg:gap-20">
        <SectionHeader number="007" name="FAQ" title="Yang sering ditanyakan" />
        <Reveal y={50} amount={0.2} className="flex w-full flex-col gap-2.5">
          {faqs.map((f, i) => (
            <FaqItem key={f.q} index={i} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
