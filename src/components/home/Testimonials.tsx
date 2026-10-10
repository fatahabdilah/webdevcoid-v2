import Image from "next/image";
import { testimonialColumns, type Testimonial } from "@/content/home";
import { Play } from "../icons";
import { Reveal } from "../motion";
import { SectionHeader } from "../SectionHeader";

function QuoteCard({ t }: { t: Extract<Testimonial, { kind: "quote" }> }) {
  return (
    <figure className="flex w-full flex-col gap-10 overflow-hidden rounded-2xl bg-grey-08 p-10">
      <div className="relative flex flex-col gap-4">
        <Image src={t.avatar} alt="" width={80} height={80} className="size-20 rounded-full object-cover" />
        <figcaption className="flex flex-col gap-1">
          <span className="t-body-m-semibold text-grey-01">{t.name}</span>
          <span className="t-body-m text-grey-03">{t.role}</span>
        </figcaption>
        <Image src="/framer/XZPB5Ggowpq8oDHAS6cc7FQYLc.png" alt="" width={25} height={24} className="absolute top-0 right-0 h-6 w-[25px]" />
      </div>
      <blockquote className="t-body-l text-grey-01">{t.quote}</blockquote>
    </figure>
  );
}

function VideoCard({ t }: { t: Extract<Testimonial, { kind: "video" }> }) {
  return (
    <div className="group relative flex h-[490px] w-full flex-col justify-between gap-16 overflow-hidden rounded-2xl p-8 grayscale transition-[filter,box-shadow] duration-[400ms] hover:shadow-[inset_0_0_40px_0_#fff] hover:grayscale-0">
      <Image src={t.image} alt="" fill sizes="(min-width: 1200px) 420px, 340px" className="object-cover" />
      <a
        href={t.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Lihat karya: ${t.title}`}
        className="relative z-[2] flex size-12 items-center justify-center rounded-full bg-white-04 text-white shadow-[inset_0_0_12px_0_#fff] transition-colors duration-300 hover:bg-grey-05"
      >
        <Play width={24} height={24} />
      </a>
      <div className="relative z-[2] flex flex-col gap-6">
        <Image src={t.logo} alt="Logo" width={159} height={32} className="h-8 w-[159px]" />
        <p className="t-title-l text-white">{t.title}</p>
      </div>
    </div>
  );
}

const delays = [
  [0.2, 0.4, 0.6],
  [0, 0.3, 0.5],
  [0.2, 0.4, 0.6],
];

export function Testimonials() {
  return (
    <section id="testimonial" className="flex justify-center py-16 md:py-20 lg:px-20 lg:py-[100px]">
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-12 md:gap-16 lg:gap-20">
        <div className="w-full px-5 md:px-[60px] lg:px-0">
          <SectionHeader number="007" name="untuk siapa" title="Tiap proyek beda ukuran, standarnya satu" />
        </div>
        <div className="no-scrollbar flex w-full items-start gap-2.5 overflow-x-auto px-5 md:px-10 lg:gap-2 lg:overflow-visible lg:px-0">
          {testimonialColumns.map((col, ci) => (
            <div key={ci} className={`flex items-start gap-2.5 max-lg:contents lg:flex-1 lg:flex-col ${ci !== 1 ? "lg:pt-20" : ""}`}>
              {col.map((t, i) => (
                <Reveal key={i} y={50} delay={delays[ci][i]} amount={0.2} className="w-[340px] shrink-0 lg:w-full">
                  {t.kind === "video" ? <VideoCard t={t} /> : <QuoteCard t={t} />}
                </Reveal>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
