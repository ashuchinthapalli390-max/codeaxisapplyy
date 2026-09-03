import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/offer/respond"],
    },
    sitemap: "https://www.codeaxisapply.xyz/sitemap.xml",
  };
}
