import Image from "next/image";
import { integrations } from "@/content/home";
import { waLink } from "@/content/site";
import { Reveal } from "../motion";
import { SectionHeader } from "../SectionHeader";
import { Ticker } from "../Ticker";

function Item({ title, logo }: (typeof integrations)[number]) {
  return (
    <div className="flex h-16 w-40 shrink-0 items-center justify-between gap-16 overflow-hidden rounded-2xl border border-grey-07 bg-grey-08 p-4 shadow-[inset_0_0_1px_2px_#fff,inset_0_-2px_2px_0_rgba(0,0,0,0.12)] md:h-[88px] md:w-60 md:p-6">
      <span className="t-body-m-medium whitespace-nowrap text-grey-03 md:t-body-l-medium">{title}</span>
      <Image src={logo} alt="" width={40} height={40} className="h-6 w-8 object-contain md:size-10" />
    </div>
  );
}

const rows = [
  { speed: 100, direction: "left" },
  { speed: 90, direction: "right" },
  { speed: 110, direction: "left" },
] as const;

export function Integrations() {
  return (
    <section id="intergration" className="flex justify-center overflow-hidden py-16 md:py-20 lg:py-[100px]">
      <div className="flex w-full max-w-[1920px] flex-col items-center gap-12 md:gap-16 lg:gap-20">
        <div className="w-full px-5 md:px-[60px] lg:px-20">
          <SectionHeader number="006" name="satu pintu" title="Semua kami urus" />
        </div>

        <div className="flex w-full flex-col items-center gap-10">
          <div className="relative flex w-full items-center justify-center">
            <Reveal y={50} amount={0.3} className="flex w-full flex-col gap-1 bg-white">
              {rows.map((r) => (
                <Ticker key={r.speed} speed={r.speed} direction={r.direction} gap={4}>
                  {integrations.map((it) => (
                    <Item key={it.title} {...it} />
                  ))}
                </Ticker>
              ))}
            </Reveal>

            <div className="absolute top-1/2 left-1/2 z-[3] -translate-x-1/2 -translate-y-1/2">
              <div
                aria-hidden
                className="absolute top-1/2 left-1/2 size-[234px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[20px]"
                style={{
                  background:
                    "radial-gradient(50% 50% at 50% 50%, var(--color-holo-100) 0%, var(--color-holo-75) 25%, var(--color-holo-50) 70%, var(--color-holo-25) 100%)",
                }}
              />
              <a
                href={waLink()}
                target="_blank"
                rel="noreferrer"
                className="group relative flex size-[180px] flex-col items-center justify-center gap-2 overflow-hidden rounded-full border border-white p-4 shadow-[inset_0_0_40px_1px_rgba(255,255,255,0.5),inset_0_0_8px_1px_#fff] transition-shadow duration-300 hover:shadow-[inset_0_0_40px_1px_#fff,inset_0_0_8px_1px_#fff]"
              >
                <span className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-grey-00)_0%,var(--color-grey-03)_100%)]" />
                <span className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-grey-01)_0%,var(--color-grey-03)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <Image src="/framer/yGoZAzR8EIAGLasEyJ03Xy7Alak.png" alt="" width={50} height={50} className="relative size-[50px]" />
                <span className="t-body-m relative text-center text-white">Konsultasi Gratis</span>
              </a>
            </div>
          </div>

          <div className="w-full max-w-[640px] px-5">
            <Reveal>
              <p className="t-body-l text-center text-grey-03">
                Dari desain, konten, domain, sampai perawatan rutin, semuanya kami urus di satu tempat. Kamu cukup fokus ke bisnis.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
