import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";

const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Studio · webdev.co.id",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#050507", colorScheme: "dark" };

/** /admin: the team's Studio, outside the public site's chrome (see (site)/layout.tsx). */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className={mono.variable}>{children}</div>;
}
