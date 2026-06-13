import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/invoices", "/clients", "/settings", "/admin"] },
    sitemap: "https://swiftbill.dev/sitemap.xml",
  };
}
