import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Preloader } from "@/components/preloader/Preloader";
import { SmoothCursor } from "@/components/SmoothCursor";
import { SmoothScroll } from "@/components/SmoothScroll";
import { contact, siteName, siteUrl } from "@/content/site";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const title = "webdev.co.id | Studio web lokal, standar global";
const description =
  "Webdev.co.id adalah studio pembuatan website di Indonesia. Kami membantu berbagai jenis bisnis dan institusi tampil profesional secara online lewat website modern yang cepat dan berkualitas.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: siteName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    locale: "id_ID",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "light",
};

/** Organization data for search engines. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  description,
  areaServed: "ID",
  sameAs: [contact.instagramUrl],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: `+${contact.whatsapp}`,
    email: contact.email,
    contactType: "customer service",
    availableLanguage: ["Indonesian"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={geist.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <Preloader />
        <SmoothScroll />
        <SmoothCursor />
        {children}
      </body>
    </html>
  );
}
