import data from "./case-studies.json";

/** Real websites built by webdev.co.id. Images are still the template's for now. */
export type CaseStudy = {
  slug: string;
  title: string;
  client: string;
  type: string;
  domain: string;
  url: string;
  description: string;
  overview: string;
  image: string;
  logo: string;
  stats: { value: string; label: string }[];
};

export const caseStudies: CaseStudy[] = data;
