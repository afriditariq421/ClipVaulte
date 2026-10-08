import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return ["", "/privacy", "/terms"].map((path) => ({ url: `${base}${path}`, changeFrequency: "monthly" }));
}
