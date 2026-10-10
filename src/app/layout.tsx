import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { Preloader } from "@/components/preloader/Preloader";
import { SmoothCursor } from "@/components/SmoothCursor";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter-family",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "webdev.co.id | Studio web lokal, standar global",
  description:
    "Webdev.co.id adalah studio pembuatan website di Indonesia. Kami membantu berbagai jenis bisnis dan institusi tampil profesional secara online lewat website modern yang cepat dan berkualitas.",
  openGraph: {
    images: ["/framer/mesMNsTTSgV6Xg1TUfNtMnEGZY.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geist.variable} ${inter.variable}`}>
      <body>
        <Preloader />
        <SmoothScroll />
        <SmoothCursor />
        {children}
      </body>
    </html>
  );
}
