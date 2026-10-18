"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { existingSite } from "@/content/home";
import { waLink } from "@/content/site";
import { noOrphan } from "@/lib/text";
import { LineIcon } from "../LineIcon";
import { bentoCard } from "./surfaces";
import { RiPencilLine, RiShieldCheckLine } from "@remixicon/react";

/** The cards' icons (Remix Icon). */
const icons = { pencil: RiPencilLine, shield: RiShieldCheckLine };

const ease = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

/**
 * "Butuhnya bukan website baru?": two cards that open WhatsApp. Exactly one preview screen is up at a
 * time: the first card's rests up, hovering (or focusing) the other hands it over, leaving hands it back.
 * The screens are illustrations passed in as `previews`, in card order. They're only mounted once the cards
 * come near the screen (they're decorative SVGs, absolutely placed, so nothing shifts), which keeps them out of
 * the page's first render.
 */
export function ExistingSite({ previews }: { previews: ReactNode[] }) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="flex flex-col gap-2 md:grid md:grid-cols-2">
      {existingSite.items.map((item, i) => {
        const up = shown === i;
        return (
          <a
            key={item.title}
            href={waLink(item.message)}
            target="_blank"
            rel="noreferrer"
            onPointerEnter={(e) => e.pointerType === "mouse" && setShown(i)}
            onPointerLeave={(e) => e.pointerType === "mouse" && setShown(0)}
            onFocus={() => setShown(i)}
            onBlur={() => setShown(0)}
            className={`${bentoCard} group relative flex min-h-[184px] flex-col justify-between gap-8 overflow-hidden p-6 transition-colors duration-300 hover:bg-white md:p-8`}
          >
            {/* The screen rises inside the card from below its bottom-right corner, tilted */}
            <span aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
              <span
                className={`absolute top-full -right-6 block w-[min(46%,272px)] rotate-[-8deg] transition-[translate] ${ease} ${
                  up ? "-translate-y-[calc(100%-0.75rem)]" : "translate-y-6"
                }`}
              >
                <span className="block overflow-hidden rounded-xl border border-white shadow-[0_18px_40px_-12px_rgba(1,31,108,0.35)]">{near && previews[i]}</span>
              </span>
            </span>

            {/* Icon left, arrow right. The arrow shows on the card that isn't showing its screen
                (below sm there are no screens, so both keep it). */}
            <span className="relative flex items-start justify-between">
              {(() => {
                const I = icons[item.icon];
                return <I size={22} aria-hidden className="text-grey-01" />;
              })()}
              <span
                className={`flex size-9 items-center justify-center rounded-full bg-white text-grey-01 shadow-[var(--shadow-card)] transition-opacity duration-300 ease-out ${up ? "sm:opacity-0" : ""}`}
              >
                <LineIcon name="arrow-up-right" size={11} />
              </span>
            </span>
            <span className="relative flex flex-col gap-1.5 sm:max-w-[54%]">
              <span className="t-title-s text-grey-01">{item.title}</span>
              <span className="t-body-m text-grey-03">{noOrphan(item.text)}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
