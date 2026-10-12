/** Real websites built by webdev.co.id, shown in the portfolio slider. */
export type Project = {
  slug: string;
  title: string;
  type: string;
  /** Shown after the type on the card: the site's domain, or just the name when the address isn't the client's own. */
  domain: string;
  url: string;
  description: string;
  image: string;
  stats: { value: string; label: string }[];
};

export const projects: Project[] = [
  {
    slug: "arifsyauqi",
    title: "Arif Syauqi, Wedding Videographer & Editor",
    type: "Personal brand",
    domain: "arifsyauqi.com",
    url: "https://arifsyauqi.com",
    description: "Website portofolio untuk videografer pernikahan, menampilkan film dengan tampilan yang tenang dan sinematik.",
    image: "/images/portfolio/arifsyauqi.jpg",
    stats: [
      { value: "Video", label: "Film diputar di halaman" },
      { value: "3 kategori", label: "Wedding, commercial, personal" },
    ],
  },
  {
    slug: "michaelutomo",
    title: "Michael Utomo, Branding & Graphic Designer",
    type: "Personal brand",
    domain: "michaelutomo",
    url: "https://michaelutomo.framer.ai",
    description: "Website portofolio untuk desainer grafis, menampilkan karya branding dengan tampilan yang bersih dan berkarakter.",
    image: "/images/portfolio/michaelutomo.jpg",
    stats: [
      { value: "Studi kasus", label: "Halaman khusus tiap proyek" },
      { value: "Galeri", label: "Karya branding & visual" },
    ],
  },
];
