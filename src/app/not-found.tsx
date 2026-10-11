import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Footer, FooterSection } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan | webdev.co.id",
  robots: { index: false },
};

const digit = "w-[40%] text-center text-[clamp(150px,24vw,400px)] leading-none font-semibold tracking-[-0.08em]";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main>
        <FooterSection>
          <div className="flex flex-col gap-20 pt-[100px]">
            <div className="min-h-screen-safe relative flex flex-col items-center justify-center">
              <div className="relative flex w-full items-center justify-center gap-8 md:w-1/2 md:gap-32">
                <span className={`${digit} text-white-05`}>4</span>
                <span
                  className={`${digit} absolute top-1/2 left-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 bg-clip-text text-transparent`}
                  style={{ backgroundImage: "linear-gradient(0deg, var(--color-holo-25) 0%, var(--color-holo-50) 45%, var(--color-holo-75) 100%)" }}
                >
                  0
                </span>
                <span className={`${digit} text-white-05`}>4</span>
                <div className="absolute top-1/2 left-1/2 z-[3] -translate-x-1/2 -translate-y-1/2">
                  <Button href="/">Kembali ke Beranda</Button>
                </div>
              </div>
              <p className="t-title-s mt-16 text-center text-white">Halaman yang kamu cari tidak&nbsp;ditemukan.</p>
            </div>
            <Footer />
          </div>
        </FooterSection>
      </main>
    </>
  );
}
