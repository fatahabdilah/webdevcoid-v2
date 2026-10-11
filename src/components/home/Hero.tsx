import { Button } from "../Button";
import { Reveal, Words, easeFramer } from "../motion";
import { AsciiBackground } from "../AsciiBackground";
import { ParticleText } from "../ParticleText";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center overflow-clip bg-black">
      {/* Animated ASCII background + a dark veil behind the copy */}
      <div aria-hidden className="absolute inset-0 z-0">
        <AsciiBackground />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(48%_34%_at_50%_50%,rgba(0,0,0,0.62),rgba(0,0,0,0.3)_55%,rgba(0,0,0,0)_100%)]" />
      </div>

      <div className="h-screen-safe relative z-[1] flex min-h-[640px] w-full flex-col items-center px-5 md:px-10 lg:px-20">
        <div className="flex h-full w-full max-w-[1280px] flex-col items-center justify-center pt-20">
          <div className="flex w-full flex-col items-center gap-6 lg:gap-8">
            <div className="flex w-full flex-col items-center gap-6">
              <div className="flex w-full flex-col items-center gap-6">
                <Reveal onMount y={40} delay={0.2} transition={{ duration: 1, ease: easeFramer }} className="w-full">
                  {/* Real heading for SEO / screen readers; the particle canvas below draws it visually. */}
                  <h1 className="sr-only">Bisnis kamu, online. Tanpa ribet.</h1>
                  <div aria-hidden className="text-white">
                    <ParticleText text={"Bisnis kamu,\n**online.**\nTanpa ribet."} fontSize={44} fontWeight={300} emphasisWeight={500} particleDensity={1.5} particleSize={0.7} dispersionStrength={6} interactionRadius={70} lineHeight={0.9} className="-my-7 h-44 md:hidden" />
                    <ParticleText text={"Bisnis kamu, **online.**\nTanpa ribet."} fontSize={80} fontWeight={200} emphasisWeight={500} particleDensity={2} particleSize={1} dispersionStrength={6} interactionRadius={70} lineHeight={0.9} className="-my-10 hidden h-55 md:block" />
                  </div>
                </Reveal>
                <Words
                  as="p"
                  onMount
                  text={"Dari desain sampai online, kami urus semuanya.\nKamu fokus ke bisnis."}
                  className="t-body-l w-full max-w-[640px] text-center text-white-02"
                  delay={0.5}
                  stagger={0.05}
                  blur={10}
                  transition={{ type: "spring", stiffness: 400, damping: 100, mass: 1 }}
                />
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 md:w-auto md:flex-row md:gap-2">
              <Reveal onMount y={20} delay={0.6}>
                <Button href="/#pricing" arrow>
                  Lihat Harga
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
