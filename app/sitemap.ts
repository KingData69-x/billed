import type { MetadataRoute } from "next";
import { PROFESSIONS } from "@/lib/professions";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://swiftbill.dev";
  const now = new Date();

  const static_pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/demo`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/press`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const profession_pages: MetadataRoute.Sitemap = PROFESSIONS.map((p) => ({
    url: `${base}/invoice-generator/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...static_pages, ...profession_pages];
}
