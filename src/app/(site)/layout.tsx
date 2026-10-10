import { SiteFooter } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

/** Framer's default layout template: fixed navbar on top, footer at the bottom. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      {/* Above the footer, whose background reaches up behind the FAQ */}
      <main className="relative z-[1] flex flex-col overflow-clip">{children}</main>
      <SiteFooter />
    </>
  );
}
