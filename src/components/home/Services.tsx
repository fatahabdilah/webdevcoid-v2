import { existingSite, included } from "@/content/home";
import { ArrowButton } from "../ArrowButton";
import { CtaAvatar } from "../CtaAvatar";
import { Reveal } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { Lines } from "../Lines";
import { IncludedIcon } from "./IncludedIcon";
import { ExistingSite } from "./ExistingSite";
import { CarePreview, RedesignPreview } from "./ServiceArt";
import { ServiceSlides } from "./ServiceSlides";


/** Titles of the groups below the bento (left from md, like the cards under them). */
const groupTitle = "t-title-m md:t-title-l text-center text-grey-01 md:text-left";

function CtaCard() {
  return (
    <div
      className="flex h-full w-full flex-col justify-center gap-10 rounded-3xl border border-grey-07 p-8 md:p-10 shadow-[inset_0_0_1px_0_rgba(255,255,255,0.3),inset_0_-2px_1px_0_rgba(0,0,0,0.12),inset_0_0_40px_0_rgba(255,255,255,0.15)] lg:justify-between lg:gap-12"
      style={{ backgroundImage: "var(--holo-radial)" }}
    >
      <Reveal y={50} className="flex flex-col gap-6">
        <CtaAvatar image="/images/avatars/cta-services.png" />
        <div className="flex flex-col gap-2 md:max-w-[80%] lg:max-w-none">
          <h3 className="t-title-m text-balance text-white">Bingung mulai dari&nbsp;mana?</h3>
          <p className="t-body-m text-white-02">
            Konsultasi gratis dulu.
            <br />
            Kami bantu tentukan jenis website yang paling pas untuk bisnismu, tanpa&nbsp;komitmen.
          </p>
        </div>
      </Reveal>
      <div>
        <ArrowButton>Konsultasi Gratis</ArrowButton>
      </div>
    </div>
  );
}

function IncludedCard() {
  return (
    <div data-included="" className="flex h-full w-full flex-col items-center gap-6 rounded-3xl border border-grey-07 bg-grey-09 px-4 py-10 shadow-[inset_0_0_1px_0_#fff,inset_0_-2px_1px_0_rgba(0,0,0,0.12)] md:items-start md:gap-10 md:p-10 lg:justify-between lg:px-8">
      <div className="flex w-full flex-col gap-1 text-center md:w-auto md:text-left">
        <h3 className="t-title-m text-grey-01">Sudah termasuk di setiap&nbsp;harga</h3>
        <p className="t-body-m text-grey-03">Tanpa biaya tambahan, apa pun pilihan&nbsp;websitemu.</p>
      </div>
      <div className="grid w-full grid-cols-2 gap-2 md:flex">
        {included.map((s) => (
          <div
            key={s.label}
            className="flex h-[220px] min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-xl bg-[linear-gradient(180deg,transparent_0%,var(--color-holo-75)_100%)] p-4 shadow-[inset_0_0_24px_0_#fff] max-md:px-3 md:h-60 md:px-3 md:py-6 lg:justify-between"
          >
            <div className="flex flex-1 items-center justify-center">
              <IncludedIcon name={s.icon} />
            </div>
            {/* Fixed two-line labels: sized per breakpoint so each line fits its tile */}
            <p className="t-body-s md:t-body-m lg:t-body-s xl:t-body-m text-center whitespace-nowrap text-white max-[359px]:text-[13px]">
              <Lines text={s.label} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Services() {
  return (
    <section id="services" className="flex justify-center px-5 py-16 md:px-10 md:py-20 lg:px-20 lg:py-[100px]">
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-12 md:gap-16 lg:gap-20">
        <SectionHeader
          number="003"
          name="layanan"
          title="Website untuk setiap kebutuhan bisnis"
          body="Dari satu halaman promosi sampai sistem custom, pilih yang sesuai tujuan bisnismu."
        />

        <div className="flex w-full max-w-[400px] flex-col gap-2 md:max-w-none">
          <Reveal y={50} amount={0.15}>
            <ServiceSlides />
          </Reveal>

          {/* Right under the services: the free consultation, and what every plan includes (that comes first below desktop) */}
          {/* equal rows when stacked (from md); side by side, one 400px row, the same height as the services card above */}
          <div className="grid gap-2 md:auto-rows-fr lg:h-[400px] lg:grid-cols-[2fr_3fr]">
            <Reveal y={50} delay={0.1} amount={0.2} className="order-2 lg:order-1">
              <CtaCard />
            </Reveal>
            <Reveal y={50} delay={0.15} amount={0.2} className="order-1 lg:order-2">
              <IncludedCard />
            </Reveal>
          </div>

          {/* For businesses that already have a website */}
          <Reveal y={50} amount={0.2} className="flex flex-col gap-5 pt-14 md:pt-20 lg:pt-24">
            <h3 className={groupTitle}>{existingSite.title}</h3>
            <ExistingSite previews={[<RedesignPreview key="redesign" />, <CarePreview key="care" />]} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
