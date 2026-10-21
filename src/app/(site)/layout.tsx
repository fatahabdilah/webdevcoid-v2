import { SiteFooter } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Preloader } from "@/components/preloader/Preloader";
import { SmoothCursor } from "@/components/SmoothCursor";
import { SmoothScroll } from "@/components/SmoothScroll";

/** The site: first-load loader, smooth scroll and custom cursor; fixed navbar on top, footer at the bottom. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <SmoothCursor />
      <Navbar />
      {/* Above the footer, whose background reaches up behind the FAQ */}
      <main className="relative z-[1] flex flex-col overflow-clip">{children}</main>
      <SiteFooter />
    </>
  );
}
