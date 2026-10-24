import { included } from "@/content/home";
import { ArrowButton } from "../ArrowButton";
import { CtaAvatar } from "../CtaAvatar";
import { Reveal } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { Lines } from "../Lines";
import { IncludedIcon } from "./IncludedIcon";
import { ServiceBento } from "./ServiceBento";
import { cardTitle, cardWords } from "./surfaces";

function CtaCard() {
  return (
    <div
      className="flex h-full w-full flex-col justify-center gap-10 rounded-3xl border border-grey-07 p-8 md:p-10 shadow-[inset_0_0_1px_0_rgba(255,255,255,0.3),inset_0_-2px_1px_0_rgba(0,0,0,0.12),inset_0_0_40px_0_rgba(255,255,255,0.15)] lg:justify-between lg:gap-12"
      style={{ backgroundImage: "var(--holo-radial)" }}
    >
      <Reveal y={50} className="flex flex-col gap-6">
        <CtaAvatar image="/images/avatars/cta-services.png" />
        <div className={`${cardWords} md:max-w-[80%] lg:max-w-none`}>
          <h3 className={`${cardTitle} text-white`}>Bingung mulai dari&nbsp;mana?</h3>
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
    <div data-included="" className="flex h-full w-full flex-col items-center gap-6 rounded-3xl border border-grey-07 bg-grey-09 px-4 pt-10 pb-4 shadow-[inset_0_0_1px_0_#fff,inset_0_-2px_1px_0_rgba(0,0,0,0.12)] md:items-start md:p-10 lg:justify-between">
      <div className={`${cardWords} w-full text-center md:w-auto md:text-left`}>
        <h3 className={`${cardTitle} text-grey-01`}>Sudah termasuk di setiap&nbsp;harga</h3>
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
          <Reveal y={50} amount={0.1}>
            <ServiceBento />
          </Reveal>

          {/* Under the services, on the same three columns: the free consultation, and what every plan includes across
              the other two (that comes first below desktop; equal rows when stacked from md) */}
          <div className="grid gap-2 md:auto-rows-fr lg:h-[400px] lg:grid-cols-3">
            <Reveal y={50} delay={0.1} amount={0.2} className="order-2 lg:order-1">
              <CtaCard />
            </Reveal>
            <Reveal y={50} delay={0.15} amount={0.2} className="order-1 lg:order-2 lg:col-span-2">
              <IncludedCard />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
