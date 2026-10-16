import Link from "next/link";
import { Reveal, Words } from "../motion";
import { SubTitle } from "../SectionHeader";
import { ValuesSystem } from "./ValuesSystem";

/**
 * "Kenapa kami" (Figma 1373:2051, adapted to webdev): the intro and the three values as a self-playing list
 * on the left, a system diagram of them on the right (ValuesSystem). Dark section; the intro sits left-aligned
 * beside the diagram, as in the design.
 */
export function Values() {
  const intro = (
    <div className="flex flex-col items-start gap-6">
      <Reveal>
        <SubTitle number="002" name="kenapa kami" tone="dark" />
      </Reveal>
      <Words as="h2" text="Kenapa webdev.co.id?" className="t-h2 text-white" gradient="var(--title-gradient)" />
      <Reveal>
        <Link
          href="/#process"
          className="t-body-m-medium inline-flex rounded-full border border-white/30 px-5 py-2.5 text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-grey-01"
        >
          Lihat cara kerja
        </Link>
      </Reveal>
    </div>
  );

  return (
    <section id="values" className="flex justify-center bg-[#101010] px-5 py-16 md:px-10 md:py-20 lg:px-20 lg:py-[100px]">
      <div className="w-full max-w-[1280px]">
        <Reveal y={40} amount={0.15}>
          <ValuesSystem intro={intro} />
        </Reveal>
      </div>
    </section>
  );
}
