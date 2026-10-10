/** Real websites built by webdev.co.id, shown in the portfolio slider. */
export type Project = {
  slug: string;
  title: string;
  type: string;
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
    description: "Website portofolio untuk videografer pernikahan, menampilkan film dan karya dengan tampilan yang tenang dan sinematik.",
    image: "/images/portfolio/arifsyauqi.jpg",
    stats: [
      { value: "Custom", label: "Desain dari nol" },
      { value: "Online", label: "Sudah tayang" },
    ],
  },
  {
    slug: "michaelutomo",
    title: "Michael Utomo, Branding & Graphic Designer",
    type: "Personal brand",
    domain: "michaelutomo.framer.ai",
    url: "https://michaelutomo.framer.ai",
    description: "Website portofolio untuk desainer grafis, menampilkan karya branding dan identitas visual dengan tampilan yang bersih dan berkarakter.",
    image: "/images/portfolio/michaelutomo.jpg",
    stats: [
      { value: "Custom", label: "Desain dari nol" },
      { value: "Online", label: "Sudah tayang" },
    ],
  },
];
