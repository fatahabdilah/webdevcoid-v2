import { featuredService, included, services } from "@/content/home";
import { waLink } from "@/content/site";
import { Button } from "../Button";
import { CtaAvatar } from "../CtaAvatar";
import { Check } from "../icons";
import { Reveal } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { Lines } from "../Lines";
import { IncludedIcon } from "./IncludedIcon";
import { CompanyProfileArt, LandingPageArt, MaintenanceArt, OnlineStoreArt, WebAppArt } from "./ServiceArt";
import { noOrphan } from "@/lib/text";

const card = "rounded-2xl border border-grey-07 bg-grey-09 shadow-[var(--shadow-card)]";

function ServiceText({ title, text }: { title: string; text: string }) {
  return (
    <p className="t-body-m text-grey-01">
      <strong className="font-semibold">{title}</strong> {text}
    </p>
  );
}

function FeaturedCard() {
  return (
    <div className={`${card} flex h-full w-full flex-col justify-between overflow-hidden p-10`}>
      <div className="flex flex-col gap-3 pb-6">
        <ServiceText title={featuredService.title} text={featuredService.text} />
        <ul className="flex flex-col gap-1.5">
          {featuredService.checks.map((c) => (
            <li key={c} className="flex items-center gap-1 text-grey-03">
              <Check width={16} height={16} />
              <span className="t-body-s">{noOrphan(c)}</span>
            </li>
          ))}
        </ul>
      </div>
      <CompanyProfileArt />
    </div>
  );
}

const arts = { landing: LandingPageArt, store: OnlineStoreArt, webapp: WebAppArt, maintenance: MaintenanceArt };

function ServiceCard({ title, text, art }: (typeof services)[number]) {
  const Art = arts[art];
  return (
    <div className={`${card} flex h-full w-full flex-col justify-between gap-10 overflow-hidden p-10`}>
      <div className="pb-6">
        <ServiceText title={title} text={text} />
      </div>
      <Art />
    </div>
  );
}

function CtaCard() {
  return (
    <div
      className="flex h-full w-full flex-col justify-center gap-10 rounded-2xl border border-grey-07 p-8 md:p-10 shadow-[inset_0_0_1px_0_rgba(255,255,255,0.3),inset_0_-2px_1px_0_rgba(0,0,0,0.12),inset_0_0_40px_0_rgba(255,255,255,0.15)] lg:justify-between lg:gap-12"
      style={{ backgroundImage: "var(--holo-radial)" }}
    >
      <Reveal y={50} className="flex flex-col gap-6">
        <CtaAvatar image="/images/avatars/cta-services.png" />
        <div className="flex flex-col gap-2 md:max-w-[80%] lg:max-w-none">
          <h3 className="t-title-m text-balance text-white">Bingung mulai dari&nbsp;mana?</h3>
          <p className="t-body-m text-white-02">
            Konsultasi gratis dulu.
            <br />
            Kami bantu tentukan jenis website yang paling pas untuk bisnis kamu, tanpa&nbsp;komitmen.
          </p>
        </div>
      </Reveal>
      <div>
        <Button href={waLink()} arrow>
          Konsultasi Gratis
        </Button>
      </div>
    </div>
  );
}

function IncludedCard() {
  return (
    <div className="flex h-full w-full flex-col items-center gap-6 rounded-2xl border border-grey-07 bg-grey-09 px-4 py-10 shadow-[inset_0_0_1px_0_#fff,inset_0_-2px_1px_0_rgba(0,0,0,0.12)] md:items-start md:gap-10 md:p-10 lg:justify-between lg:px-8">
      <h3 className="t-title-s w-full text-center text-grey-01 md:w-auto md:text-left">Sudah termasuk di setiap&nbsp;harga.</h3>
      <div className="grid w-full grid-cols-2 gap-2 md:flex">
        {included.map((s) => (
          <div
            key={s.label}
            className="flex h-[220px] min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-xl bg-[linear-gradient(180deg,rgba(86,161,247,0)_0%,var(--color-holo-75)_100%)] p-4 shadow-[inset_0_0_24px_0_#fff] max-md:px-3 md:h-60 md:px-3 md:py-6 lg:justify-between"
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
          body="Kamu yang tahu bisnismu. Kami yang mengurus desain, teknis, dan isinya."
        />

        <div className="flex w-full max-w-[400px] flex-col gap-2 md:max-w-none">
          {/* Row 1: featured card + 2×2 grid */}
          <div className="flex flex-col gap-2 lg:h-[648px] lg:flex-row lg:gap-2.5">
            <Reveal y={50} delay={0.2} amount={0.2} className="md:hidden lg:block lg:w-[40%] lg:shrink-0">
              <FeaturedCard />
            </Reveal>
            <div className="flex flex-col gap-2 md:grid md:grid-cols-2 lg:flex-1 lg:grid-rows-2">
              <Reveal y={50} amount={0.2} className="hidden md:row-span-2 md:block lg:hidden">
                <FeaturedCard />
              </Reveal>
              {services.map((s, i) => (
                <Reveal key={i} y={50} delay={[0.2, 0.3, 0.25, 0.35][i]} amount={0.2} className="lg:min-h-0">
                  <ServiceCard {...s} />
                </Reveal>
              ))}
            </div>
          </div>

          {/* Row 2: CTA + what every plan includes (that comes first below desktop) */}
          <div className="flex flex-col-reverse gap-2 lg:h-[420px] lg:flex-row">
            <Reveal y={50} delay={0.4} amount={0.2} className="lg:w-[40%] lg:shrink-0">
              <CtaCard />
            </Reveal>
            <Reveal y={50} delay={0.45} amount={0.2} className="lg:flex-1">
              <IncludedCard />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
