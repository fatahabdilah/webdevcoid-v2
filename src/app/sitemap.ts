import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";

/** The site is a single page. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl, changeFrequency: "monthly", priority: 1 }];
}
