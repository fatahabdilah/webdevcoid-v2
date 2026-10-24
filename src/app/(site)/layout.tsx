import { SiteFooter } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Preloader } from "@/components/preloader/Preloader";
import { SmoothCursor } from "@/components/SmoothCursor";
import { ScrollThumb } from "@/components/ScrollThumb";
import { SmoothScroll } from "@/components/SmoothScroll";

/** The site: first-load loader, smooth scroll, custom cursor and a slim scroll indicator; fixed navbar on top, footer at the bottom. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <SmoothCursor />
      <ScrollThumb />
      <Navbar />
      {/* Above the footer, whose background reaches up behind the FAQ */}
      <main className="relative z-[1] flex flex-col overflow-clip">{children}</main>
      <SiteFooter />
    </>
  );
}
