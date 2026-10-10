/** Public URL of the site, used for metadata, the sitemap and robots.txt. */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://webdev.co.id";

export const siteName = "webdev.co.id";

/** Contact details as published on webdev.co.id. */
export const contact = {
  whatsapp: "6282258096886",
  whatsappDisplay: "0822 5809 6886",
  instagram: "webdev.co.id",
  instagramUrl: "https://instagram.com/webdev.co.id",
};

/** WhatsApp chat link with a prefilled message. */
export function waLink(message = "Halo webdev.co.id, saya mau konsultasi gratis soal website.") {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
