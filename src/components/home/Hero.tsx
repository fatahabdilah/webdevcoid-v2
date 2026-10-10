import { Button } from "../Button";
import { Reveal, Words, easeFramer } from "../motion";
import { PlaygroundBg } from "../PlaygroundBg";
import { CursorDrivenParticleTypography } from "../ui/cursor-driven-particle-typography";

// Client logos hidden for now. To restore, re-import Logo1–Logo7 from "../icons"
// and Ticker from "../Ticker", then uncomment this and the ticker block below.
// const logos = [Logo1, Logo2, Logo3, Logo4, Logo5, Logo6, Logo7];

export function Hero() {
  return (
    <section className="relative flex flex-col items-center overflow-clip bg-black">
      {/* Animated ASCII background + a dark veil behind the copy */}
      <div aria-hidden className="absolute inset-0 z-0">
        <PlaygroundBg />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(48%_34%_at_50%_50%,rgba(0,0,0,0.62),rgba(0,0,0,0.3)_55%,rgba(0,0,0,0)_100%)]" />
      </div>

      <div className="relative z-[1] flex h-svh min-h-[640px] w-full flex-col items-center px-5 md:h-[1080px] md:px-10 lg:h-screen lg:px-20">
        <div className="flex h-full w-full max-w-[1280px] flex-col items-center justify-center pt-20">
          <div className="flex w-full flex-col items-center gap-6 lg:gap-8">
            <div className="flex w-full flex-col items-center gap-6">
              {/* Tagline badge hidden for now. To restore, re-import Sparkle from "../icons" and uncomment.
              <Reveal onMount y={40} delay={1.5}>
                <div className="flex items-center gap-2 rounded-full border border-white-06 px-4 py-2">
                  <Sparkle width={16} height={16} className="text-white" />
                  <span className="t-caption text-white">Studio web lokal, standar global</span>
                </div>
              </Reveal>
              */}
              <div className="flex w-full flex-col items-center gap-6">
                <Reveal onMount y={40} delay={0.2} transition={{ duration: 1, ease: easeFramer }} className="w-full">
                  {/* Real heading for SEO / screen readers; the particle canvas below draws it visually. */}
                  <h1 className="sr-only">Bisnis kamu, online. Tanpa ribet.</h1>
                  <div aria-hidden className="text-white">
                    <CursorDrivenParticleTypography text={"Bisnis kamu,\n**online.**\nTanpa ribet."} fontSize={44} fontWeight={300} emphasisWeight={500} particleDensity={1.5} particleSize={0.7} dispersionStrength={6} interactionRadius={70} lineHeight={0.9} className="-my-7 h-44 md:hidden" />
                    <CursorDrivenParticleTypography text={"Bisnis kamu, **online.**\nTanpa ribet."} fontSize={80} fontWeight={200} emphasisWeight={500} particleDensity={2} particleSize={1} dispersionStrength={6} interactionRadius={70} lineHeight={0.9} className="-my-10 hidden h-55 md:block" />
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
              {/* Portfolio button hidden for now.
              <Reveal onMount y={20} delay={0.8}>
                <Button href="/#project" variant="secondary">
                  Lihat Portfolio
                </Button>
              </Reveal>
              */}
            </div>
          </div>
        </div>
      </div>

      {/* Client logo ticker hidden for now.
      <div className="relative z-[2] w-full bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,var(--color-grey-05)_100%)] px-0 pt-8 pb-6 md:px-[60px] lg:px-20">
        <Ticker speed={50} gap={80} className="mx-auto h-8 max-w-[1280px]">
          {logos.map((Logo, i) => (
            <Logo key={i} className="h-8 w-auto text-white" />
          ))}
        </Ticker>
      </div>
      */}
    </section>
  );
}
