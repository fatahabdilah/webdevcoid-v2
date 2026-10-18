import { Reveal, Words } from "./motion";
import { noOrphan } from "@/lib/text";

type Tone = "light" | "dark";

/** Lets a header change tone smoothly (pricing switches it when its ambient fades in). */
const fade = "transition-colors duration-700 ease-out";

export function SubTitle({ number, name, tone = "light" }: { number: string; name: string; tone?: Tone }) {
  const dark = tone === "dark";
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 ${fade} ${dark ? "bg-white/[0.06]" : "bg-black/[0.03]"}`}>
      <span className={`t-caption ${fade} ${dark ? "text-white/40" : "text-black/40"}`}>{number}</span>
      <span className="flex items-center gap-1">
        <span className={`size-2 rounded-full ${fade} ${dark ? "bg-white" : "bg-grey-01"}`} />
        <span className={`t-caption ${fade} ${dark ? "text-white" : "text-grey-01"}`}>{name}</span>
      </span>
    </div>
  );
}

type SectionHeaderProps = {
  number?: string;
  name?: string;
  title: string;
  body?: string;
  className?: string;
  as?: "h1" | "h2";
  /** "dark" for sections on a black background. */
  tone?: Tone;
  /** Tone of the number pill alone; defaults to `tone`. */
  pillTone?: Tone;
  /** Title measure (an em-based max-width class), to choose where a title breaks. */
  titleWidth?: string;
  /** Gradient title text; defaults to on for the dark tone. Off gives plain white, which can fade between tones. */
  titleGradient?: boolean;
};

/** Sub title pill + word-by-word heading + optional paragraph, centered. */
export function SectionHeader({
  number,
  name,
  title,
  body,
  className = "",
  as = "h2",
  tone = "light",
  pillTone = tone,
  titleWidth = "max-w-[14.5em]",
  titleGradient,
}: SectionHeaderProps) {
  const dark = tone === "dark";
  const gradient = titleGradient ?? dark;
  return (
    <div className={`flex w-full flex-col items-center gap-6 text-center ${className}`}>
      {number && name && (
        <Reveal>
          <SubTitle number={number} name={name} tone={pillTone} />
        </Reveal>
      )}
      <div className="flex w-full flex-col items-center gap-4">
        {/* em-based measure: long titles wrap into two balanced lines at every breakpoint */}
        <Words
          as={as}
          text={title}
          className={`t-h2 w-full ${titleWidth} ${fade} ${dark ? "text-white" : "text-grey-01"}`}
          gradient={gradient ? "var(--title-gradient)" : undefined}
        />
        {body && (
          <Reveal className="w-full max-w-[640px]">
            <p className={`t-body-l ${fade} ${dark ? "text-white-03" : "text-grey-03"}`}>{noOrphan(body)}</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}
